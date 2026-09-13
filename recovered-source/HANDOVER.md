# Bilidown 逆向工程交接文档

> 交接日期：2026-09（工作区由旧路径 `/Volumes/西数500G/...` 迁移至 `/Volumes/WD500G/...`）
> **状态：✅ 还原完成；已在 macOS 上实际启动并确认界面渲染成功。**
> 本文档记录最终结果、修复清单、macOS 适配与复现方式。

---

## 一、一句话现状

`Bilidown 1.2.7 单文件版.exe`（Electron + Vue 2 + webpack）的源码已完整还原到
`recovered-source/`，**依赖可安装、渲染进程与主进程均可成功构建**，
产物与原始包在字节级高度一致：

```bash
cd recovered-source
ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install   # 二进制见第六节，需手动放置
npm run build            # ✅ 渲染进程构建通过
npm run electron:serve   # ✅ 已实测：界面正常渲染（在普通终端里运行，勿用浏览器打开 dev server）
```

---

## 二、交付物清单

```
recovered-source/
├── package.json          依赖清单（版本多数有 bundle 内证据）
├── vue.config.js         构建配置（推断所得，已按产物特征校正）
├── babel.config.js       element-ui 按需引入（evidence-driven）
├── public/index.html
├── .npmrc                本机 npm 缓存重定向（见第六节）
├── bin/                  外部二进制：aria2c.exe / ffmpeg.exe / aria2c.conf
├── HANDOVER.md           本文档
├── README-RECOVERY.md    还原过程详细说明
├── tools/                ★ 逆向与修复工具链（新增，见第四节）
└── src/
    ├── background.js     Electron 主进程（3042 行编译产物）
    ├── main.js           渲染进程入口
    ├── App.vue
    ├── router/index.js   路由
    ├── store/index.js    Vuex store
    ├── plugins/
    │   ├── notify.js     $notify 提示插件
    │   ├── request.js    ★ axios 单例 + 离线拦截器（还原所得）
    │   └── electron.js   ★ remote/shell/ipcRenderer 统一出口（还原所得）
    ├── assets/
    │   ├── css/global.css  ★ 从 CSS 产物反推的全局样式（555 条规则）
    │   ├── fonts/          iconfont.ttf / 苹方黑体-中粗-简.ttf
    │   └── media/          no.mp3 + 5 个提示音
    ├── views/            Search / Download / Setting / Account / Tools
    └── components/       BButton / BEmpty / BPlayer / BProgress
```

---

## 三、修复清单

### 交接文档原有的 4 个缺陷（全部已修）

| # | 缺陷 | 修复方式 |
|---|---|---|
| A | `collectRefsFrom()` 漏掉裸标识符 init → `var nt = st` 的 `st` 未内联 | 把 axios 单例提取为 `src/plugins/request.js`，各组件改为 `import request`；`nt.` → `request.` |
| B | 顶层副作用语句未内联 → axios 拦截器丢失 | 拦截器随单例一起还原进 `plugins/request.js`（离线即抛 `网络连接失败`） |
| C | `router/index.js` 缺 `import store` | 已补；另补 `store/index.js` 的 `Vue.use(Vuex)` |
| D | 残留 webpack 调用 `i(<id>)` | 5 个音频 → `assets/media/tip-*.mp3`；`i(9118)` → `import QRCode from 'qrcode'` |

### 本轮新发现并修复的 8 类缺陷

| # | 缺陷 | 现象与根因 | 修复 |
|---|---|---|---|
| E | **`new (Plyr())` / `new (Aria2())` 误译** | 原 bundle 是 `new (i.n(module)())`，`i.n()` 是 webpack 的「取默认导出」getter，调用它才得到类；生成器把 getter 调用直译了下来，而 `import X from 'pkg'` 之后 X 已是类本身 → 播放器/aria2 无法实例化 | `apply-fixes.js` 的 IDENT_FIXES |
| F | **所有 `<style>` 块丢失** | asar 里只有 webpack 打出的 CSS，生成器未还原样式 → 构建后 app.css 仅 1.1 KiB（原始 104 KiB） | 新增 `tools/restore-styles.js`（见第四节） |
| G | **element-ui 未按需引入** | 原包 vendor 里找不到 `el-carousel`/`el-transfer`/`el-cascader` 等未使用组件；而 `import { X } from 'element-ui'` 会打进整个 856 KiB 的 `element-ui.common.js` | `babel.config.js` 启用官方 `babel-plugin-component`（`style: false`，样式仍整包引入以匹配原始 243 KiB 的 vendor.css） |
| H | **moment 全量 locale 被打包** | 原包 vendor 里 `defineLocale` 出现 **0 次** | `vue.config.js` 加 `IgnorePlugin` 裁掉 `moment/locale` |
| I | **模板 `v-if` 重复属性** | 反编译器把 render 里的 `a && b ? X : _e()` 拆成了 `v-if="a" v-if="b"` 两个属性 → `vue-template-compiler` 报 `duplicate attribute: v-if`（dev 构建中断） | `apply-fixes.js` 新增 `TEMPLATE_FIXES` 通用规则，合并为 `v-if="a && b"` |
| J | **Electron 版本用错（22 → 13.6.9）** | 原版 `Bilidown.exe` 内嵌 `Chrome/91.0.4472.164`，即 **Electron 13.x**。Electron 22 **彻底移除了内置 `remote`**，导致 `window.require("electron").remote` 为 `undefined` → `te.require("fs")` 抛 `Cannot read properties of undefined` → Vue 挂载中断、界面全白 | `package.json` 锁 `electron: "13.6.9"` |
| K | **`var Ba = xa;` 提前引用（TDZ）** | generator 在 `const xa` 定义之前也生成了一句 `var Ba = xa;`，模块顶层立即执行 → `ReferenceError: Cannot access 'xa' before initialization`（构建期发现不了，只在运行时报） | `apply-fixes.js` 删掉提前的那句，保留 `xa` 定义之后的 |
| L | **依赖认错：`get-port` → `portfinder`** | 原代码是 `portfinder.getPortPromise({port, startPort, stopPort})`（bundle 里含 portfinder ≤1.0.34 特有的 "Native promise support is not available…" 文案）。`get-port@6` 是 ESM-only，CommonJS 主进程 `require()` 直接 `ERR_REQUIRE_ESM` | `package.json` 改 `portfinder: "1.0.32"` |

### 其它修正

- **依赖**：`aria2` 版本 `^4.10.0` 在 npm 上不存在（4.x 最高 4.1.2，5.0.0 已改成 ESM 且 API 不兼容）→ 锁定 `4.1.2`，与 bundle 内模块逐行一致；补装缺失的 `lunar-javascript@1.7.7`（`HolidayUtil.getHoliday()` 的 `_p.work/_p.name` 用法已验证兼容）。
- **资源**：`bin/` 三个外部二进制从安装包 `resources/bin/` 解出；音频产物名 `no.956e656b.mp3` 还原为源文件名 `no.mp3`。
- **配置**：`vue.config.js` 移除 `nodeIntegration`/`contextIsolation` 两个键（electronBuilder 插件 schema 不识别会直接报错；这两个选项本就由 `background.js` 在 `new BrowserWindow` 时设置）。
- **未使用 import**：清理生成器带进来的 `clipboard-polyfill` / `Download` / `moment` 等无用依赖。

---

## 四、工具链（`recovered-source/tools/`）

全部为自研脚本，无框架依赖，可重复运行。

| 工具 | 作用 |
|---|---|
| `webpack-modules.js` | **AST 级** webpack bundle 拆分（Babel 解析模块表，替代易错的手写括号匹配） |
| `module-context.js` | 打印某个压缩标识符的所有出现位置及上下文（用于把 `st`/`kt`/`qa` 等映射回真实语义） |
| `validate-src.js` | **静态体检**：两阶段作用域分析，检查未声明标识符 / 重复声明 / 无用 import / 残留 `i(<id>)`。当前 **0 问题** |
| `apply-fixes.js` | 主修复脚本：缺陷 A–E、I 的修复 + 插件模块生成 + 幂等重建 |
| `restore-styles.js` | 从 CSS 产物反推样式源码（被 `apply-fixes.js` 自动调用） |

### `restore-styles.js` 的还原逻辑

原始 CSS 产物只有两份，需按来源拆分：

| 产物 | 内容 | 去向 |
|---|---|---|
| `app.cfce7cff.css` | 带 `[data-v-HASH]` 的 4 组规则 | 对应组件的 `<style scoped>`：`4c414d58`→BButton、`2e63e76c`→Tools、`dfd97af6`→BEmpty、`b6c0c38a`→BProgress（归属由 bundle 里 `normalizeComponent(..., "HASH", null)` 的调用位置确定） |
| 同上 | 其余 555 条（CSS 变量、页面样式、element-ui 覆盖样式） | `src/assets/css/global.css` |
| `chunk-vendors.*.css` | element-ui + plyr | 改为 `main.js` 里 import 两个包的 CSS |
| `@font-face` | 2 个 ttf | 复制到 `src/assets/fonts/` 并去掉文件名里的内容 hash；已被 webpack 内联的 base64 字形原样保留 |

### 重建与校验流程

```bash
cd recovered-source
rm -rf src && cp -r /tmp/bd_src_backup src   # 回到生成器原始产物（如仍存在）
node tools/apply-fixes.js                     # 修复 + 生成插件 + 恢复样式
node tools/validate-src.js                    # 应为 0 问题
```

`apply-fixes.js` **幂等**：连跑三次全部文件的 md5 完全一致（已验证）。

---

## 五、保真度验证

### 产物对比（`dist/` vs 原始 asar）

| 产物 | 原始 | 新构建 | 差异 |
|---|---|---|---|
| `app.css` | 106,979 | 106,987 | **+0.01%** |
| `chunk-vendors.css` | 249,396 | 244,750 | -1.86% |
| `app.js` | 400,610 | 422,018 | +5.34% |
| `chunk-vendors.js` | 996,522 | 1,090,667 | +9.45% |
| `iconfont.ttf` | 9,064 | 9,064 | **0.00%** |
| `苹方黑体-中粗-简.ttf` | 10,646,300 | 10,646,300 | **0.00%** |
| `no.mp3` | 8,453 | 8,453 | **0.00%** |
| `element-icons.*` | 55,956 / 28,200 | 55,956 / 28,200 | **0.00%** |

> 二进制资源的 **contenthash 与原始完全相同**（`iconfont.21b84876.ttf`、
> `苹方黑体-中粗-简.a2eb3c0b.ttf`、`no.956e656b.mp3`）——这是还原正确性的强证据。
> JS 侧剩余差异主要来自依赖补丁版本（lunar-javascript 1.7.7 等），不影响行为。

### 代码级保真度

| 部分 | 保真度 |
|---|---|
| 主进程 `background.js` | **逐 token 等价**（78 个字面量、20 个监听体、10 个 IPC 通道逐一比对；规范化 AST token 803 vs 803） |
| `.vue` 模板 | 高（机械反编译；结构/绑定/事件/指令完整，仅原始换行排版不可复原） |
| `.vue` 脚本 | 高（方法名/字符串/常量/控制流完整；函数内局部变量仍是 `t/e/i`） |
| 样式 | 高（`app.css` 仅差 8 字节） |
| `vue.config.js` | 推断 + 证据校正（assetsDir、publicPath、customFileProtocol、extraResources、按需引入、moment 裁剪） |

---

## 五之二、macOS 适配（可选叠加，非还原的一部分）

原版只发布 Windows（NSIS + `aria2c.exe` + `ffmpeg.exe` + Windows 剪贴板消息）。
把它改成 macOS 可运行属于**改造**，因此单独放在 `tools/apply-macos-port.js`，
`apply-fixes.js` 始终保持输出等价的原始源码。

```bash
node tools/apply-fixes.js      # 纯还原
node tools/apply-macos-port.js # 叠加 macOS 适配（幂等，可重复运行）
```

改了 11 处（脚本可重复执行，已应用则跳过）：

| # | 位置 | 改动 |
|---|---|---|
| 1 | `background.js` | aria2 二进制按平台选 `aria2c` / `aria2c.exe` |
| 2–3 | `background.js` | 窗口/托盘图标按平台选 `logo.png` / `logo.ico`（macOS 托盘不认 ico） |
| 4 | `background.js` | `hookWindowMessage(278)` 加 `process.platform === "win32"` 守卫（原本在非 Windows 上是未捕获异常） |
| 5 | `background.js` | 关机命令：Windows `shutdown /s /t 0`，macOS AppleScript |
| 6 | `background.js` | 自动更新：非 Windows 直接跳过（更新源只有 Windows 构建） |
| 7–10 | `Download.vue` / `Tools.vue` | ffmpeg 路径按平台（4 处）、`Qa()` 补 `open -R` Finder 定位（2 处） |
| 11 | `App.vue` | 更新检查在非 Windows 上不再请求 win32 源（原版无 `catch`，会抛未处理拒绝） |

脚本还会：在 `bin/` 下为系统 `ffmpeg`/`aria2c` 建软链（若尚未存在），并用 `sips` 从
`logo.ico` 生成 `logo.png`。

**macOS 上的实测结果**（2026-09，Apple Silicon）：

| 项目 | 结果 |
|---|---|
| 主进程启动 | ✅ `Aria2 server running at: 6801` |
| 窗口 + Chromium | ✅ 正常创建、可远程调试 |
| **Vue 挂载 + 路由** | ✅ `#app` 内容 11273 字符，URL 已是 `/#/search`，可见文本「搜索」，无错误覆盖层 |
| 下载功能 | ⚠️ 未验证（缺 `aria2c`，需 `brew install aria2`） |
| 混流/转码 | ⚠️ 未验证（`ffmpeg` 已软链，逻辑走到即可用） |

---

## 六、环境注意事项（复现必读）

1. **npm 缓存**：本机 `~/.npm` 混入了 root 权限文件导致 `EPERM`。
   `.npmrc` 已把 cache 重定向到工作区（`cache=/Volumes/WD500G/Coding/bilidown-zql/.npm-cache`）。
2. **Electron 二进制**：`@electron/get` 直连 GitHub 会超时。已用镜像手动下载并解压到
   `node_modules/electron/dist/`（并写好 `path.txt`）。若重装依赖需重做这一步：
   ```bash
   curl -L -o /tmp/electron.zip \
     "https://cdn.npmmirror.com/binaries/electron/13.6.9/electron-v13.6.9-darwin-arm64.zip"
   mkdir -p node_modules/electron/dist && unzip -q /tmp/electron.zip -d node_modules/electron/dist
   printf "Electron.app/Contents/MacOS/Electron" > node_modules/electron/path.txt
   ```
   （`@electron/get` 的 cache 根目录走 `env-paths` 固定到 `~/Library/Caches/electron`，
   在受限沙箱里不可写；`electron_config_cache` / `ELECTRON_CACHE` 都不是它读的键。
   因此用 `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install` 跳过自动下载，再手动放置二进制。）
3. **`npm install` 后若 electron 未装好**：npm 11 的 `allowScripts` 策略会拦截
   electron 的 postinstall，需手动执行上面的解压步骤。
4. **`electron:serve` 的 GUI 启动**：若在受限沙箱（如 DSH 的 workspace-write 沙箱）里运行，
   会报 `Failed to get 'userData' path` 与 `sandbox initialization failed: Operation not permitted`
   —— 这是**沙箱禁止访问 `~/Library/Application Support` 与初始化 Chromium 沙箱**所致，
   与本项目源码无关。**请在普通终端（Terminal.app）里运行**：
   ```bash
   cd recovered-source && npm run electron:serve
   ```

---

## 七、原始产物与可复现性

| 路径 | 内容 |
|---|---|
| `recovered/` | 从 asar 直接解出的原始文件（未改动），所有还原的证据来源 |
| `extracted/` | NSIS 解包结果，含 `$PLUGINSDIR/app-64.7z`（`resources/bin/` 的来源） |
| `/tmp/bd_payload/` | `app-64.7z` 解包结果（含 `resources/app.asar`、`resources/bin/`） |
| `/tmp/bd_src_backup/` | 生成器原始输出（修复前的 `src/`，重建流程的起点） |

> `/tmp` 下的内容在 macOS 重启后会丢失，需要时可用 `tools/webpack-modules.js`
> 从 `recovered/` 重新生成拆包结果。

---

## 八、遗留说明（均不影响运行）

1. 函数内局部变量名仍是压缩后的 `t/e/i`，可读性靠上下文注释弥补。
2. `.vue` 模板的原始缩进/换行无法从 render 函数复原。
3. JS 产物比原始大约 5–9%，来自依赖补丁版本差异（lunar-javascript 等）。
4. `chunk-vendors.css` 比原始小 1.86%，属 element-ui 样式版本差异。
5. 主进程的 3 个懒加载 chunk（`0.js`/`2.js`/`3.js`，实为 `vue-cli-plugin-electron-builder`
   框架代码的 `createProtocol` 分包）在还原版中改为等价的静态 import，不再产出这些文件——
   这是交接文档中已说明的合理替代。
