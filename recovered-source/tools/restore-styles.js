#!/usr/bin/env node
/**
 * restore-styles.js —— 从构建期的 CSS 产物反推样式源码
 *
 * asar 里只有 webpack 打出来的两份 CSS，原始 `.vue` 的 `<style>` 与全局样式文件
 * 都不在产物里，只能反推：
 *
 *   recovered/assets/css/app.cfce7cff.css  (104 KiB)
 *     ├── 带 [data-v-HASH] 的 4 组规则 → 对应组件的 <style scoped>
 *     │     4c414d58 BButton   2e63e76c Tools
 *     │     dfd97af6 BEmpty    b6c0c38a BProgress
 *     └── 其余 525 条（CSS 变量、页面样式、element-ui 覆盖）→ src/assets/css/global.css
 *
 *   recovered/assets/css/chunk-vendors.00d3c6de.css  (243 KiB)
 *     ├── element-ui  → main.js: import 'element-ui/lib/theme-chalk/index.css'
 *     └── plyr        → main.js: import 'plyr/dist/plyr.css'
 *
 * 另外：
 *   - @font-face 引用的 ttf 从 asar 复制到 src/assets/fonts/（去掉文件名里的 hash）
 *   - CSS 里的产物路径 ../../assets/fonts/xxx.<hash>.ttf → ../fonts/xxx.ttf
 *   - 已被 webpack 内联的 base64 字体原样保留（这是产物能给出的最忠实形态）
 *
 * 幂等：可重复运行（style 块用 marker 包裹，先删后写）。
 *
 * 用法：node tools/restore-styles.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const RECOVERED = path.join(ROOT, '..', 'recovered');
const APP_CSS = path.join(RECOVERED, 'assets/css/app.cfce7cff.css');
const FONTS_SRC = path.join(RECOVERED, 'assets/fonts');
const FONTS_DST = path.join(SRC, 'assets/fonts');
const GLOBAL_CSS = path.join(SRC, 'assets/css/global.css');

const DRY = process.argv.includes('--dry-run');

/** 组件 scopeId → .vue 文件（scopeId 由 bundle 里的 normalizeComponent 调用确定） */
const SCOPED_COMPONENTS = {
  '4c414d58': 'src/components/BButton.vue',
  '2e63e76c': 'src/views/Tools.vue',
  'dfd97af6': 'src/components/BEmpty.vue',
  'b6c0c38a': 'src/components/BProgress.vue',
};

const STYLE_START = '<!-- @restored:style:START -->';
const STYLE_END = '<!-- @restored:style:END -->';

/** 需要补进 main.js 的第三方 / 全局样式，顺序即优先级 */
const MAIN_IMPORTS = [
  "import 'element-ui/lib/theme-chalk/index.css'",
  "import 'plyr/dist/plyr.css'",
  "import './assets/css/global.css'",
];

const changes = [];
const report = [];

/* ------------------------------------------------------------------ *
 * CSS 解析
 * ------------------------------------------------------------------ */

/**
 * 按顶层 `{}` 切块。会跳过字符串字面量里的花括号（content:"{" 之类）。
 */
function splitTopLevel(css) {
  const out = [];
  let depth = 0;
  let start = 0;
  let quote = null;

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (quote) {
      if (ch === quote && css[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { out.push(css.slice(start, i + 1)); start = i + 1; }
    }
  }
  const tail = css.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

/** 取块头部（`{` 之前的选择器 / at-rule 前导） */
function headOf(block) {
  const i = block.indexOf('{');
  return (i < 0 ? block : block.slice(0, i)).trim();
}

/** 取块体（`{` 与最后一个 `}` 之间） */
function bodyOf(block) {
  const i = block.indexOf('{');
  const j = block.lastIndexOf('}');
  return i < 0 || j < 0 ? '' : block.slice(i + 1, j);
}

/** 块里出现的 scopeId：命中已知的 4 个之一则返回它，否则返回 null（全局） */
function scopeOf(block) {
  const found = new Set();
  for (const m of block.matchAll(/\[data-v-([0-9a-f]{8})\]/g)) {
    if (SCOPED_COMPONENTS[m[1]]) found.add(m[1]);
  }
  if (found.size === 0) return null;
  if (found.size > 1) {
    report.push(`⚠ 一个规则块里出现多个 scopeId（${[...found].join(', ')}），按第一个归属`);
  }
  return [...found][0];
}

/**
 * 把整份 CSS 拆成 { scoped: {hash: [块]}, globals: [块] }。
 * 会递归进入 @media / @supports，按内部规则的 scopeId 分别归档，
 * 并为每个分组重建 at-rule 包裹，保证规则不跨文件泄漏。
 */
function partition(css) {
  const scoped = {};
  const globals = [];

  const push = (scope, code) => {
    if (scope) (scoped[scope] = scoped[scope] || []).push(code);
    else globals.push(code);
  };

  const walk = (block) => {
    const head = headOf(block);
    if (/^@(media|supports|layer|container)\b/.test(head)) {
      const buckets = new Map();
      for (const inner of splitTopLevel(bodyOf(block))) {
        // at-rule 里再嵌套 at-rule 的情况极少，这里只处理一层 + 透传
        const key = scopeOf(inner) || '__global__';
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(inner);
      }
      for (const [key, rules] of buckets) {
        push(key === '__global__' ? null : key, `${head}{${rules.join('')}}`);
      }
      return;
    }
    push(scopeOf(block), block);
  };

  for (const block of splitTopLevel(css)) walk(block);
  return { scoped, globals };
}

/**
 * 压缩 CSS 的基础美化：每个声明一行、按层级缩进。
 * 不改变语义（构建时还会再压回去），只是让还原出的源码可读。
 */
function beautify(css, indent = '  ') {
  let out = '';
  let depth = 0;
  let buf = '';
  let quote = null;

  const flush = (suffix) => {
    const t = buf.trim();
    if (t) out += indent.repeat(depth) + t + suffix;
    buf = '';
  };

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (quote) {
      buf += ch;
      if (ch === quote && css[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }

    if (ch === '{') {
      flush(' {\n');
      depth++;
    } else if (ch === '}') {
      flush('\n');
      depth = Math.max(0, depth - 1);
      out += indent.repeat(depth) + '}\n';
    } else if (ch === ';') {
      flush(';\n');
    } else {
      buf += ch;
    }
  }
  flush('\n');
  return out;
}

/* ------------------------------------------------------------------ *
 * 字体
 * ------------------------------------------------------------------ */

/** `iconfont.21b84876.ttf` → `iconfont.ttf`（去掉 webpack 塞进去的内容 hash） */
function stripContentHash(fileName) {
  const m = /^(.*)\.([0-9a-f]{8})(\.[a-z0-9]+)$/i.exec(fileName);
  return m ? `${m[1]}${m[3]}` : fileName;
}

/**
 * CSS 里的产物路径 → 源码相对路径（global.css 位于 src/assets/css/）。
 *
 * 两件事：
 *   1. `../../assets/fonts/` → `../fonts/`
 *   2. 去掉 webpack 塞进文件名里的内容 hash：`iconfont.21b84876.ttf` → `iconfont.ttf`
 *      （原项目源码里不可能带 hash，重新构建时 webpack 会按内容算回同样的 hash）
 *
 * base64 内联的字体（data: 开头）原样保留。
 */
function fixFontUrls(css) {
  return css.replace(/url\((['"]?)([^)'"]*fonts\/[^)'"]*)\1\)/g, (whole, quote, rawPath) => {
    if (/^\s*data:/i.test(rawPath)) return whole;
    const cleaned = rawPath
      .replace(/^(\.\.\/)+assets\/fonts\//, '../fonts/')
      .replace(/\.([0-9a-f]{8})(\.[a-z0-9]+)$/i, '$2');
    return `url(${quote}${cleaned}${quote})`;
  });
}

function restoreFonts() {
  if (!fs.existsSync(FONTS_SRC)) {
    report.push('⚠ 找不到 recovered/assets/fonts/，跳过字体复制');
    return [];
  }
  const copied = [];
  for (const name of fs.readdirSync(FONTS_SRC)) {
    // element-icons 由 element-ui 包自带，不需要复制
    if (name.startsWith('element-icons')) continue;
    const target = stripContentHash(name);
    const from = path.join(FONTS_SRC, name);
    const to = path.join(FONTS_DST, target);
    if (!DRY) {
      fs.mkdirSync(FONTS_DST, { recursive: true });
      fs.copyFileSync(from, to);
    }
    copied.push(target);
    changes.push(`src/assets/fonts/${target}`);
  }
  if (copied.length) report.push(`字体: ${copied.join(', ')}`);
  return copied;
}

/* ------------------------------------------------------------------ *
 * .vue 的 <style scoped>
 * ------------------------------------------------------------------ */

function stripExistingStyleBlock(text) {
  const start = text.indexOf(STYLE_START);
  const end = text.indexOf(STYLE_END);
  if (start < 0 || end < 0) return text;
  return (text.slice(0, start) + text.slice(end + STYLE_END.length)).replace(/\n{3,}/g, '\n\n');
}

/** 去掉 scoped 属性，让 vue-loader 重新按本文件计算 scopeId */
function deScope(css, hash) {
  return css.replace(new RegExp(`\\[data-v-${hash}\\]`, 'g'), '');
}

function writeScopedStyles(scoped) {
  for (const [hash, rel] of Object.entries(SCOPED_COMPONENTS)) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) {
      report.push(`⚠ 找不到组件文件 ${rel}，跳过 scoped 样式`);
      continue;
    }
    const blocks = scoped[hash];
    if (!blocks || !blocks.length) {
      report.push(`⚠ ${rel} 没有匹配到 scopeId ${hash} 的规则`);
      continue;
    }

    let text = stripExistingStyleBlock(fs.readFileSync(file, 'utf8'));
    if (!text.endsWith('\n')) text += '\n';

    const css = beautify(fixFontUrls(deScope(blocks.join(''), hash)));
    text += `\n${STYLE_START}\n<style scoped>\n${css}</style>\n${STYLE_END}\n`;

    if (!DRY) fs.writeFileSync(file, text);
    const rules = (blocks.join('').match(/\}/g) || []).length;
    report.push(`scoped 样式: ${rel} ← ${hash}（${rules} 条规则）`);
    changes.push(`${rel} (style scoped)`);
  }
}

/* ------------------------------------------------------------------ *
 * main.js
 * ------------------------------------------------------------------ */

function patchMainJs() {
  const file = path.join(SRC, 'main.js');
  if (!fs.existsSync(file)) {
    report.push('⚠ 找不到 src/main.js');
    return;
  }
  let text = fs.readFileSync(file, 'utf8');
  const missing = MAIN_IMPORTS.filter((imp) => !text.includes(imp));
  if (!missing.length) return;

  const lastImport = [...text.matchAll(/^import\s+[^\n]*$/gm)].pop();
  if (!lastImport) {
    report.push('⚠ main.js 里找不到 import 语句');
    return;
  }
  const at = lastImport.index + lastImport[0].length;
  text = `${text.slice(0, at)}\n\n// @restored:styles\n${missing.join('\n')}${text.slice(at)}`;

  if (!DRY) fs.writeFileSync(file, text);
  report.push(`main.js: 补 ${missing.length} 条样式 import`);
  changes.push('src/main.js (样式 import)');
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */

function main() {
  if (!fs.existsSync(APP_CSS)) {
    console.error(`找不到原始 CSS：${APP_CSS}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(APP_CSS, 'utf8');
  const { scoped, globals } = partition(raw);

  // 1) 全局样式 → src/assets/css/global.css
  const globalCss = beautify(fixFontUrls(globals.join('')));
  if (!DRY) {
    fs.mkdirSync(path.dirname(GLOBAL_CSS), { recursive: true });
    fs.writeFileSync(GLOBAL_CSS, globalCss);
  }
  const globalRules = (globals.join('').match(/\}/g) || []).length;
  report.push(`全局样式: src/assets/css/global.css（${globalRules} 条规则，${(globalCss.length / 1024).toFixed(1)} KiB）`);
  changes.push('src/assets/css/global.css');

  // 2) 字体
  restoreFonts();

  // 3) 4 个组件的 <style scoped>
  writeScopedStyles(scoped);

  // 4) main.js 补 import
  patchMainJs();

  // 汇总
  console.log('\n=== restore-styles 完成 ===');
  for (const r of report) console.log('  ' + r);
  const total = Object.values(scoped).reduce((n, b) => n + (b.join('').match(/\}/g) || []).length, 0);
  console.log(`\n  合计: 全局 ${globalRules} 条 + scoped ${total} 条 = ${globalRules + total} 条规则`);
  if (DRY) console.log('  （--dry-run：未写入任何文件）');
  console.log('');
}

main();
