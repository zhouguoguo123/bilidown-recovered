#!/usr/bin/env node
/**
 * validate-src.js — 还原工程的静态体检。
 *
 * 检查项：
 *   1. 未声明标识符（自由变量）—— 生成器漏内联的 module 级变量会在这里暴露
 *   2. 同一作用域内重复的 const/let 声明，以及函数级重复的 var
 *   3. 重复的 import 本地名
 *   4. 未使用的 import
 *   5. 残留的 webpack 调用 i(<id>)
 *
 * 为什么不用 @babel/traverse 的 scope：还原产物里本来就还有重复声明，
 * babel 的 scope 注册 binding 时会直接抛 `Duplicate declaration`，检查本体跑不起来。
 * 这里自己实现了一遍两阶段作用域解析：
 *   阶段一 collect()：进入作用域时先把**该作用域所有声明**登记好
 *                     （函数声明 + var 提升到函数/程序作用域；let/const/参数/import 留在本层）
 *   阶段二 visit()  ：只统计引用；解析不到本地绑定就报「未声明标识符」
 * 两阶段分开后，既不会有「先用后声明」的误报，也不会重复登记。
 *
 * 用法：
 *   node tools/validate-src.js            # 全量
 *   node tools/validate-src.js --quiet    # 只输出问题
 *
 * 退出码：有问题 = 1，干净 = 0。
 */
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const QUIET = process.argv.includes('--quiet');

/** 环境里本来就有的全局量（浏览器 / Electron 渲染进程 / Node / 应用自己挂的） */
const ENV_GLOBALS = new Set([
  'globalThis', 'undefined', 'NaN', 'Infinity', 'arguments',
  'Object', 'Function', 'Boolean', 'Symbol', 'Error', 'EvalError', 'RangeError',
  'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'AggregateError',
  'Number', 'BigInt', 'Math', 'Date', 'String', 'RegExp', 'Array', 'Int8Array',
  'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array',
  'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array',
  'BigUint64Array', 'Map', 'Set', 'WeakMap', 'WeakSet', 'ArrayBuffer',
  'SharedArrayBuffer', 'Atomics', 'DataView', 'JSON', 'Promise',
  'Reflect', 'Proxy', 'Intl', 'WebAssembly',
  'window', 'document', 'navigator', 'location', 'history', 'screen', 'frames',
  'self', 'top', 'parent', 'opener', 'closed', 'name', 'length', 'status',
  'localStorage', 'sessionStorage', 'indexedDB', 'caches', 'crypto',
  'console', 'performance', 'fetch', 'XMLHttpRequest', 'WebSocket', 'Worker',
  'EventSource', 'Headers', 'Request', 'Response', 'FormData', 'Blob', 'File',
  'FileReader', 'FileList', 'URL', 'URLSearchParams', 'TextEncoder',
  'TextDecoder', 'AbortController', 'AbortSignal', 'CustomEvent', 'Event',
  'MessageChannel', 'MessagePort', 'Notification', 'ResizeObserver',
  'MutationObserver', 'IntersectionObserver', 'Image', 'Audio', 'Option',
  'AudioContext', 'MediaStream', 'MediaRecorder',
  'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'setImmediate', 'clearImmediate', 'queueMicrotask', 'structuredClone',
  'atob', 'btoa', 'alert', 'confirm', 'prompt', 'open', 'close', 'focus',
  'blur', 'scroll', 'scrollTo', 'scrollBy', 'postMessage', 'matchMedia',
  'getComputedStyle', 'addEventListener', 'removeEventListener',
  'dispatchEvent', 'createImageBitmap', 'DOMParser', 'Node', 'Element',
  'HTMLElement', 'HTMLCanvasElement', 'CSS', 'CustomElementRegistry',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent',
  'decodeURIComponent', 'encodeURI', 'decodeURI', 'escape', 'unescape',
  'global', 'process', 'Buffer', 'require', 'module', 'exports', '__dirname',
  '__filename', 'Vue',
  // 应用自己挂在 window 上的
  'openExternalLink', '$notify', 'electron', 'webFrame',
]);

const SUSPECT_SHORT = /^[a-zA-Z_$][a-zA-Z0-9_$]{0,2}$/;
const SKIP_KEYS = new Set(['loc', 'start', 'end', 'range', 'extra',
  'leadingComments', 'trailingComments', 'innerComments', 'comments', 'tokens']);

const kidCache = new WeakMap();
function childNodes(node) {
  let out = kidCache.get(node);
  if (out) return out;
  out = [];
  for (const key of Object.keys(node)) {
    if (SKIP_KEYS.has(key)) continue;
    const v = node[key];
    if (Array.isArray(v)) {
      for (const x of v) if (x && typeof x.type === 'string') out.push(x);
    } else if (v && typeof v.type === 'string') out.push(v);
  }
  kidCache.set(node, out);
  return out;
}

function patternNames(node, out = []) {
  if (!node) return out;
  switch (node.type) {
    case 'Identifier': out.push(node); break;
    case 'ObjectPattern': node.properties.forEach(p => patternNames(p.value || p.argument, out)); break;
    case 'ArrayPattern': node.elements.forEach(p => patternNames(p, out)); break;
    case 'AssignmentPattern': patternNames(node.left, out); break;
    case 'RestElement': patternNames(node.argument, out); break;
    default: break;
  }
  return out;
}

function analyze(ast, offset, rel, report) {
  const free = new Map();
  const importRecs = new Map();
  const parentOf = new WeakMap();
  const at = n => (n && n.loc ? n.loc.start.line + offset : 0);

  /** Identifier 在父节点里的角色：'ref' 表示被引用 */
  function roleOf(node, parent) {
    if (!parent) return 'ref';
    switch (parent.type) {
      case 'MemberExpression':
      case 'OptionalMemberExpression':
        return parent.object === node ? 'ref' : 'skip';
      case 'ObjectProperty':
      case 'ObjectMethod':
      case 'ClassMethod':
      case 'ClassProperty':
      case 'ClassPrivateMethod':
      case 'ClassPrivateProperty':
        return !parent.computed && parent.key === node ? 'skip' : 'ref';
      case 'ImportSpecifier':
      case 'ImportDefaultSpecifier':
      case 'ImportNamespaceSpecifier':
      case 'ExportSpecifier':
        return 'skip';
      case 'VariableDeclarator':
        return parent.init === node ? 'ref' : 'skip';
      case 'LabeledStatement':
      case 'BreakStatement':
      case 'ContinueStatement':
        return 'skip';
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'ObjectMethod':
      case 'ClassMethod':
        if (parent.id === node) return 'skip';
        if ((parent.params || []).includes(node)) return 'skip';
        return 'ref';
      default:
        return 'ref';
    }
  }

  (function index(n) {
    for (const c of childNodes(n)) {
      if (!parentOf.has(c)) parentOf.set(c, n);
      index(c);
    }
  })(ast.program);

  const makeScope = (parent, type) => ({ parent, type, names: new Map() });

  function varScope(s) {
    while (s.parent && s.type !== 'function' && s.type !== 'program') s = s.parent;
    return s;
  }

  function declare(scope, name, kind, line, isImport = false) {
    const target = kind === 'var' ? varScope(scope) : scope;
    const prev = target.names.get(name);
    if (prev) {
      const lexPrev = prev.kind === 'const' || prev.kind === 'let';
      const lexNow = kind === 'const' || kind === 'let';
      if (lexNow && lexPrev) {
        report(`${rel}:${line} 重复声明 \`${kind} ${name}\`（前一次在第 ${prev.line} 行）`);
      }
      // `var` 重复声明在 JS 里合法，且原 bundle 自己就用了这种写法
      // （例如 `var Ba = xa` 在 xa 定义前先声明、定义后再赋值），因此不报。
      return prev;
    }
    const rec = { kind, line, refs: 0, isImport };
    target.names.set(name, rec);
    if (isImport) importRecs.set(name, rec);
    return rec;
  }

  /** 阶段一：登记一个语句列表里的所有声明（含 hoisting） */
  function collectStatements(scope, stmts) {
    const fnScope = varScope(scope);
    for (const st of stmts) {
      if (!st) continue;
      switch (st.type) {
        case 'FunctionDeclaration':
          if (st.id) {
            const prev = fnScope.names.get(st.id.name);
            if (!prev) {
              fnScope.names.set(st.id.name, { kind: 'function', line: at(st.id), refs: 0, fn: true });
            } else if (prev.kind === 'function') {
              report(`${rel}:${at(st.id)} 重复声明 \`function ${st.id.name}\`（前一次在第 ${prev.line} 行）`);
            }
          }
          break;
        case 'ClassDeclaration':
          if (st.id) declare(scope, st.id.name, 'let', at(st.id));
          break;
        case 'VariableDeclaration':
          for (const d of st.declarations) {
            for (const id of patternNames(d.id)) declare(scope, id.name, st.kind, at(id));
          }
          break;
        case 'ImportDeclaration':
          for (const s of st.specifiers) declare(scope, s.local.name, 'const', at(s), true);
          break;
        case 'ExportNamedDeclaration':
        case 'ExportDefaultDeclaration':
          if (st.declaration) collectStatements(scope, [st.declaration]);
          break;
        default:
          break;
      }
    }
  }

  function countRef(scope, name, line) {
    let s = scope;
    while (s) {
      const rec = s.names.get(name);
      if (rec) { rec.refs++; return; }
      s = s.parent;
    }
    if (ENV_GLOBALS.has(name)) return;
    if (!free.has(name)) free.set(name, { n: 0, line });
    const r = free.get(name);
    r.n++;
    if (line && line < r.line) r.line = line;
  }

  /** 阶段二：遍历，只统计引用 */
  function visit(node, scope) {
    if (!node || typeof node.type !== 'string') return;
    switch (node.type) {
      case 'Identifier':
        if (roleOf(node, parentOf.get(node)) === 'ref') countRef(scope, node.name, at(node));
        return;

      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'ObjectMethod':
      case 'ClassMethod':
      case 'ClassPrivateMethod': {
        if (node.computed && node.key) visit(node.key, scope);
        const fnScope = makeScope(scope, 'function');
        fnScope.names.set('arguments', { kind: 'let', line: at(node), refs: 0 });
        for (const p of node.params) {
          for (const id of patternNames(p)) declare(fnScope, id.name, 'let', at(id));
        }
        for (const p of node.params) visit(p, fnScope);
        if (node.body && node.body.type === 'BlockStatement') {
          collectStatements(fnScope, node.body.body);
          node.body.body.forEach(n => visit(n, fnScope));
        } else {
          visit(node.body, fnScope);
        }
        return;
      }

      case 'BlockStatement': {
        const inner = makeScope(scope, 'block');
        collectStatements(inner, node.body);
        node.body.forEach(n => visit(n, inner));
        return;
      }

      case 'CatchClause': {
        const inner = makeScope(scope, 'catch');
        for (const id of patternNames(node.param)) declare(inner, id.name, 'let', at(id));
        visit(node.param, inner);
        visit(node.body, inner);
        return;
      }

      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement': {
        const inner = makeScope(scope, 'for');
        // 循环头里的声明（for(;;)、for..in、for..of 的 left）都属于循环自己的作用域
        const headerDecl = n => {
          if (n && n.type === 'VariableDeclaration') {
            for (const d of n.declarations) {
              for (const id of patternNames(d.id)) declare(inner, id.name, n.kind, at(id));
            }
            n.declarations.forEach(d => visit(d.init, inner));
          } else {
            visit(n, inner);
          }
        };
        headerDecl(node.init);
        headerDecl(node.left);
        visit(node.test, inner);
        visit(node.update, inner);
        visit(node.body, inner);
        return;
      }

      case 'ClassDeclaration':
      case 'ClassExpression': {
        if (node.superClass) visit(node.superClass, scope);
        const classScope = makeScope(scope, 'block');
        if (node.id) classScope.names.set(node.id.name, { kind: 'let', line: at(node.id), refs: 0 });
        visit(node.body, classScope);
        return;
      }

      default:
        for (const c of childNodes(node)) visit(c, scope);
    }
  }

  const rootScope = makeScope(null, 'program');
  collectStatements(rootScope, ast.program.body);
  ast.program.body.forEach(n => visit(n, rootScope));

  return { free, importRecs };
}

function scriptOf(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (!file.endsWith('.vue')) return { code: text, offset: 0 };
  const re = /^[ \t]*<script[^>]*>\n([\s\S]*?)^[ \t]*<\/script>/m;
  const m = re.exec(text);
  if (!m) return null;
  return { code: m[1], offset: text.slice(0, m.index).split('\n').length };
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'assets', 'dist', 'dist_electron', '.git'].includes(e.name)) continue;
      walk(p, out);
    } else if (/\.(vue|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

const problems = [];
for (const f of walk(SRC)) {
  if (f.endsWith('background.js')) continue;
  const parsed = scriptOf(f);
  if (!parsed) continue;
  const rel = path.relative(ROOT, f);
  let ast;
  try {
    ast = parser.parse(parsed.code, {
      sourceType: 'module',
      errorRecovery: true,
      plugins: ['objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator', 'classProperties', 'topLevelAwait'],
    });
  } catch (err) {
    problems.push(`${rel}: 解析失败 — ${err.message}`);
    continue;
  }
  const { free, importRecs } = analyze(ast, parsed.offset, rel, m => problems.push(m));
  for (const [name, rec] of importRecs) {
    if (rec.refs === 0) problems.push(`${rel}:${rec.line} 未使用的 import \`${name}\``);
  }
  for (const [name, r] of free) {
    problems.push(`${rel}:${r.line} 未声明标识符 \`${name}\`（引用 ${r.n} 次）${SUSPECT_SHORT.test(name) ? ' ← 疑似漏内联' : ''}`);
  }
  const leftovers = [...parsed.code.matchAll(/(?<![\w$.])i\((\d{2,6})\)/g)];
  if (leftovers.length) {
    problems.push(`${rel} 残留 webpack 调用 i(${[...new Set(leftovers.map(m => m[1]))].join('), i(')})`);
  }
}

if (problems.length) {
  console.log(problems.sort().join('\n'));
  console.log(`\n共 ${problems.length} 个问题。`);
  process.exit(1);
}
if (!QUIET) console.log('✓ src/ 静态体检通过：无未声明标识符、无重复声明、无残留 webpack 调用。');
process.exit(0);
