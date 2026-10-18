# Bilidown 1.2.7 — 源码还原 & macOS 二开

从 `Bilidown 1.2.7 单文件版.exe`（NSIS 安装包）逐层解包、还原出的
**Electron + Vue 2 + webpack** 桌面应用源码，并做了 macOS 适配与一系列缺陷修复。

---

## 来源与作者

| 角色 | 信息 |
|---|---|
| **原作者** | **王子周棋洛** |
| 原作者 B 站主页 | https://space.bilibili.com/1608325226?spm_id_from=333.337.0.0 |
| 原程序版本 | Bilidown 1.2.7（Windows，NSIS 单文件安装包） |
| **二开作者** | **zhouguoguo123**（本仓库维护者） |

> ⚠️ **这不是官方仓库。** 原程序及其源码版权归原作者「王子周棋洛」所有，
> 原仓库已删除。本仓库是基于发布产物的**逆向还原**，并在此基础上做了
> macOS 适配与缺陷修复。仅供学习与研究使用，**请勿用于商业用途**。
> 若原作者认为不妥，请联系删除。

---

## 分支说明

| 分支 | 内容 | 用途 |
|---|---|---|
| **`main`** | macOS 适配版 | 在 macOS 上可构建、可运行（本仓库默认分支） |
| **`win`** | 原版 Windows 行为 | 剥离了 macOS 适配，保持原程序在 Windows 下的逻辑 |

两个分支共享同一套还原代码与缺陷修复，差异仅在**平台适配**部分
（`tools/apply-macos-port.js` / `tools/revert-macos-port.js` 可互相转换）。

```bash
git checkout main   # macOS 版
git checkout win    # Windows 版
```

---

## 快速开始（macOS）

```bash
cd recovered-source

# 1) 依赖安装
#    electron 二进制建议手动放置，见「环境注意」
ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install

# 2) 构建渲染进程
npm run build

# 3) 开发运行（普通终端里执行，不要用浏览器打开它输出的地址）
npm run electron:serve
```

打包成 `.app` / `.zip`：

```bash
ELECTRON_BUILDER_CACHE=/tmp/eb-cache npx vue-cli-service electron:build --mac dir
ditto -c -k --keepParent dist_electron/mac-arm64/Bilidown.app Bilidown-1.2.7-arm64.zip
```

生成 `.dmg` 需要 `hdiutil`（要挂载卷的特权），请在**普通终端**执行：

```bash
npx vue-cli-service electron:build --mac dmg
```

### Windows

```bash
git checkout win
cd recovered-source
npm install
npm run electron:build -- --win nsis
```

> `win` 分支的 `bin/*.exe` 未入库（见 `.gitignore`）。
> 请从原安装包的 `resources/bin/` 解出
> `aria2c.exe`、`ffmpeg.exe`、`aria2c.conf` 放到 `recovered-source/bin/`。

---

## 目录结构

```
.
├── recovered-source/             可构建的完整源码
│   ├── src/
│   │   ├── background.js         Electron 主进程
│   │   ├── main.js               渲染进程入口
│   │   ├── App.vue  views/  components/
│   │   ├── store/  router/  plugins/
│   │   └── assets/               css / fonts / media
│   ├── tools/                    ★ 逆向与修复工具链
│   ├── bin/                      外部二进制（aria2c / ffmpeg / conf）
│   ├── HANDOVER.md               ★ 交接文档：修复清单 / 保真度 / 平台适配
│   └── README-RECOVERY.md        还原过程详解
├── recovered/                    asar 解出的原始产物（还原证据 + 工具输入）
└── extracted/                    安装包解包中间产物（不入库）
```

---

## 还原方式

```
Bilidown 1.2.7 单文件版.exe       NSIS 自解压安装包
  └─ $PLUGINSDIR/app-64.7z        真正的载荷
      └─ resources/app.asar       Electron 应用归档
          ├─ background.js        主进程 bundle
          └─ assets/js/*.js       渲染进程 bundle（app + chunk-vendors）
```

还原流水线（脚本都在 `recovered-source/tools/`）：

| 工具 | 作用 |
|---|---|
| `webpack-modules.js` | 基于 Babel AST 拆分 webpack bundle |
| `module-context.js` | 查看压缩标识符的上下文，用于恢复语义 |
| `validate-src.js` | 脚本静态体检（未声明标识符 / 重复声明 / 残留 webpack 调用） |
| `validate-template.js` | **模板**静态体检（模板表达式里的未定义变量） |
| `apply-fixes.js` | 主修复脚本：修复缺陷、注入遗漏的模块级定义 |
| `restore-styles.js` | 从 CSS 产物反推样式源码（`<style scoped>` + 全局样式） |
| `apply-macos-port.js` | 叠加 macOS 平台适配（main 分支） |
| `revert-macos-port.js` | 反向剥离 macOS 适配（生成 win 分支） |

---

## 还原保真度

| 产物 | 与原始包差异 |
|---|---|
| `app.css` | **+0.01%** |
| `chunk-vendors.css` | −1.86% |
| 字体 / 音频 | **contenthash 完全一致（字节级相同）** |
| `app.js` | +5.3% |
| `chunk-vendors.js` | +9.5% |

主进程 `background.js` 经逐 token 校验与原始等价。JS 侧的差异主要来自依赖补丁版本。

---

## 已修复的缺陷

交接文档记录的 4 项，加上后续发现并修复的 11 项。其中**构建期完全静默、只有运行时才暴露**的有 8 项：

| 缺陷 | 现象 | 根因 |
|---|---|---|
| Electron 版本用错 | 界面全白 | 原版内嵌 Chromium 91（Electron 13.x）；用 22 会因内置 `remote` 被移除而崩 |
| `var Ba = xa` 提前引用 | `Cannot access 'xa' before initialization` | 生成器在 `const xa` 定义前也生成了一句立即执行的赋值（TDZ） |
| 自研组件缺 `install` | `<b-button>` 渲染不出来 | 原 bundle 在 `normalizeComponent` 之后挂的，不在组件 options 里 |
| Dexie 扩展方法丢失 | `checkIfTableHasData is not a function` | 顶层「属性赋值表达式语句」被整条漏掉 |
| 依赖认错（两处） | `ERR_REQUIRE_ESM` / 二维码报错 | `get-port` 实为 `portfinder`；`qrcode` 实为 `qrcodejs2` |
| 模板 `v-model` 用了不存在的变量 | 下载列表空 | `v-model="v.aModel"`（`v` 未定义，应为 `i`） |
| `el-option` 丢别名前缀 | 清晰度/音质下拉不显示 | `:value="qnDesc"` 应为 `t.qnDesc` |
| 正则转义丢失 | 文件夹名全是兜底随机名 | `/\.*$/g` 被还原成 `/.*$/g`，清空了整个字符串 |

此外还修复了：全量 `<style>` 块丢失、element-ui 未按需引入、moment locale 未裁剪、
模板 `v-if` 重复属性、`new (Plyr())/new (Aria2())` 误译、
恢复任务缺 `audio` 字段导致点下载崩溃等。

---

## macOS 适配

原版只发布 Windows。`tools/apply-macos-port.js` 以**叠加**方式补齐 11 处平台差异：

- aria2 / ffmpeg 二进制按平台选择
- 窗口与托盘图标（macOS 不认 `.ico`）
- `hookWindowMessage(278)` 加平台守卫（Windows 专有 API）
- 关机命令改用 AppleScript
- 自动更新在非 Windows 上跳过（更新源只有 Windows 构建）
- `Qa()` 补 `open -R`（Finder 定位文件）
- 更新检查不再请求 win32 源

实测（Apple Silicon）：界面渲染正常、路由正常、aria2 RPC 正常（`1.36.0`）、
列表与系列解析正常、文件夹命名正常。

---

## 环境注意

- **Electron 二进制**：`@electron/get` 直连 GitHub 会超时，且缓存目录固定在
  `~/Library/Caches/electron`。建议 `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install`
  后手动把二进制放到 `node_modules/electron/dist/`（详见 `HANDOVER.md` 第六节）。
- **`customFileProtocol` 必须是 `'./'`**：否则产物里出现 `app:///assets/...`，
  Chromium 会把三斜杠后的首段当 host，导致 CSS 字体全部 404。
- **`extraResources` 必须写在 `builderOptions` 内**，放外层不生效。
- **不要混用不同 Electron 版本的 user-data-dir**：IndexedDB 会被高版本写坏
  （日志里是 `Cookie database is too new`），表现为下载页卡在「正在恢复待下载数据…」。
- **`aria2c` / `ffmpeg` 不入库**（多为 GPL 授权且体积大）。
  macOS 下 `apply-macos-port.js` 会自动在 `bin/` 建软链，
  包括复用 **Motrix 内置的 aria2c 引擎**。

---

## 免责声明

本项目仅用于**学习与研究**（软件逆向、Electron 应用结构与打包机制）。
原程序「Bilidown」及其源码版权归原作者 **王子周棋洛** 所有。

- 请勿将本仓库内容用于商业用途
- 请勿用于侵犯 B 站服务条款或他人权益的用途
- 若原作者要求，应立即删除本仓库

使用本仓库产生的任何后果由使用者自行承担。
