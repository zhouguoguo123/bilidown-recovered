#!/usr/bin/env node
/**
 * revert-macos-port.js —— 反向剥离 `apply-macos-port.js` 加的 macOS 适配
 *
 * 用途：从 macOS 适配版源码生成「原版 Windows 行为」的源码，用于 `win` 分支。
 *
 * 只剥离**为跑 macOS 而新增/改写**的地方；原版 bundle 里本来就有的跨平台分支
 * （`jt()` 的 darwin 分支、`window-all-closed` 的 darwin 判断等）**保留**。
 *
 * 幂等：可重复运行。
 *
 * 用法：node tools/revert-macos-port.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');

const line = (...xs) => xs.join('\n');

const EDITS = {
  'src/background.js': [
    {
      desc: 'aria2 二进制还原为 aria2c.exe',
      from: String.raw`process.platform === "win32" ? "aria2c.exe" : "aria2c"`,
      to: String.raw`"aria2c.exe"`,
      all: true,
    },
    {
      desc: '图标还原为 logo.ico',
      from: String.raw`process.platform === "win32" ? "logo.ico" : "logo.png"`,
      to: String.raw`"logo.ico"`,
      all: true,
    },
    {
      desc: 'hookWindowMessage 去掉平台守卫',
      from: line(
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
      to: line(
        '      win.hookWindowMessage(278, function () {',
        '        win.setEnabled(false);',
        '        setTimeout(() => {',
        '          win.setEnabled(true);',
        '        }, 100);',
        '        return true;',
        '      });',
      ),
    },
    {
      desc: '关机命令还原为 Windows 版',
      from: line(
        '  // Windows 用 shutdown，macOS 走 AppleScript（不额外要 sudo）',
        '  const shutdownCommand = process.platform === "win32"',
        '    ? "shutdown /s /t 0"',
        '    : `osascript -e \'tell app "System Events" to shut down\'`;',
        '  exec(shutdownCommand, error => win.webContents.send("shutdown-result", !error));',
      ),
      to: String.raw`  exec("shutdown /s /t 0", error => win.webContents.send("shutdown-result", !error));`,
    },
    {
      desc: '自动更新去掉非 Windows 短路',
      from: line(
        '  // 更新源只有 Windows(NSIS) 构建，其它平台下载到也无法安装，直接忽略',
        '  if (process.platform !== "win32") return;',
      ),
      to: '',
    },
  ],
  'src/views/Download.vue': [
    {
      desc: 'ffmpeg 路径还原为 ffmpeg.exe',
      from: String.raw`process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"`,
      to: String.raw`"ffmpeg.exe"`,
      all: true,
    },
    {
      desc: 'Qa() 去掉新增的 macOS 分支',
      from: line(
        '  if (process.platform === "win32") {',
        '    Fa(`explorer /select,"${t}"`);',
        '  } else if (process.platform === "darwin") {',
        '    // macOS 没有 explorer；open -R 在 Finder 中定位该文件',
        '    Fa(`open -R "${t}"`);',
        '  }',
      ),
      to: line(
        '  if (process.platform === "win32") {',
        '    Fa(`explorer /select,"${t}"`);',
        '  }',
      ),
    },
  ],
  'src/views/Tools.vue': [
    {
      desc: 'ffmpeg 路径还原为 ffmpeg.exe',
      from: String.raw`process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"`,
      to: String.raw`"ffmpeg.exe"`,
      all: true,
    },
    {
      desc: 'Qa() 去掉新增的 macOS 分支',
      from: line(
        '  if (process.platform === "win32") {',
        '    Fa(`explorer /select,"${t}"`);',
        '  } else if (process.platform === "darwin") {',
        '    // macOS 没有 explorer；open -R 在 Finder 中定位该文件',
        '    Fa(`open -R "${t}"`);',
        '  }',
      ),
      to: line(
        '  if (process.platform === "win32") {',
        '    Fa(`explorer /select,"${t}"`);',
        '  }',
      ),
    },
  ],
  'src/App.vue': [
    {
      desc: '更新检查去掉非 Windows 短路',
      from: line(
        '  // 更新源只发布 Windows 构建；其它平台直接回当前版本，避免 404 与误报有更新',
        '  if (process.platform !== "win32") {',
        '    return {',
        '      data: `version: ${fe.app.getVersion()}`',
        '    };',
        '  }',
      ),
      to: '',
    },
  ],
};

const changes = [];
const report = [];
const warnings = [];

for (const [rel, edits] of Object.entries(EDITS)) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { warnings.push(`找不到 ${rel}`); continue; }
  let text = fs.readFileSync(file, 'utf8');
  const before = text;

  for (const edit of edits) {
    if (!text.includes(edit.from)) {
      // 已还原（或从未应用）
      continue;
    }
    text = edit.all
      ? text.split(edit.from).join(edit.to)
      : text.replace(edit.from, edit.to);
    report.push(`${rel}: ${edit.desc}`);
  }

  if (text !== before) {
    if (!DRY) fs.writeFileSync(file, text);
    changes.push(rel);
  }
}

console.log('\n=== 剥离 macOS 适配 ===');
if (report.length) report.forEach((r) => console.log('  ✓ ' + r));
else console.log('  （没有需要还原的改动，可能已是 Windows 版）');
warnings.forEach((w) => console.log('  ⚠ ' + w));
console.log(`\n改动 ${changes.length} 个文件`);
if (DRY) console.log('  （--dry-run：未写入）');
console.log('');
