/**
 * electron.js — 渲染进程里对 electron 远程对象的统一引用（从 app.asar 还原）
 *
 * 原 bundle 里这三行是 module 级声明：
 *   const { remote: xt } = window.require("electron")
 *   const { shell: kt }  = window.require("electron")
 *   const { spawn: St }  = window.require("child_process")
 * 各组件共享同一份。
 */
export const electronRemote = window.require("electron").remote;
export const shell = window.require("electron").shell;
export const ipcRenderer = window.require("electron").ipcRenderer;
export const childProcess = window.require("child_process");

export default { remote: electronRemote, shell, ipcRenderer, childProcess };
