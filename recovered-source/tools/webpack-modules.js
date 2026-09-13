#!/usr/bin/env node
/**
 * webpack-modules.js — 把 webpack bundle 的模块表（module table）拆成独立文件。
 *
 * 这是还原流水线里 `split-webpack.js` 的重写版，只做一件事：
 * 从 bundle 里抠出 `{id:function(module, exports, require){...}}` 表，
 * 按 id 落成 `<outDir>/<id>.js`。有了这些文件就能查清任意 `i(<id>)`
 * 原本指向哪个 npm 包（例如 i(8743) 是 babel runtime、i(2586) 是 axios）。
 *
 * 实现：用 Babel 解析整个 bundle（已验证 minified 产物本身语法合法），
 * 再按 AST 的 start/end 偏移精确切片。最早那版靠「花括号配平 + 猜正则」
 * 的手写扫描器在含模板串/正则的 bundle 上会跑飞，故弃用。
 *
 * 用法：
 *   node tools/webpack-modules.js <bundle.js> <outDir> [--list] [--id 643,2586]
 *
 * 例：
 *   node tools/webpack-modules.js ../recovered/assets/js/app.154ba22e.js /tmp/bd_out_app
 *   node tools/webpack-modules.js ../recovered/assets/js/chunk-vendors.6f104f4c.js /tmp/bd_out_vendor
 *
 * 也可作为库使用：require('./webpack-modules').splitModules(src)
 */
const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');

/**
 * 把 bundle 源码拆成 Map<id, code>。
 * `code` 是该模块工厂函数的完整源码（含参数列表与函数体）。
 */
function splitModules(src) {
  const ast = parse(src, { sourceType: 'unambiguous', errorRecovery: true });
  const mods = new Map();
  let table = null;

  // 找「键全是数字字面量、值全是函数」的最大对象字面量 —— webpack 的模块表
  const visit = (node) => {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'ObjectExpression' && node.properties.length) {
      const numeric = node.properties.filter(
        p => p.type === 'ObjectProperty' && !p.computed && p.key &&
          (p.key.type === 'NumericLiteral' || (p.key.type === 'StringLiteral' && /^\d+$/.test(p.key.value)))
      );
      const fns = numeric.filter(p =>
        p.value && (p.value.type === 'FunctionExpression' || p.value.type === 'ArrowFunctionExpression'));
      if (fns.length && fns.length === numeric.length && (!table || fns.length > table.fns.length)) {
        table = { node, fns };
      }
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'leadingComments' || key === 'trailingComments') continue;
      const v = node[key];
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v.type === 'string') visit(v);
    }
  };
  visit(ast.program);

  if (!table) throw new Error('找不到 webpack 模块表');
  for (const p of table.fns) {
    const id = String(p.key.value !== undefined ? p.key.value : p.key.name);
    mods.set(id, src.slice(p.start, p.end));
  }
  return mods;
}

module.exports = { splitModules };

/* ------------------------------------------------------------------ *
 *  CLI
 * ------------------------------------------------------------------ */
if (require.main === module) {
  const argv = process.argv.slice(2);
  const listOnly = argv.includes('--list');
  const idIdx = argv.indexOf('--id');
  const only = idIdx >= 0 ? new Set(argv[idIdx + 1].split(',')) : null;
  const [bundlePath, outDir] = argv.filter((a, i) => !a.startsWith('--') && !(idIdx >= 0 && i === idIdx + 1));
  if (!bundlePath) {
    console.error('用法: node tools/webpack-modules.js <bundle.js> [outDir] [--list] [--id 643,2586]');
    process.exit(2);
  }
  const src = fs.readFileSync(bundlePath, 'utf8');
  let mods = splitModules(src);
  if (only) mods = new Map([...mods].filter(([id]) => only.has(id)));
  console.log(`bundle ${src.length} 字符 → 解析出 ${mods.size} 个模块`);
  if (listOnly) {
    console.log([...mods.keys()].join(', '));
  } else {
    if (!outDir) { console.error('缺少 outDir'); process.exit(2); }
    fs.mkdirSync(outDir, { recursive: true });
    for (const [id, code] of mods) fs.writeFileSync(path.join(outDir, `${id}.js`), code);
    console.log(`已写入 ${outDir}/ （${mods.size} 个文件）`);
  }
}
