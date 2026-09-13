#!/usr/bin/env node
/**
 * apply-macos-port.js —— 在「纯还原」源码之上叠加 macOS 可运行改造
 *
 * 背景：Bilidown 1.2.7 原本只发布 Windows（NSIS + aria2c.exe + ffmpeg.exe +
 * Windows 剪贴板消息）。原作者其实写了不少 `process.platform === "darwin"` 分支，
 * 只是打包只出了 Windows。本脚本把剩下的 Windows 专有点补齐，让它在 macOS 上能跑。
 *
 * 这是**改造**而不是还原：`tools/apply-fixes.js` 保持输出等价的原始源码，
 * 本脚本在其之上叠加。两者分开，随时可以只保留还原版。
 *
 * 前置条件：
 *   - ffmpeg 在 PATH 中（brew install ffmpeg），或用 bin/ffmpeg
 *   - aria2c 在 PATH 中（brew install aria2），或用 bin/aria2c
 *   脚本会自动在项目 bin/ 下建立指向系统二进制的软链（若尚未存在）。
 *
 * 用法：node tools/apply-macos-port.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const BIN = path.join(ROOT, 'bin');
const DRY = process.argv.includes('--dry-run');

const changes = [];
const report = [];
const warnings = [];

/* ------------------------------------------------------------------ *
 * 代码改动
 * ------------------------------------------------------------------ */

/** 用数组 join 构造多行代码，避免模板字符串把反引号 / ${} 吃掉 */
const line = (...xs) => xs.join('\n');

/** ffmpeg 路径片段：Download.vue 用 Ja、Tools.vue 用 ss，但参数部分完全相同 */
const FFMPEG_OLD = String.raw`__dirname.replace(/electron\.asar(\\|\/)renderer/, "app.asar"), "..", "bin", "ffmpeg.exe")`;
const FFMPEG_NEW = String.raw`__dirname.replace(/electron\.asar(\\|\/)renderer/, "app.asar"), "..", "bin", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg")`;

/** Qa()：在文件管理器中定位文件。原版只有 win32 分支，macOS 上静默无操作 */
const QA_OLD = line(
  'function Qa(t) {',
  '  if (process.platform === "win32") {',
  '    Fa(`explorer /select,"${t}"`);',
  '  }',
  '}',
);
const QA_NEW = line(
  'function Qa(t) {',
  '  if (process.platform === "win32") {',
  '    Fa(`explorer /select,"${t}"`);',
  '  } else if (process.platform === "darwin") {',
  '    // macOS 没有 explorer；open -R 在 Finder 中定位该文件',
  '    Fa(`open -R "${t}"`);',
  '  }',
  '}',
);

const EDITS = {
  'src/background.js': [
    {
      desc: 'aria2 二进制按平台选择',
      from: String.raw`const aria2cPath = path.join(__dirname, "..", "bin", "aria2c.exe");`,
      to: String.raw`const aria2cPath = path.join(__dirname, "..", "bin", process.platform === "win32" ? "aria2c.exe" : "aria2c");`,
    },
    {
      desc: '窗口图标按平台选择（macOS 托盘不认 .ico）',
      from: String.raw`icon: path.join(__dirname, "logo.ico"),`,
      to: String.raw`icon: path.join(__dirname, process.platform === "win32" ? "logo.ico" : "logo.png"),`,
    },
    {
      desc: '托盘图标按平台选择',
      from: String.raw`tray = new Tray(path.join(__dirname, "logo.ico"));`,
      to: String.raw`tray = new Tray(path.join(__dirname, process.platform === "win32" ? "logo.ico" : "logo.png"));`,
    },
    {
      desc: 'hookWindowMessage(WM_CLIPBOARDUPDATE) 加平台守卫',
      from: line(
        '      win.hookWindowMessage(278, function () {',
        '        win.setEnabled(false);',
        '        setTimeout(() => {',
        '          win.setEnabled(true);',
        '        }, 100);',
        '        return true;',
        '      });',
      ),
      to: line(
        '      // 278 = WM_CLIPBOARDUPDATE，是 Windows 专有窗口消息；',
        '      // macOS / Linux 上没有这个 API，直接跳过（原版这里是未捕获异常）。',
        '      if (process.platform === "win32" && typeof win.hookWindowMessage === "function") {',
        '        win.hookWindowMessage(278, function () {',
        '          win.setEnabled(false);',
        '          setTimeout(() => {',
        '            win.setEnabled(true);',
        '          }, 100);',
        '          return true;',
        '        });',
        '      }',
      ),
    },
    {
      desc: '关机命令按平台分支',
      from: String.raw`ipcMain.on("shutdown", () => exec("shutdown /s /t 0", error => win.webContents.send("shutdown-result", !error)));`,
      to: line(
        'ipcMain.on("shutdown", () => {',
        '  // Windows 用 shutdown，macOS 走 AppleScript（不额外要 sudo）',
        '  const shutdownCommand = process.platform === "win32"',
        '    ? "shutdown /s /t 0"',
        '    : `osascript -e \'tell app "System Events" to shut down\'`;',
        '  exec(shutdownCommand, error => win.webContents.send("shutdown-result", !error));',
        '});',
      ),
    },
    {
      desc: '自动更新：非 Windows 直接跳过（更新源只有 Windows 构建）',
      from: line(
        'ipcMain.on("startUpdate", async (event, arg) => {',
        '  autoUpdater.setFeedURL("https://zhouql.vip/bdupdate/win32");',
      ),
      to: line(
        'ipcMain.on("startUpdate", async (event, arg) => {',
        '  // 更新源只有 Windows(NSIS) 构建，其它平台下载到也无法安装，直接忽略',
        '  if (process.platform !== "win32") return;',
        '  autoUpdater.setFeedURL("https://zhouql.vip/bdupdate/win32");',
      ),
    },
  ],
  'src/views/Download.vue': [
    { desc: 'ffmpeg 路径按平台选择', from: FFMPEG_OLD, to: FFMPEG_NEW, all: true },
    { desc: 'Qa() 补 macOS 分支', from: QA_OLD, to: QA_NEW },
  ],
  'src/views/Tools.vue': [
    { desc: 'ffmpeg 路径按平台选择', from: FFMPEG_OLD, to: FFMPEG_NEW, all: true },
    { desc: 'Qa() 补 macOS 分支', from: QA_OLD, to: QA_NEW },
  ],
  'src/App.vue': [
    {
      desc: '更新检查在非 Windows 上不再请求 win32 源（原版无 catch，会抛未处理拒绝）',
      from: line(
        'async function $t() {',
        '  return request.get(`https://zhouql.vip/bdupdate/win32/latest.yml?${new Date().getTime()}`);',
        '}',
      ),
      to: line(
        'async function $t() {',
        '  // 更新源只发布 Windows 构建；其它平台直接回当前版本，避免 404 与误报有更新',
        '  if (process.platform !== "win32") {',
        '    return {',
        '      data: `version: ${fe.app.getVersion()}`',
        '    };',
        '  }',
        '  return request.get(`https://zhouql.vip/bdupdate/win32/latest.yml?${new Date().getTime()}`);',
        '}',
      ),
    },
  ],
};

function applyCodeEdits() {
  for (const [rel, edits] of Object.entries(EDITS)) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) {
      warnings.push(`找不到 ${rel}，跳过`);
      continue;
    }
    let text = fs.readFileSync(file, 'utf8');
    const before = text;

    for (const edit of edits) {
      if (text.includes(edit.to)) continue;           // 已应用（幂等）
      if (!text.includes(edit.from)) {
        warnings.push(`${rel}: 未匹配到「${edit.desc}」的原文，跳过`);
        continue;
      }
      text = edit.all
        ? text.split(edit.from).join(edit.to)
        : text.replace(edit.from, edit.to);
      const n = edit.all ? before.split(edit.from).length - 1 : 1;
      report.push(`${rel}: ${edit.desc}${n > 1 ? `（${n} 处）` : ''}`);
    }

    if (text !== before) {
      if (!DRY) fs.writeFileSync(file, text);
      changes.push(`${rel} (macOS)`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 外部二进制
 * ------------------------------------------------------------------ */

/**
 * 已知的二进制候选路径（按优先级）。
 *
 * `aria2c` 特别说明：Motrix（Electron 写的下载器）内置了 aria2c 引擎，
 * 很多 macOS 用户机器上本来就有，不必额外 `brew install aria2`。
 * 注意 aria2 是 GPLv2+，本地使用没问题，但**不要**把二进制提交进仓库。
 */
const BIN_CANDIDATES = {
  aria2c: [
    '/Applications/Motrix.app/Contents/Resources/engine/aria2c',
    '/opt/homebrew/bin/aria2c',
    '/usr/local/bin/aria2c',
  ],
  ffmpeg: [
    '/opt/homebrew/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
  ],
};

/** 在 bin/ 下为系统二进制建软链（Windows 版自带 .exe，这里用系统/RPATH 里的） */
function linkBinary(name) {
  const target = path.join(BIN, name);
  if (fs.existsSync(target)) {
    report.push(`bin/${name} 已存在，跳过`);
    return;
  }

  let resolved = null;
  // 1) 先看 PATH
  try {
    resolved = execFileSync('/usr/bin/which', [name], { encoding: 'utf8' }).trim();
  } catch (e) {
    resolved = null;
  }
  // 2) 再看已知候选位置
  if (!resolved) {
    for (const c of BIN_CANDIDATES[name] || []) {
      if (fs.existsSync(c)) { resolved = c; break; }
    }
  }

  if (!resolved) {
    warnings.push(
      `bin/${name} 不存在，PATH 与常见位置都没找到。` +
      (name === 'aria2c'
        ? ' 可 `brew install aria2`，或安装 Motrix；装好后重跑本脚本。'
        : ''),
    );
    return;
  }
  if (!DRY) {
    fs.mkdirSync(BIN, { recursive: true });
    fs.symlinkSync(resolved, target);
  }
  const from = resolved.includes('Motrix.app') ? '（Motrix 内置引擎）' : '（系统二进制）';
  report.push(`bin/${name} → ${resolved}${from}`);
  changes.push(`bin/${name}`);
}

/**
 * macOS 的 Tray 对 .ico 支持很差，需要一份 png。
 * 优先用 sips（系统自带），失败则退回 ffmpeg。
 */
function makeLogoPng() {
  const png = path.join(SRC, 'logo.png');
  if (fs.existsSync(png)) return;
  const ico = path.join(SRC, 'logo.ico');
  if (!fs.existsSync(ico)) {
    warnings.push('找不到 src/logo.ico，无法生成 logo.png');
    return;
  }
  const attempts = [
    ['/usr/bin/sips', ['-s', 'format', 'png', ico, '--out', png]],
    ['ffmpeg', ['-y', '-i', ico, '-frames:v', '1', '-vf', 'scale=256:256', png]],
  ];
  for (const [bin, args] of attempts) {
    try {
      execFileSync(bin, args, { stdio: 'ignore' });
      if (fs.existsSync(png)) {
        report.push(`src/logo.png 已生成（${path.basename(bin)}）`);
        changes.push('src/logo.png');
        return;
      }
    } catch (e) { /* 试下一个 */ }
  }
  warnings.push('logo.png 生成失败（sips / ffmpeg 都不可用）；macOS 托盘图标会缺失');
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */

console.log('\n=== macOS 适配 ===');
applyCodeEdits();
linkBinary('ffmpeg');
linkBinary('aria2c');
makeLogoPng();

for (const r of report) console.log('  ✓ ' + r);
for (const w of warnings) console.log('  ⚠ ' + w);
console.log(`\n改动 ${changes.length} 个文件/资源`);
if (DRY) console.log('  （--dry-run：未写入）');
console.log('');
