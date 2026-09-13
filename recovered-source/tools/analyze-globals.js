#!/usr/bin/env node
/**
 * analyze-globals.js — 静态检查：找出所有「被引用但没有绑定」的自由标识符。
 *
 * 用途：还原工程的历史缺陷 A/B 会让生成器漏掉某个标识符的声明
 * （例如 `var nt = st;` 里的 `st`、`kt.openExternal` 里的 `kt`），
 * 这些缺陷在浏览/构建期都不一定报错，只有运行时才炸。本脚本把它们一次性列全。
 *
 * 用法：
 *   node tools/analyze-globals.js [src目录，默认 ../src]
 *
 * 输出：每个文件 + 未声明的标识符 + 引用次数 + 首次出现的行号。
 */
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const SRC = process.argv[2] || path.resolve(__dirname, '..', 'src');

/* 环境里本来就有的全局量（浏览器 / Electron 渲染进程 / Node） */
const ENV_GLOBALS = new Set([
  // JS 内建
  'globalThis', 'undefined', 'NaN', 'Infinity',
  'Object', 'Function', 'Boolean', 'Symbol', 'Error', 'EvalError', 'RangeError',
  'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'AggregateError',
  'Number', 'BigInt', 'Math', 'Date', 'String', 'RegExp', 'Array', 'Int8Array',
  'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array',
  'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array',
  'BigUint64Array', 'Map', 'Set', 'WeakMap', 'WeakSet', 'ArrayBuffer',
  'SharedArrayBuffer', 'Atomics', 'DataView', 'JSON', 'Promise', 'Generator',
  'GeneratorFunction', 'AsyncFunction', 'Reflect', 'Proxy', 'Intl',
  'WebAssembly', 'arguments', 'this', 'super',
  // 浏览器 / WHATWG
  'window', 'document', 'navigator', 'location', 'history', 'screen', 'frames',
  'self', 'top', 'parent', 'opener', 'closed', 'name', 'length', 'status',
  'localStorage', 'sessionStorage', 'indexedDB', 'caches', 'crypto',
  'console', 'performance', 'fetch', 'XMLHttpRequest', 'WebSocket', 'Worker',
  'EventSource', 'Headers', 'Request', 'Response', 'FormData', 'Blob', 'File',
  'FileReader', 'FileList', 'URL', 'URLSearchParams', 'TextEncoder',
  'TextDecoder', 'AbortController', 'AbortSignal', 'CustomEvent', 'Event',
  'MessageChannel', 'MessagePort', 'Notification', 'ResizeObserver',
  'MutationObserver', 'IntersectionObserver', 'Image', 'Audio', 'Option',
  'AudioContext', 'MediaStream', 'MediaRecorder', 'WorkerGlobalScope',
  'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'setImmediate', 'clearImmediate', 'queueMicrotask', 'structuredClone',
  'atob', 'btoa', 'alert', 'confirm', 'prompt', 'open', 'close', 'focus',
  'blur', 'scroll', 'scrollTo', 'scrollBy', 'postMessage', 'matchMedia',
  'getComputedStyle', 'addEventListener', 'removeEventListener',
  'dispatchEvent', 'createImageBitmap', 'DOMParser', 'Node', 'Element',
  'HTMLElement', 'HTMLCanvasElement', 'CSS', 'CustomElementRegistry',
  'global', 'process', 'Buffer', 'require', 'module', 'exports', '__dirname',
  '__filename',
  // 应用自己挂在 window 上的东西
  'openExternalLink', 'webFrame', 'electron',
]);

function scriptOf(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (!file.endsWith('.vue')) return [{ code: text, offset: 0 }];
  // 注意：文件头部的说明注释里也会出现字面量 "<script>"，所以必须匹配
  // 行首（允许缩进）的真正 script 开标签。
  const re = /^[ \t]*<script[^>]*>\n([\s\S]*?)^[ \t]*<\/script>/m;
  const m = re.exec(text);
  if (!m) return [];
  const offset = text.slice(0, m.index).split('\n').length;
  return [{ code: m[1], offset }];
}

function analyze(file) {
  const found = new Map();
  for (const { code, offset } of scriptOf(file)) {
    let ast;
    try {
      ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator', 'classProperties', 'topLevelAwait'],
        errorRecovery: true,
      });
    } catch (err) {
      console.error(`! 解析失败 ${file}: ${err.message}`);
      continue;
    }
    const bindings = new Set();
    // 1) 收集文件内所有声明（含 import、var/let/const、function、class、
    //    catch 参数、函数参数、解构等）
    traverse(ast, {
      ImportDeclaration(p) { for (const s of p.node.specifiers) bindings.add(s.local.name); },
      VariableDeclarator(p) {
        const collect = id => {
          if (!id) return;
          if (id.type === 'Identifier') bindings.add(id.name);
          else if (id.type === 'ObjectPattern') id.properties.forEach(x => collect(x.value || x.argument));
          else if (id.type === 'ArrayPattern') id.elements.forEach(collect);
          else if (id.type === 'AssignmentPattern') collect(id.left);
          else if (id.type === 'RestElement') collect(id.argument);
        };
        collect(p.node.id);
      },
      FunctionDeclaration(p) { if (p.node.id) bindings.add(p.node.id.name); },
      ClassDeclaration(p) { if (p.node.id) bindings.add(p.node.id.name); },
      CatchClause(p) { if (p.node.param && p.node.param.type === 'Identifier') bindings.add(p.node.param.name); },
    });
    // 2) 收集所有引用，扣掉绑定
    traverse(ast, {
      Identifier(p) {
        const ref = p.isReferencedIdentifier();
        if (!ref) return;
        const name = p.node.name;
        if (bindings.has(name)) return;
        if (ENV_GLOBALS.has(name)) return;
        // 跳过对象属性键 / 成员表达式属性（isReferencedIdentifier 已处理）
        const loc = p.node.loc ? p.node.loc.start.line + offset : 0;
        if (!found.has(name)) found.set(name, { count: 0, first: loc });
        const rec = found.get(name);
        rec.count++;
        if (loc < rec.first) rec.first = loc;
      },
    });
  }
  return found;
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

let total = 0;
for (const file of walk(SRC)) {
  if (file.endsWith('background.js')) continue; // 主进程已逐 token 校验
  const found = analyze(file);
  if (!found.size) continue;
  total += found.size;
  console.log(`\n${path.relative(path.resolve(SRC, '..'), file)}`);
  for (const [name, rec] of [...found].sort((a, b) => a[1].first - b[1].first)) {
    console.log(`  ✗ ${name.padEnd(28)} 引用 ${String(rec.count).padStart(3)} 次  首次出现在第 ${rec.first} 行`);
  }
}
console.log(`\n共 ${total} 个未声明标识符。`);
process.exit(total ? 1 : 0);
