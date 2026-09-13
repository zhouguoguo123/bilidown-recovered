/**
 * vue-cli + electron-builder 构建配置。
 *
 * ⚠️ 注意：vue.config.js 是构建期文件，不会被打进 app.asar，因此**没有原始文件可还原**。
 * 下面的内容是根据构建产物的可观测特征反推出来的：
 *   - 静态资源位于 assets/ 下（assets/js、assets/css、assets/fonts、assets/media）-> assetsDir
 *   - index.html 用相对路径引用 ./assets/...                                  -> publicPath './'
 *   - 渲染进程里出现 window.require('electron') 与 __dirname                  -> nodeIntegration: true
 *   - 主进程通过 createProtocol('app') 后 loadURL('app://./index.html')       -> customFileProtocol
 *   - package.json 的 main 是 background.js，渲染产物在应用根目录而非 dist 子目录
 *
 * 注意：webPreferences（nodeIntegration / contextIsolation / enableRemoteModule）
 * 由主进程 src/background.js 在 new BrowserWindow 时设置，这里不要重复配置 ——
 * 本插件版本的 electronBuilder schema 不认识这些键，会直接抛校验错误。
 */
const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  // vue-cli 的默认值就是 false；依赖本身已发布 ES5/已编译产物，
  // Electron 22（Chromium 108）也原生支持现代语法，无需再全量转译 node_modules。
  transpileDependencies: false,
  publicPath: './',
  assetsDir: 'assets',
  productionSourceMap: false,
  /**
   * moment 的 locale 裁剪。
   *
   * 另外记录一条踩过的坑：**不要设置 customFileProtocol**。
   * 一旦设置，vue-cli-plugin-electron-builder 会把 publicPath 一并改成该值，
   * 产物里就出现 `app:///assets/...` 这种绝对 URL —— 而 Chromium 会把三斜杠后的
   * 第一段当成 host：
   *   new URL('app:///assets/fonts/x.ttf') → host='assets', pathname='/fonts/x.ttf'
   * 于是 CSS 里的字体全部 404（element-icons / 苹方 / iconfont）。
   * 保持 publicPath 为 './' 输出相对路径即可：相对路径在 `app://./index.html`
   * 下能正确解析，也正是原始包产物的形态。
   * background.js 里的 createProtocol("app") 与 loadURL("app://./index.html")
   * 都是硬编码的，不依赖这个选项。
   */
  configureWebpack: {
    plugins: [
      // 原包的 chunk-vendors.js 里 `defineLocale` 出现 0 次 —— 说明构建时
      // 把 moment 的全部 locale 都裁掉了（否则会多出 140 个语言包、约 150 KiB）。
      // 这里用 IgnorePlugin 还原同样的行为。
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
    ],
  },
  pluginOptions: {
    electronBuilder: {
      // index.html 通过自定义 app:// 协议加载
      // logo.ico / logo.png 放在 public/，vue-cli 会把它们复制到构建输出根，
      // 进而打进 asar —— background.js 用 path.join(__dirname, 'logo.png') 读它们。
      //
      // 必须显式设为 './'。
      //
      // 插件（vue-cli-plugin-electron-builder/index.js:146-148）会无条件执行
      //   options.publicPath = pluginOptions.customFileProtocol || 'app://./'
      // 也就是说：不配置它也用默认的 'app://./'。该值经 webpack 规范化后，
      // 产物里就成了 `app:///assets/...`，而 Chromium 会把三斜杠后的第一段当成 host：
      //   new URL('app:///assets/fonts/x.ttf') → host='assets', pathname='/fonts/x.ttf'
      // 于是 CSS 里的字体全部 404。设为 './' 即输出相对路径 ——
      // 相对路径在 `app://./index.html` 下能正确解析，也正是原始包产物的形态。
      // （background.js 里的 createProtocol("app") 与 loadURL("app://./index.html")
      //   都是硬编码的，不受此项影响。）
      customFileProtocol: './',
      mainProcessFile: 'src/background.js',
      builderOptions: {
        appId: 'vip.zhouql.bilidown',
        productName: 'Bilidown',
        // 直接用 node_modules 里已解压的 Electron，别去下载。
        // electron-builder 默认会把 electron 的 zip 缓存到
        // ~/Library/Caches/electron（由 @electron/get 的 env-paths 固定），
        // 该路径在受限沙箱里不可写；指定 electronDist 可完全跳过下载。
        electronDist: 'node_modules/electron/dist',
        // 主进程用 path.join(__dirname, '..', 'bin', 'aria2c[.exe]') 定位外部程序，
        // 所以 aria2c / ffmpeg / aria2c.conf 必须被复制到 resources/bin。
        // ⚠️ 必须放在 builderOptions 内 —— 放在 electronBuilder 层级不会传给 electron-builder。
        //
        // filter：macOS 包里不需要 Windows 的 .exe（66 MB），排除掉。
        // 将来若要打 Windows 包，把 filter 里的 '!*.exe' 去掉即可。
        extraResources: [
          {
            from: 'bin',
            to: 'bin',
            filter: ['**/*', '!*.exe']
          }
        ],
        // 应用协议 bilidown://（background.js 里 registerProtocolAndHandleArgs 用到）。
        // Windows 上由安装包写注册表；macOS 必须在 Info.plist 里声明 CFBundleURLTypes，
        // 否则 setAsDefaultProtocolClient 不生效。
        protocols: [
          {
            name: 'Bilidown',
            schemes: ['bilidown']
          }
        ],
        // 来自原包内的 resources/app-update.yml：
        //   provider: generic / url: https://zhouql.vip / updaterCacheDirName: bilidown-updater
        publish: [
          {
            provider: 'generic',
            url: 'https://zhouql.vip/bdupdate/win32'
          }
        ],
        win: {
          target: ['nsis'],
          icon: 'src/logo.ico'
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true
        },
        mac: {
          target: ['dmg'],
          icon: 'src/logo.icns',
          category: 'public.app-category.utilities',
          // 没有 Apple 开发者证书，明确跳过签名/公证。
          // 代价：首次打开需右键「打开」，或执行
          //   xattr -cr /Applications/Bilidown.app
          identity: null
        },
        dmg: {
          title: 'Bilidown',
          // 经典的「拖进 Applications」布局
          contents: [
            { x: 140, y: 200, type: 'file' },
            { x: 400, y: 200, type: 'link', path: '/Applications' }
          ]
        }
      }
    }
  }
})
