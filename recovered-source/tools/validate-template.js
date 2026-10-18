#!/usr/bin/env node
/**
 * validate-template.js —— 检查 .vue 模板里引用了「不存在的变量」
 *
 * 背景：反编译器是照 webpack render 里的 `expression` 元数据还原模板的，
 * 而 `expression` 与真实绑定偶尔不一致（原作者遗留），
 * 于是模板里会出现未定义的标识符，例如：
 *   v-model="v.aModel"        （v 不存在，应为 i）
 *   :value="qnDesc"           （缺 v-for 别名前缀，应为 t.qnDesc）
 * 这类错误在构建期完全静默，但运行时会抛 TypeError 并中断整段渲染，
 * 表现是「列表空」「下拉框不显示」等。
 *
 * 它在 `validate-src.js` 的盲区里 —— 那个只检查 <script> 的作用域。
 *
 * 做法：
 *   1. vue-template-compiler 解析模板成 AST；
 *   2. 维护 v-for / slot-scope 的作用域栈；
 *   3. 用 Babel 把每个表达式解析成 AST，收集其中的「自由标识符」；
 *   4. 与组件选项（data/computed/methods/props）及白名单比对。
 *
 * 用法：node tools/validate-template.js [--verbose]
 */

const fs = require('fs');
const path = require('path');
const compiler = require('vue-template-compiler');
const babel = require('@babel/parser');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const VERBOSE = process.argv.includes('--verbose');

/** JS 内置与浏览器全局，模板里出现是合法的 */
const GLOBALS = new Set([
  'true', 'false', 'null', 'undefined', 'this',
  'Math', 'JSON', 'Date', 'Number', 'String', 'Boolean', 'Object', 'Array',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI',
  'URL', 'Blob', 'File', 'FileReader', 'FormData', 'Buffer',
  'document', 'window', 'navigator', 'location', 'localStorage', 'sessionStorage',
  'console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'Promise', 'Symbol', 'Map', 'Set', 'RegExp', 'Error', 'Image', 'Audio',
  'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle',
  'process', 'require', '__dirname',
]);

/* ------------------------------------------------------------------ *
 * 组件选项里的可用名字
 * ------------------------------------------------------------------ */

/** 从 <script> 里抽取 data/computed/methods/props 的键 */
function collectComponentKeys(scriptContent) {
  const keys = new Set();
  if (!scriptContent) return keys;

  let ast;
  try {
    ast = babel.parse(scriptContent, {
      sourceType: 'module',
      plugins: ['objectRestSpread', 'optionalChaining', 'classProperties'],
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    });
  } catch (e) {
    return keys;
  }

  // 找 export default { ... } 或 const X = {...}; export default X
  let options = null;
  let named = null;
  for (const node of ast.program.body) {
    if (node.type === 'ExportDefaultDeclaration') {
      if (node.declaration.type === 'ObjectExpression') options = node.declaration;
      else if (node.declaration.type === 'Identifier') named = node.declaration.name;
    }
    if (node.type === 'VariableDeclaration') {
      for (const d of node.declarations) {
        if (named && d.id.name === named && d.init && d.init.type === 'ObjectExpression') {
          options = d.init;
        }
      }
    }
  }
  if (!options) return keys;

  const keyName = (prop) => {
    if (!prop.key) return null;
    if (prop.key.type === 'Identifier') return prop.key.name;
    if (prop.key.type === 'StringLiteral') return prop.key.value;
    return null;
  };

  /**
   * 从对象表达式里取所有键。
   * 同时处理 `...mapState(["a","b"])` / `...mapState({a: s => s.a})`
   * 这类展开——它们的键是运行时注入的，静态也要算作可用。
   */
  const takeKeys = (obj) => {
    if (!obj || obj.type !== 'ObjectExpression') return;
    for (const p of obj.properties) {
      if (p.type === 'SpreadElement') {
        const arg = p.argument;
        if (arg && arg.type === 'CallExpression') {
          const first = arg.arguments && arg.arguments[0];
          if (first && first.type === 'ArrayExpression') {
            for (const el of first.elements) {
              if (el && el.type === 'StringLiteral') keys.add(el.value);
            }
          } else if (first && first.type === 'ObjectExpression') {
            takeKeys(first);
          }
        }
        continue;
      }
      const k = keyName(p);
      if (k) keys.add(k);
    }
  };

  for (const prop of options.properties) {
    const name = keyName(prop);
    if (!name) continue;

    if (name === 'data') {
      // data() { return {...} } 是 ObjectMethod（没有 .value！）
      // data: function () {...} 是 ObjectProperty
      const fn = prop.type === 'ObjectMethod' ? prop : prop.value;
      const body = fn && (fn.body || (fn.body && fn.body.body));
      const stmts = fn && fn.body ? (fn.body.body || []) : [];
      for (const st of stmts) {
        if (st.type === 'ReturnStatement' && st.argument && st.argument.type === 'ObjectExpression') {
          takeKeys(st.argument);
        }
      }
      void body;
    } else if (name === 'computed' || name === 'methods' || name === 'props') {
      if (prop.type === 'ObjectMethod') {
        // 极少见：computed() { ... }，忽略
      } else {
        takeKeys(prop.value);
      }
    }
  }

  // Vue 内置
  return keys;
}

/* ------------------------------------------------------------------ *
 * 表达式 → 自由标识符
 * ------------------------------------------------------------------ */

/**
 * 收集表达式里的自由标识符。
 * 跳过：成员访问的 property（a.b 的 b）、对象字面量的 key、
 *       函数参数与局部变量声明、字面量。
 */
function freeIdentifiers(expr) {
  if (typeof expr !== 'string' || !expr.trim()) return [];

  let ast;
  try {
    ast = babel.parseExpression(expr, {
      plugins: ['objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator'],
    });
  } catch (e) {
    return [];
  }

  const found = new Set();
  const declared = new Set();

  // 先收集函数参数名（简单处理：所有参数都算局部）
  const collectParams = (fnNode) => {
    for (const p of fnNode.params || []) {
      const walkParam = (n) => {
        if (!n) return;
        if (n.type === 'Identifier') declared.add(n.name);
        else if (n.type === 'ObjectPattern') n.properties.forEach((pr) => walkParam(pr.value || pr.argument));
        else if (n.type === 'ArrayPattern') n.elements.forEach(walkParam);
        else if (n.type === 'AssignmentPattern') walkParam(n.left);
        else if (n.type === 'RestElement') walkParam(n.argument);
      };
      walkParam(p);
    }
  };

  const visit = (node, parent, key) => {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) { node.forEach((n) => visit(n, parent, key)); return; }

    switch (node.type) {
      case 'Identifier':
        // 跳过成员访问的属性、对象 key、参数、局部声明
        if (parent) {
          if (parent.type === 'MemberExpression' && key === 'property' && !parent.computed) return;
          if ((parent.type === 'ObjectProperty' || parent.type === 'Property') && key === 'key' && !parent.computed) return;
          if (parent.type === 'ObjectMethod' && key === 'key') return;
          if (parent.type === 'VariableDeclarator' && key === 'id') return;
          if (parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression' ||
              parent.type === 'ArrowFunctionExpression') {
            if (key === 'params') return;
            if (key === 'id') return;
          }
        }
        if (!declared.has(node.name)) found.add(node.name);
        return;
      case 'ObjectMethod':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        collectParams(node);
        break;
      case 'CustomEvent':
        return;
      default:
        break;
    }

    for (const k of Object.keys(node)) {
      if (k === 'type' || k === 'start' || k === 'end' || k === 'loc') continue;
      const child = node[k];
      if (child && typeof child === 'object') visit(child, node, k);
    }
  };

  visit(ast, null, null);
  return [...found];
}

/* ------------------------------------------------------------------ *
 * 模板 AST 遍历
 * ------------------------------------------------------------------ */

function checkTemplate(templateAst, componentKeys, rel, report) {
  if (!templateAst) return;

  /** 一个作用域 = 一组可用名字 */
  const walk = (el, scopes) => {
    if (!el) return;

    let localScopes = scopes;

    // v-for 引入新作用域：alias / iterator1 / iterator2
    if (el.for) {
      const names = new Set();
      if (el.alias) names.add(el.alias);
      if (el.iterator1) names.add(el.iterator1);
      if (el.iterator2) names.add(el.iterator2);
      localScopes = [names, ...scopes];
    }

    // slot-scope / scope 引入作用域
    if (el.scope) {
      const names = new Set(el.scope.split(',').map((s) => s.trim().split(/[=. ]/)[0]).filter(Boolean));
      localScopes = [names, ...localScopes];
    }
    if (el.slotScope) {
      const names = new Set(el.slotScope.split(',').map((s) => s.trim().split(/[=. ]/)[0]).filter(Boolean));
      localScopes = [names, ...localScopes];
    }

    const known = (name) =>
      name.startsWith('$') ||
      GLOBALS.has(name) ||
      componentKeys.has(name) ||
      localScopes.some((s) => s.has(name));

    const check = (expr, where) => {
      for (const id of freeIdentifiers(expr)) {
        if (!known(id)) {
          report(`${rel} <${el.tag}> ${where} 引用了不存在的标识符 \`${id}\`（表达式：${String(expr).slice(0, 60)}）`);
        }
      }
    };

    // 属性
    for (const attr of el.attrsList || []) {
      const name = attr.name;
      const value = attr.value;
      if (!value) continue;
      if (name === 'v-for' || name === 'v-slot' || name === 'slot-scope' || name === 'scope') continue;
      if (/^(v-)?(if|else-if|show|model|html|text)$/.test(name) ||
          name.startsWith(':') || name.startsWith('v-bind:') ||
          name.startsWith('@') || name.startsWith('v-on:') ||
          name === 'v-model') {
        check(value, name);
      }
    }

    // 插值 {{ expr }}
    if (el.type === 2 && typeof el.text === 'string') {
      const re = /\{\{([\s\S]*?)\}\}/g;
      let m;
      while ((m = re.exec(el.text))) check(m[1], '插值');
    }

    // v-for 的源表达式（在父作用域里求值，但在新作用域里检查也无妨）
    if (el.for) check(el.for, 'v-for');

    for (const child of el.children || []) walk(child, localScopes);
    // ifConditions[0].block 就是 el 自己，跳过以避免无限递归
    if (el.ifConditions && el.ifConditions.length > 1) {
      for (let i = 1; i < el.ifConditions.length; i++) walk(el.ifConditions[i].block, scopes);
    }
  };

  walk(templateAst, []);
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */

function walkFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'assets', 'dist', 'dist_electron'].includes(e.name)) continue;
      walkFiles(p, out);
    } else if (e.name.endsWith('.vue')) out.push(p);
  }
  return out;
}

const report = [];
for (const file of walkFiles(SRC)) {
  const rel = path.relative(ROOT, file);
  const source = fs.readFileSync(file, 'utf8');
  const sfc = compiler.parseComponent(source);
  if (!sfc.template) continue;

  const componentKeys = collectComponentKeys(sfc.script && sfc.script.content);
  const parsed = compiler.compile(sfc.template.content, { outputSourceRange: true });
  // compile() 的 ast 可能为 null（有语法错误时），退回 parse
  const ast = parsed.ast || compiler.parseComponent(source).template.ast;
  if (ast) checkTemplate(ast, componentKeys, rel, (msg) => report.push(msg));
}

if (report.length) {
  console.log('模板里存在未定义标识符：');
  for (const r of report) console.log('  ' + r);
  console.log(`\n共 ${report.length} 个问题。`);
  if (VERBOSE) console.log('\n（提示：这类错误构建期静默，运行时抛 TypeError 并中断渲染）');
  process.exit(1);
} else {
  console.log('✓ 模板检查通过：未发现未定义的标识符。');
}
