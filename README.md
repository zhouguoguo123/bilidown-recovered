# Bilidown 1.2.7 — 源码还原

从 `Bilidown 1.2.7 单文件版.exe`（NSIS 安装包）逐层解包、还原出的
**Electron + Vue 2 + webpack** 桌面应用源码。

> ⚠️ **这不是官方仓库。** 原程序由「王子周棋洛」开发（更新服务 `https://zhouql.vip`），
> 原仓库已删除。本仓库是**为学习与存档目的**做的逆向还原，版权归原作者所有。
> 若原作者要求，应立即删除。**推送到公开仓库前请自行评估法律与授权风险。**

---

## 快速开始

```bash
cd recovered-source
npm install          # 若 electron 二进制拉不下来，见下方「环境注意」
npm run build        # 渲染进程构建
npm run electron:serve
```

> `electron:serve` 请**在普通终端**里运行，不要用浏览器打开它输出的 dev server 地址
> —— 该页面依赖 `window.require`，浏览器里必然报错。

## 目录结构

```
.
├── recovered-source/          ← 可构建的完整源码
│   ├── src/
│   │   ├── background.js      Electron 主进程
│   │   ├── main.js            渲染进程入口
│   │   ├── App.vue  views/  components/
│   │   ├── store/  router/  plugins/
│   │   └── assets/            css / fonts / media
│   ├── tools/                 ★ 逆向与修复工具链
│   ├── bin/                   外部二进制（aria2c / ffmpeg，不入库）
│   ├── HANDOVER.md            ★ 交接文档：修复清单 / 保真度 / macOS 适配
│   └── README-RECOVERY.md     还原过程详解
├── recovered/                 asar 解出的原始产物（还原证据 + 工具输入）
└── extracted/                 安装包解包中间产物（不入库）
```

## 还原方式

```
Bilidown 1.2.7 单文件版.exe   NSIS 自解压安装包
  └─ $PLUGINSDIR/app-64.7z     真正的载荷
      └─ resources/app.asar    Electron 应用归档
          ├─ background.js     主进程 bundle
          └─ assets/js/*.js    渲染进程 bundle（app + chunk-vendors）
```

还原流水线（脚本都在 `recovered-source/tools/`）：

1. `webpack-modules.js` — 基于 Babel AST 拆分 webpack bundle
2. render → template 反编译、`i(<moduleId>)` → 真实依赖映射
3. `validate-src.js` — 静态体检（未声明标识符 / 重复声明 / 残留 webpack 调用）
4. `apply-fixes.js` — 修复生成器缺陷、注入遗漏的模块级定义
5. `restore-styles.js` — 从 CSS 产物反推样式源码（`<style scoped>` + 全局样式）
6. `apply-macos-port.js` — 可选：叠加 macOS 平台适配

## 保真度

| 产物 | 与原始包差异 |
|---|---|
| `app.css` | **+0.01%** |
| `chunk-vendors.css` | −1.86% |
| 字体 / 音频 | **contenthash 完全一致（字节级相同）** |
| `app.js` | +5.3% |
| `chunk-vendors.js` | +9.5% |

JS 侧的差异主要来自依赖补丁版本；主进程 `background.js` 经逐 token 校验与原始等价。

## 已修复的缺陷

交接文档记录的 4 项（axios 单例与拦截器丢失、router/store 缺 import、`i(...)` 残留），
以及后续发现的 11 项。其中**构建期完全发现不了、只有跑起来才暴露**的有 6 项：

- **Electron 版本**：原版内嵌 Chromium 91 ⇒ Electron 13.x；用 22 会因内置 `remote` 被移除而白屏
- **TDZ 崩溃**：`var Ba = xa;` 被生成在 `const xa` 之前，顶层立即执行触发
  `Cannot access 'xa' before initialization`
- **4 个自研组件缺 `install`**：原 bundle 在 `normalizeComponent` 之后挂的，
  导致 `<b-button>` / `<b-empty>` 被当作未知元素、渲染不出来
- **顶层属性赋值语句丢失**（`ue.checkIfTableHasData = async function...`）：
  与缺陷 B 同源，`he.checkIfTableHasData is not a function`
- **依赖认错两处**：`get-port`（ESM-only）实为 `portfinder`；
  扫码登录的 `qrcode` 实为 **`qrcodejs2`**（API 完全不同）

## macOS 适配

原版只发布 Windows。`tools/apply-macos-port.js` 以**叠加**方式补齐 11 处平台差异
（aria2/ffmpeg 路径、`hookWindowMessage` 守卫、关机命令、托盘图标、Finder 定位、更新源），
不污染纯还原版本。

```bash
node tools/apply-fixes.js        # 纯还原（等价于原 Windows 程序）
node tools/apply-macos-port.js   # 叠加 macOS 适配
```

实测结果（Apple Silicon）：界面渲染成功、路由正常、主进程 aria2 端口分配正常；
下载与混流功能需自备 `aria2c` / `ffmpeg`。

## 环境注意

- **Electron 二进制**：`@electron/get` 直连 GitHub 会超时，且缓存目录固定在
  `~/Library/Caches/electron`。建议用
  `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install` 然后在
  `node_modules/electron/dist/` 手动放置对应平台的二进制（详见 `HANDOVER.md` 第六节）。
- **`aria2c` / `ffmpeg` 不入库**（多为 GPL 授权且体积大）。
  macOS 上 `tools/apply-macos-port.js` 会自动在 `bin/` 建软链——包括复用
  **Motrix 内置的 aria2c 引擎**（`/Applications/Motrix.app/Contents/Resources/engine/aria2c`）。
- **npm 缓存**：若 `~/.npm` 权限异常导致 EPERM，可在 `recovered-source/.npmrc` 里
  把 `cache` 指到可写目录。
