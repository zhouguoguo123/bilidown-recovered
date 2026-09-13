#!/usr/bin/env node
/**
 * finish.js — 收尾脚本（还原工程里唯一需要跑一次的脚本）
 *
 * 做三件事：
 *   1. 把 webpack 内联的音频 data URI 解码成真实 .mp3 资源，
 *      并把残留的 `i(<id>)` 调用替换成正常的资源 import
 *      （webpack 的 assetsInlineLimit 把 mp3 内联进了 bundle，语义上原本就是 import mp3）。
 *   2. 把 `const e = i(9118)` 还原成 `const QRCode = require('qrcode')`。
 *   3. 把 recovered/ 下的静态资源拷进 src/assets/。
 *
 * 用法：
 *   node tools/finish.js [webpack模块目录]
 * 默认模块目录：/tmp/revtool/out_app_modules
 *
 * 若 /tmp 已被清理，脚本会跳过第 1 步并给出提示（其余步骤仍可用）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');            // recovered-source/
const SRC = path.join(ROOT, 'src');
const RECOVERED = path.resolve(ROOT, '..', 'recovered'); // 从 asar 解出的原始文件
const MODULES = process.argv[2] || '/tmp/revtool/out_app_modules';

/* ---------- 1. 音频资源 ---------- */
const AUDIO_IDS = [2479, 5507, 2311, 9122, 7512];
const assetDir = path.join(SRC, 'assets', 'media');
const audioMap = new Map();

if (fs.existsSync(MODULES)) {
  fs.mkdirSync(assetDir, { recursive: true });
  for (const id of AUDIO_IDS) {
    const f = path.join(MODULES, `${id}.js`);
    if (!fs.existsSync(f)) continue;
    const src = fs.readFileSync(f, 'utf8');
    const m = /"(data:audio\/[a-z0-9+.-]+;base64,[A-Za-z0-9+/=]+)"/.exec(src);
    if (!m) continue;
    const buf = Buffer.from(m[1].slice(m[1].indexOf(',') + 1), 'base64');
    const name = `tip-audio-${id}.mp3`;
    fs.writeFileSync(path.join(assetDir, name), buf);
    audioMap.set(id, { ident: `tipAudio${id}`, file: name });
    console.log(`音频资源导出: src/assets/media/${name}  (${buf.length} bytes)`);
  }
} else {
  console.log(`! 找不到 ${MODULES}，跳过音频导出。`);
  console.log('  （音频原始 data URI 在原始 bundle 里，可用任意编辑器打开 recovered/assets/js/app.*.js 搜索 data:audio 手动提取）');
}

/* ---------- 2. 重写残留 webpack require ---------- */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'assets') continue;
      walk(p, out);
    } else if (/\.(vue|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

let touched = 0;
for (const file of walk(SRC)) {
  if (file.endsWith('background.js')) continue;
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  const needed = [];

  for (const [id, info] of audioMap) {
    const re = new RegExp(`(?<![\\w$.])i\\(${id}\\)`, 'g');
    if (re.test(text)) {
      text = text.replace(re, info.ident);
      needed.push(`import ${info.ident} from '@/assets/media/${info.file}'`);
    }
  }
  text = text.replace(/(?<![\w$.])i\(9118\)/g, "require('qrcode')");

  if (needed.length) {
    if (text.includes('<script>\n')) text = text.replace('<script>\n', `<script>\n${needed.join('\n')}\n`);
    else text = needed.join('\n') + '\n' + text;
  }

  if (text !== before) {
    fs.writeFileSync(file, text);
    touched++;
    console.log('已重写: ' + path.relative(ROOT, file));
  }
}
console.log(`重写残留 require 的文件数: ${touched}`);

/* ---------- 3. 拷贝静态资源 ---------- */
if (fs.existsSync(RECOVERED)) {
  const copyDir = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const e of fs.readdirSync(from, { withFileTypes: true })) {
      const s = path.join(from, e.name);
      const d = path.join(to, e.name);
      if (e.isDirectory()) copyDir(s, d);
      else fs.copyFileSync(s, d);
    }
  };
  const assetsSrc = path.join(RECOVERED, 'assets');
  if (fs.existsSync(assetsSrc)) {
    copyDir(assetsSrc, path.join(SRC, 'assets'));
    console.log('已复制静态资源 -> src/assets/');
  }
  const ico = path.join(RECOVERED, 'logo.ico');
  if (fs.existsSync(ico)) {
    fs.copyFileSync(ico, path.join(SRC, 'logo.ico'));
    console.log('已复制 src/logo.ico');
  }
} else {
  console.log('! 找不到 recovered/ 目录，跳过静态资源复制。');
}

console.log('\n收尾完成。下一步：npm install && npm run electron:serve');
