#!/usr/bin/env node
/**
 * module-context.js — 在原始 webpack bundle 里定位某个压缩标识符的所有出现，
 * 打印上下文，用于判断它“原本是什么”（axios 实例 / electron shell / 工具函数…）。
 *
 * 用法：
 *   node tools/module-context.js kt xt St te Ia Ga es as Oe
 *   node tools/module-context.js --radius 200 st
 *
 * 默认扫描 recovered/assets/js/app.*.js（渲染进程 bundle）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RECOVERED = path.resolve(ROOT, '..', 'recovered', 'assets', 'js');

let args = process.argv.slice(2);
let radius = 160;
const ri = args.indexOf('--radius');
if (ri >= 0) { radius = Number(args[ri + 1]); args.splice(ri, 2); }
let file = null;
const fi = args.indexOf('--file');
if (fi >= 0) { file = args[fi + 1]; args.splice(fi, 2); }

if (!args.length) {
  console.error('用法: node tools/module-context.js [--radius 200] [--file app.js] <标识符...>');
  process.exit(2);
}

if (!file) {
  const cand = fs.readdirSync(RECOVERED).filter(f => /^app\..*\.js$/.test(f));
  file = path.join(RECOVERED, cand[0]);
} else if (!path.isAbsolute(file)) {
  file = path.join(RECOVERED, file);
}
const src = fs.readFileSync(file, 'utf8');
console.log(`# ${path.relative(process.cwd(), file)}  (${src.length} 字符)\n`);

for (const name of args) {
  const re = new RegExp(`(?<![\\w$.])${name.replace(/[$]/g, '\\$')}(?![\\w$])`, 'g');
  const hits = [...src.matchAll(re)];
  console.log(`================ ${name}  (${hits.length} 处)`);
  for (const m of hits) {
    const i = m.index;
    console.log(`  @${i}  ...${src.slice(Math.max(0, i - radius), i + radius).replace(/\n/g, '\\n')}...`);
  }
  console.log('');
}
