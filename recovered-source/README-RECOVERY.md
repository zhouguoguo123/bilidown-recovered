# Bilidown 源码逆向还原说明

本目录是从 **`Bilidown 1.2.7 单文件版.exe`** 逆向还原出来的项目源码。

> 结论先说：这个 exe **不是 PyInstaller 打包的 Python 程序**，而是
> **Electron + Vue 2 + webpack** 打包的桌面应用。它的"源码"是 JavaScript，
> 被压缩混淆但没有编译成机器码，因此**可以高保真还原**——
> 不是猜出来的伪代码，而是从 bundle 里逐层剥出来的真实业务逻辑。

---

## 一、还原过程

原 exe 是一个 **NSIS 单文件安装包**（Nullsoft Install System v3.04，使用 `nsis7z` 插件）。
逐层解包：

| 层级 | 内容 | 大小 |
|---|---|---|
| 1 | `Bilidown 1.2.7 单文件版.exe` | NSIS 自解压安装包，79 MB |
| 2 | `$PLUGINSDIR/app-64.7z` | 安装包真正的载荷，78.6 MB |
| 3 | `resources/app.asar` | Electron 应用归档，13 MB |
| 4 | `background.js` + `assets/js/*.js` | webpack 打包产物 |

```bash
# 1. 解 NSIS
7zz x "Bilidown 1.2.7 单文件版.exe" -oextracted
# 2. 解 7z 载荷，取出 asar
7zz e 'extracted/$PLUGINSDIR/app-64.7z' -oout "resources/app.asar"
# 3. 解 asar（见 tools/asar_extract.py）
```

asar 里是 17 个文件：`background.js`(266 KB)、`assets/js/app.*.js`(400 KB)、
`assets/js/chunk-vendors.*.js`(996 KB)、`index.html`、字体、图标、`logo.ico` 等。

### 反编译流水线

1. **反压缩** —— 用 `webcrack` 把只有 1 行的 minified bundle 还原成带缩进的可读代码。
2. **拆 webpack** —— 主进程 bundle 拆成 158 个独立模块；
   渲染进程拆成 10 个模块（webpack 的 scope hoisting 把整个应用合并进了模块 643，
   共 9556 行）。
3. **识别依赖** —— 通过组件的 `name` 属性、特征字符串、版本常量，
   把每个 webpack module id 映射回真实 npm 包：
   `vue@2.7.14`、`vuex@3.6.2`、`vue-router@3.6.5`、`vue-lazyload@1.3.5`、
   `dexie@4.0.8`、`plyr@3.7.8`、`element-ui`、`axios`、`moment`、`qrcode`、
   `canvas-confetti`、`vue-contextmenujs`、`aria2` 等。
4. **模板反编译** —— 自研 render→template 转换器
   （`tools/render2template.js`，约 600 行），把 vue-template-compiler 产出的
   `_c(...)` render 函数还原成 `<template>` 语法。
   处理了 `_v/_s/_e/_l/_m/_t`、`v-if/v-else` 三元、`v-for` 回调、
   `v-model`（指令式与组件 `model:` 两种）、`v-show/v-lazy/v-loading`、
   `.prevent/.stop/.enter` 修饰符、`_k` 键码守卫、`slot`、`scopedSlots` 等。
   **10 个组件全部 100% 转换成功，零残留节点。**
5. **import 还原** —— 用 Babel 作用域分析（binding-aware，能正确区分
   被局部变量遮蔽的同名标识符）把压缩别名还原：
   `$.default` → `Vue`、`it.Ay` → `Vuex`、`xe.Ay` → `VueRouter`、
   `at.A` → `axios`、`ce.Ay` → `Dexie`、`A()` → `Button`、
   `Is()` → `Plyr`、`ia()` → `Aria2`、`De.A` → `normalizeComponent` 等 43 条规则。
6. **依赖内联** —— 组件引用的顶层辅助函数/类/常量按需内联进各自的 `.vue`，
   store / router 则提取成独立模块并改为 import。

---

## 二、目录结构

```
recovered-source/
├── package.json              依赖清单（版本部分由 bundle 内证据确定）
├── vue.config.js             构建配置（推断 + 产物证据校正）
├── babel.config.js           element-ui 按需引入
├── public/index.html
├── bin/                      外部二进制（Windows 的 aria2c.exe / ffmpeg.exe / conf；
│                             macOS 下由 apply-macos-port.js 软链系统二进制）
├── tools/                    ★ 逆向与修复工具链（含 apply-macos-port.js）
├── HANDOVER.md               交接文档（含修复清单与保真度对比）
├── README-RECOVERY.md        本文件
└── src/
    ├── background.js         ✅ Electron 主进程（284 行）
    ├── main.js               ✅ 渲染进程入口
    ├── App.vue               ✅ 根组件
    ├── router/index.js       ✅ 路由 + 导航守卫
    ├── store/index.js        ✅ Vuex store（14 个 mutation）
    ├── plugins/
    │   ├── notify.js         ✅ $notify 提示插件
    │   ├── request.js        ✅ axios 单例 + 离线拦截器
    │   └── electron.js       ✅ remote/shell/ipcRenderer 统一出口
    ├── assets/
    │   ├── css/global.css    ✅ 全局样式（从 CSS 产物反推，555 条规则）
    │   ├── fonts/            ✅ iconfont.ttf、苹方黑体-中粗-简.ttf
    │   └── media/            ✅ no.mp3 + 5 个提示音
    ├── views/
    │   ├── Search.vue        ✅ 搜索页
    │   ├── Download.vue      ✅ 下载页（最大）
    │   ├── Setting.vue       ✅ 设置页
    │   ├── Account.vue       ✅ 账号页（扫码登录）
    │   └── Tools.vue         ✅ 工具箱（ffmpeg 混流、NFO/SRT 生成等）
    └── components/
        ├── BButton.vue       ✅ 自研按钮（含 scoped 样式 42 条）
        ├── BEmpty.vue        ✅ 空状态（12 条）
        ├── BPlayer.vue       ✅ Plyr 播放器封装
        └── BProgress.vue     ✅ 进度条（3 条）
```

---

## 三、还原保真度

| 部分 | 保真度 | 依据 |
|---|---|---|
| 主进程 `background.js` | **逐 token 等价** | 78 个字面量（值+顺序）、20 个事件监听体、10 个 IPC 通道逐一比对一致；规范化 AST token 流 803 vs 803 完全相同 |
| 组件 `<template>` | **高** | 由 render 函数机械反编译，结构、绑定、事件、指令完整；仅原始缩进/换行排版无法复原 |
| 组件 `<script>` | **高** | 方法名、字符串、常量、控制流完整；函数内局部变量名仍是压缩后的 `t/e/i` |
| 样式 | **高** | 从 CSS 产物反推；重建后 `app.css` 与原始仅差 8 字节（+0.01%） |
| 二进制资源 | **字节级一致** | 字体与音频重新构建后 contenthash 与原始完全相同（`21b84876` / `a2eb3c0b` / `956e656b`） |
| 路由 / store / main.js | **高** | 结构完整，已改写为标准 import |
| `vue.config.js` | **推断 + 校正** | 构建期文件不进 asar；已按产物特征（assetsDir、按需引入、moment 裁剪等）逐项校正 |
| 依赖版本 | **基本确定** | Electron 由 `Bilidown.exe` 内嵌 `Chrome/91.0.4472.164` 定为 **13.6.9**；vue/vuex/vue-router/vue-lazyload/dexie/plyr/aria2/portfinder/lunar-javascript 均由 bundle 内特征确定 |

### 主进程 IPC 通道（已逐一核对）

- 渲染 → 主：`clearCookie`、`restart-aria2`、`shutdown`、`startUpdate`、
  `updateApp`、`getAria2Port`、`check-tray-status`、
  `listen-clipboard-status-change`、`tasks-saved`、`listen-clipboard-focus`
- 主 → 渲染：`protocolParserLink`、`aria2-exit`、`aria2-restart-status`、
  `shutdown-result`、`updateDownProgress`、`updateDownSuccess`、`Aria2Port`、
  `save-tasks`、`clipboard-change`

---

## 四、收尾情况（原「已知待办」，均已完成）

| 原待办 | 状态 |
|---|---|
| 替换残留的 webpack 资源引用（`i(9122)` 等音频、`i(9118)` qrcode） | ✅ 5 个音频 → `assets/media/tip-*.mp3`；qrcode → `import QRCode from 'qrcode'` |
| 补齐静态资源（`recovered/assets/`、`logo.ico`） | ✅ 已复制；音频产物名 `no.956e656b.mp3` 还原为源文件名 `no.mp3` |
| 补齐外部二进制（`aria2c.exe`/`ffmpeg.exe`/`aria2c.conf`） | ✅ 已从 `extracted/$PLUGINSDIR/app-64.7z` 的 `resources/bin/` 解出到 `bin/` |
| `npm install` + `npm run electron:serve` 验证 | ✅ 依赖安装、渲染进程与主进程均构建通过（GUI 启动见第六节沙箱说明） |
| 依赖版本修正 | ✅ `aria2` 锁定 4.1.2（`^4.10.0` 在 npm 上不存在）；补装 `lunar-javascript` |

### 本轮额外修复的缺陷（交接文档未列出）

- **`new (Plyr())` / `new (Aria2())` 误译**：原 bundle 是 `new (i.n(module)())`，
  `i.n()` 是 webpack 的「取默认导出」getter；`import X from 'pkg'` 之后 X 已是类本身。
- **全部 `<style>` 块丢失**：已由 `tools/restore-styles.js` 从 CSS 产物反推还原
  （`global.css` 555 条 + 4 个组件的 `<style scoped>` 共 81 条）。
- **element-ui 未按需引入**：原始 vendor 里不含未使用组件，已启用 `babel-plugin-component`。
- **moment 全量 locale 被打包**：原始 vendor 里 `defineLocale` 出现 0 次，已用 `IgnorePlugin` 裁剪。
- **模板 `v-if` 重复属性**：反编译器把 `a && b ? X : _e()` 拆成两个 `v-if`，已合并。

详见 `HANDOVER.md` 第三节与第五节（含产物字节级对比）。

---

## 五、原始产物与可复现性

还原流程用到的中间产物：

| 路径 | 内容 |
|---|---|
| `recovered/` | 从 asar 直接解出的原始文件（未改动），还原的唯一证据来源 |
| `extracted/` | NSIS 解包结果，含 `$PLUGINSDIR/app-64.7z` 与三个 NSIS 插件 dll |
| `recovered-source/tools/` | ★ 逆向与修复工具链（见 `HANDOVER.md` 第四节） |
| `/tmp/bd_payload/` | `app-64.7z` 解包结果（含 `resources/app.asar`、`resources/bin/`） |
| `/tmp/bd_src_backup/` | 生成器原始输出（修复前的 `src/`，重建流程的起点） |
| `/tmp/bd_app_beauty.js` | 美化后的渲染进程 bundle（读代码用） |

工具链用法（`recovered-source/tools/`）：

```bash
node webpack-modules.js <bundle> <outDir> --list   # AST 级拆包
node module-context.js <标识符> --radius 90        # 查看压缩标识符的上下文
node validate-src.js                               # 静态体检（应为 0 问题）
node apply-fixes.js                                # 修复 + 恢复样式（幂等）
node restore-styles.js                             # 单独重跑样式恢复
```

> `/tmp` 内容重启会丢；拆包结果可用 `tools/webpack-modules.js` 从 `recovered/` 重新生成。
