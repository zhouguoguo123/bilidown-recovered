#!/usr/bin/env node
/**
 * module-scope-report.js — 列出「原 bundle 的 module 级作用域」里定义的标识符，
 * 与「还原后的 src 里实际存在的标识符」对比，找出生成器漏掉的定义。
 *
 * 这是修缺陷 A/B 的关键工具：生成器的依赖闭包漏掉某个 module 级绑定时，
 * 该绑定在 .vue 里就成了凭空引用；本脚本把「原始应该有、现在没有」的名字列全。
 *
 * 用法：
 *   node tools/module-scope-report.js
 *   node tools/module-scope-report.js --app-module 643
 */
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const ROOT = path.resolve(__dirname, '..');
const RECOVERED = path.resolve(ROOT, '..', 'recovered', 'assets', 'js');
const APP_MODULE = process.argv.includes('--app-module')
  ? process.argv[process.argv.indexOf('--app-module') + 1]
  : '643';

const SKIP = new Set(['loc', 'start', 'end', 'range', 'extra',
  'leadingComments', 'trailingComments', 'innerComments']);

function kids(n) {
  const out = [];
  for (const k of Object.keys(n)) {
    if (SKIP.has(k)) continue;
    const v = n[k];
    if (Array.isArray(v)) { for (const x of v) if (x && typeof x.type === 'string') out.push(x); }
    else if (v && typeof v.type === 'string') out.push(v);
  }
  return out;
}

function patternNames(node, out = []) {
  if (!node) return out;
  switch (node.type) {
    case 'Identifier': out.push(node.name); break;
    case 'ObjectPattern': node.properties.forEach(p => patternNames(p.value || p.argument, out)); break;
    case 'ArrayPattern': node.elements.forEach(e => patternNames(e, out)); break;
    case 'AssignmentPattern': patternNames(node.left, out); break;
    case 'RestElement': patternNames(node.argument, out); break;
    default: break;
  }
  return out;
}

/** 取 bundle 里某个模块工厂函数的「模块级」声明与自由引用 */
function moduleScope(src, moduleId) {
  const { splitModules } = require('./webpack-modules.js');
  const mods = splitModules(src);
  const code = mods.get(moduleId);
  if (!code) throw new Error(`模块 ${moduleId} 不存在`);
  // 工厂形如 `643:function(t,e,i){...}` —— 取函数体
  const brace = code.indexOf('{');
  const body = code.slice(brace + 1, code.lastIndexOf('}'));
  const ast = parser.parse(body, { sourceType: 'script', errorRecovery: true });

  const declared = new Map(); // name → {kind, line}
  const referenced = new Map(); // name → count
  const parentOf = new WeakMap();
  (function index(n) { for (const c of kids(n)) { if (!parentOf.has(c)) parentOf.set(c, n); index(c); } })(ast.program);

  const isRef = node => {
    const p = parentOf.get(node);
    if (!p) return true;
    switch (p.type) {
      case 'MemberExpression': return p.object === node;
      case 'ObjectProperty': case 'ObjectMethod': case 'ClassMethod': case 'ClassProperty':
        return p.computed ? true : p.key !== node;
      case 'VariableDeclarator': return p.init === node;
      case 'ExportSpecifier': return false;
      case 'LabeledStatement': case 'BreakStatement': case 'ContinueStatement': return false;
      default: return true;
    }
  };

  // 只统计「模块级（不在任何函数内）」的声明与引用
  const visit = (node, depth) => {
    if (!node || typeof node.type !== 'string') return;
    switch (node.type) {
      case 'FunctionDeclaration': case 'FunctionExpression': case 'ArrowFunctionExpression':
      case 'ObjectMethod': case 'ClassMethod': case 'ClassPrivateMethod': {
        if (node.type === 'FunctionDeclaration' && node.id && depth === 0) {
          declared.set(node.id.name, { kind: 'function', line: node.loc.start.line });
        }
        if (node.type === 'ObjectMethod' || node.type === 'ClassMethod') { /* 方法体不进 */ }
        // 函数体内部的声明不算模块级
        return;
      }
      case 'VariableDeclaration':
        if (depth === 0) {
          for (const d of node.declarations) {
            for (const n of patternNames(d.id)) declared.set(n, { kind: node.kind, line: node.loc.start.line });
          }
        }
        node.declarations.forEach(d => visit(d.init, depth + 1));
        return;
      case 'ClassDeclaration':
        if (depth === 0 && node.id) declared.set(node.id.name, { kind: 'class', line: node.loc.start.line });
        return;
      case 'Identifier':
        if (depth === 0 && isRef(node)) referenced.set(node.name, (referenced.get(node.name) || 0) + 1);
        return;
      default:
        for (const c of kids(node)) visit(c, depth);
    }
  };
  visit(ast.program, 0);

  return { declared, referenced };
}

/** 汇总 src/ 下所有文件里「有声明」的名字（含 import） */
function srcDeclaredNames() {
  const names = new Set();
  const walk = (dir, out = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, out);
      else if (/\.(vue|js)$/.test(e.name)) out.push(p);
    }
    return out;
  };
  for (const f of walk(path.join(ROOT, 'src'))) {
    const text = fs.readFileSync(f, 'utf8');
    const code = f.endsWith('.vue') ? (/<script[^>]*>\n([\s\S]*?)\n<\/script>/.exec(text) || [, ''])[1] : text;
    // 保守做法：抓所有 `X =` / `function X` / `const {a: X}` / import 名
    for (const m of code.matchAll(/^[ \t]*(?:const|let|var)\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1]);
    for (const m of code.matchAll(/^[ \t]*function\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1]);
    for (const m of code.matchAll(/^[ \t]*class\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1]);
    for (const m of code.matchAll(/^import\s+(?:([A-Za-z_$][\w$]*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from/gm)) {
      if (m[1]) names.add(m[1]);
      if (m[2]) m[2].split(',').forEach(s => { const t = s.trim().split(/\s+as\s+/); if (t.length > 1) names.add(t[1]); else if (t[0]) names.add(t[0]); });
    }
    for (const m of code.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=/g)) {
      m[1].split(',').forEach(s => { const t = s.trim().split(':').map(x => x.trim()); if (t[1]) names.add(t[1]); else if (t[0]) names.add(t[0]); });
    }
  }
  return names;
}

const bundleFile = fs.readdirSync(RECOVERED).find(f => /^app\..*\.js$/.test(f));
const src = fs.readFileSync(path.join(RECOVERED, bundleFile), 'utf8');
const { declared, referenced } = moduleScope(src, APP_MODULE);
const inSrc = srcDeclaredNames();

console.log(`# 原 bundle module ${APP_MODULE} 的模块级作用域`);
console.log(`# 声明 ${declared.size} 个，模块级引用 ${referenced.size} 个，src/ 中已存在 ${inSrc.size} 个名字\n`);

const missing = [...declared.keys()].filter(n => !inSrc.has(n)).sort();
console.log(`## 原 bundle 有、src/ 里完全没有的模块级声明（${missing.length} 个）`);
for (const n of missing) console.log(`  ${n.padEnd(14)} ${declared.get(n).kind.padEnd(9)} bundle 行 ${declared.get(n).line}`);
