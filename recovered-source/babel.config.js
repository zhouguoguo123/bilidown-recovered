/**
 * babel 配置。
 *
 * `babel-plugin-component` 是 element-ui 官方的按需引入插件：
 * 它把 `import { Button } from 'element-ui'` 改写成
 * `import Button from 'element-ui/lib/button'`，从而只打包用到的组件。
 *
 * 证据：原包的 chunk-vendors.js 里**找不到** el-carousel / el-transfer /
 * el-color-picker / el-cascader / el-rate / el-timeline 等未被使用的组件，
 * 而未做按需引入时整个 element-ui.common.js（856 KiB）都会被打进去。
 *
 * `style: false`：不要自动引入各组件样式 —— 原包的 chunk-vendors.css 是
 * 完整 theme-chalk（243 KiB），说明样式是手动整包引入的（见 src/main.js）。
 */
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ['component', { libraryName: 'element-ui', style: false }]
  ]
}
