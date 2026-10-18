/**
 * Bilidown - Electron main process
 * Reconstructed from the packaged app.asar bundle (v1.2.7).
 * Behaviour is byte-for-byte equivalent to the shipped build; only identifier
 * names and import statements were restored.
 */
import { app, BrowserWindow, ipcMain, protocol, session, Tray, Menu, shell, dialog, clipboard } from 'electron'
// NOTE: `createProtocol` is the helper shipped by the electron-builder scaffold
// (vue-cli-plugin-electron-builder). It is not a public npm package on its own, which is why
// the bundled build reached it through a webpack chunk (require.e(0)/require.e(3) -> module 294);
// it is restored here as a plain import.
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
import fs from 'fs'
import { exec, spawn, execFile } from 'child_process'
import { autoUpdater } from 'electron-updater'
import portfinder from 'portfinder'

let clipboardTimer = null;
let lastClipboardText = "";
function readClipboardText() {
  return clipboard.readText();
}
const gotTheLock = app.requestSingleInstanceLock();
let aria2Port = 6800;
let aria2Process = null;
let tray = null;
let win = null;
let aria2RestartCount = 0;
function registerProtocolAndHandleArgs(argv) {
  const protocolArgs = [];
  if (!app.isPackaged) {
    protocolArgs.push(path.resolve(process.argv[1]));
  }
  protocolArgs.push("--");
  app.setAsDefaultProtocolClient("bilidown", process.execPath, protocolArgs);
  const protocolPattern = new RegExp("^bilidown://");
  const protocolUrl = argv.find(arg => protocolPattern.test(arg));
  if (!protocolUrl || !win) {
    return;
  }
  const parsedUrl = new URL(protocolUrl);
  const {
    searchParams,
    hostname
  } = parsedUrl;
  if (hostname === "parser" && searchParams.has("link")) {
    win.webContents.send("protocolParserLink", searchParams.get("link"));
  }
}
async function startAria2(notifyRenderer = false) {
  let confPath = path.join(__dirname, "..", "bin", "aria2c.conf");
  const aria2cPath = path.join(__dirname, "..", "bin", "aria2c.exe");
  aria2Port = await async function (startPort = 6801, stopPort = 10000) {
    return await portfinder.getPortPromise({
      port: startPort,
      stopPort: stopPort
    });
  }();
  aria2Process = execFile(aria2cPath, ["--rpc-listen-port=" + aria2Port, "--conf-path=" + confPath], {
    cwd: path.resolve(__dirname, "..", "bin")
  });
  aria2Process.on("exit", (code, signal) => {
    if (aria2RestartCount < 3) {
      startAria2();
      aria2RestartCount++;
    } else {
      win.webContents.send("aria2-exit");
      aria2Process = null;
    }
  });
  if (notifyRenderer) {
    win.webContents.send("aria2-restart-status", !!aria2Process);
  }
  if (aria2Process) {
    console.log("Aria2 server running at: " + aria2Port);
  }
}
protocol.registerSchemesAsPrivileged([{
  scheme: "app",
  privileges: {
    secure: true,
    standard: true
  }
}]);
if (gotTheLock) {
  app.on("second-instance", async (event, argv, workingDirectory) => {
    if (win && win.isMinimized()) {
      win.restore();
      win.focus();
    }
    registerProtocolAndHandleArgs(argv);
  });
  app.whenReady().then(async () => {
    app.setName("Bilidown");
    await startAria2();
    await async function () {
      win = new BrowserWindow({
        width: 1100,
        height: 730,
        minWidth: 1030,
        minHeight: 730,
        show: false,
        autoHideMenuBar: true,
        useContentSize: true,
        center: true,
        frame: false,
        icon: path.join(__dirname, "logo.ico"),
        webPreferences: {
          spellcheck: false,
          webSecurity: false,
          nodeIntegration: true,
          allowRunningInsecureContent: true,
          contextIsolation: false,
          enableRemoteModule: true
        }
      });
      win.once("ready-to-show", () => {
        win.show();
        win.focus();
      });
      session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        if (details.url.includes("bilibili.com") || details.url.includes("bilivideo")) {
          details.requestHeaders["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
          details.requestHeaders.Referer = "https://www.bilibili.com";
        }
        callback({
          cancel: false,
          requestHeaders: details.requestHeaders
        });
      });
      if (process.env.WEBPACK_DEV_SERVER_URL) {
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
      } else {
        const loadProduction = async () => {
          try {
            createProtocol("app");
            await win.loadURL("app://./index.html");
          } catch (error) {
            console.error("Failed to load production mode:", error.toString());
          }
        };
        await loadProduction();
      }
      win.hookWindowMessage(278, function () {
        win.setEnabled(false);
        setTimeout(() => {
          win.setEnabled(true);
        }, 100);
        return true;
      });
    }();
    registerProtocolAndHandleArgs(process.argv);
    win.webContents.on("before-input-event", (event, input) => {
      let key = input.key.toUpperCase();
      if (input.control && key === "R") {
        event.preventDefault();
      }
      if (input.control && input.shift && key === "I") {
        event.preventDefault();
      }
      if (input.key === "F12") {
        event.preventDefault();
      }
    });
  });
} else {
  app.quit();
}
ipcMain.on("clearCookie", async () => session.defaultSession.clearStorageData({
  storages: ["cookies"]
}));
ipcMain.on("restart-aria2", () => startAria2(true));
ipcMain.on("shutdown", () => {
  exec("shutdown /s /t 0", error => win.webContents.send("shutdown-result", !error));
});
ipcMain.on("startUpdate", async (event, arg) => {

  autoUpdater.setFeedURL("https://zhouql.vip/bdupdate/win32");
  autoUpdater.checkForUpdates();
  autoUpdater.on("download-progress", progress => {
    win.webContents.send("updateDownProgress", progress.percent);
  });
  autoUpdater.on("update-downloaded", () => {
    win.webContents.send("updateDownSuccess");
  });
});
ipcMain.on("updateApp", async () => {
  const cacheDir = autoUpdater.downloadedUpdateHelper.cacheDir;
  const installerPath = path.join(cacheDir, "pending", autoUpdater.downloadedUpdateHelper.downloadedFileInfo.fileName);
  if (fs.existsSync(installerPath)) {
    const installer = spawn(installerPath, [], {
      detached: true,
      stdio: "ignore"
    });
    installer.on("error", () => installer.kill());
    installer.unref();
    setTimeout(() => app.quit(), 500);
  } else {
    dialog.showErrorBox("安装错误", "找不到安装程序");
  }
});
ipcMain.on("getAria2Port", () => aria2Port && win.webContents.send("Aria2Port", aria2Port));
ipcMain.on("check-tray-status", (event, enabled) => {
  if (enabled && !tray) {
    tray = new Tray(path.join(__dirname, "logo.ico"));
    const contextMenu = Menu.buildFromTemplate([{
      label: "关于",
      click: function () {
        shell.openExternal("https://zhouql.vip/bilidown/pc/");
      }
    }, {
      type: "separator"
    }, {
      label: "退出",
      click: function () {
        win.webContents.send("save-tasks");
      }
    }]);
    tray.setToolTip("Bilidown");
    tray.setContextMenu(contextMenu);
    tray.on("click", () => {
      if (win.isVisible()) {
        win.minimize();
        win.hide();
        win.setSkipTaskbar(true);
      } else {
        win.unmaximize();
        win.show();
        win.setSkipTaskbar(false);
      }
    });
    win.on("close", event => {
      event.preventDefault();
      win.setSkipTaskbar(true);
      win.hide();
    });
  } else {
    win.on("close", event => {
      event.preventDefault();
      win.webContents.send("save-tasks");
      win.hide();
    });
  }
});
ipcMain.on("listen-clipboard-status-change", (event, enabled) => {
  if (enabled) {
    (function (targetWindow, interval = 1000) {
      if (clipboardTimer) {
        clearTimeout(clipboardTimer);
      }
      lastClipboardText = readClipboardText();
      clipboardTimer = setInterval(() => {
        const text = readClipboardText();
        if (text !== lastClipboardText) {
          lastClipboardText = text;
          targetWindow.webContents.send("clipboard-change", text);
        }
      }, interval);
    })(win, 500);
  } else {
    clearInterval(clipboardTimer);
  }
});
ipcMain.on("tasks-saved", () => {
  win.destroy();
  app.quit();
});
ipcMain.on("listen-clipboard-focus", () => {
  win.setAlwaysOnTop(true);
  setTimeout(() => {
    win.setAlwaysOnTop(false);
  }, 10);
  win.show();
  win.focus();
});
app.on("second-instance", (event, argv, workingDirectory) => {
  if (win) {
    setTimeout(() => {
      if (win.isClosable()) {
        win.show();
        win.focus();
      }
    }, 320);
  }
});
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
