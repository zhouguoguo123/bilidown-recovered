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
      customFileProtocol: 'app://./',
      mainProcessFile: 'src/background.js',
      // 主进程用 path.join(__dirname, '..', 'bin', 'aria2c.exe') 定位外部程序，
      // 所以 aria2c.exe / ffmpeg.exe / aria2c.conf 必须被复制到 resources/bin
      extraResources: [
        { from: 'bin', to: 'bin' }
      ],
      builderOptions: {
        appId: 'vip.zhouql.bilidown',
        productName: 'Bilidown',
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
        }
      }
    }
  }
})
