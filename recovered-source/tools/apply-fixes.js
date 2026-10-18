#!/usr/bin/env node
/**
 * apply-fixes.js — 一次性收尾：修掉还原工程遗留的「未声明标识符」与 webpack 残留引用。
 *
 * 背景：恢复阶段的生成器（gen-project.js）有两个结构性缺陷：
 *   A. 依赖闭包只遍历子节点，漏掉 `var nt = st;` 里 `st` 这种「裸标识符初始化」的引用；
 *   B. 顶层副作用语句（如 `st.interceptors.request.use(...)`）与
 *      `const { shell: kt } = window.require('electron')` 这类解构声明不被内联。
 * 结果：多个 .vue 里出现 st / kt / xt / St / te / qe / Oe / ... 这些「凭空引用」。
 *
 * 本脚本按 `../recovered/assets/js/app.*.js` 里原始 bundle 的位置，把它们补回去，
 * 并把残留的 `i(<webpackId>)` 替换成正常 import（音频资源 / qrcode）。
 *
 * 所有改动都带 `@restored:` 标记注释，可重复执行（幂等）。
 *
 * 用法：
 *   node tools/apply-fixes.js            # 应用
 *   node tools/apply-fixes.js --dry-run  # 只报告不写入
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DRY = process.argv.includes('--dry-run');

/* ------------------------------------------------------------------ *
 * 每个文件需要补回的「模块级声明」，顺序与原始 bundle 中的顺序一致
 * ------------------------------------------------------------------ */

const ELECTRON_REMOTE = 'const { remote: %s } = window.require("electron");';
const ELECTRON_IPC = 'const { ipcRenderer: %s } = window.require("electron");';
const CHILD_SPAWN = 'const { spawn: %s } = window.require("child_process");';
const CHILD_EXEC = 'const { exec: %s } = window.require("child_process");';

const AXIOS_INSTANCE = `
// 全局 axios 实例：baseURL 指向 bilibili，并带「离线即报错」的请求拦截器。
// 原 bundle 里它是模块级共享单例（所有组件都用同一个 nt），拦截器挂在实例上。
const st = axios.create({
  baseURL: "https://www.bilibili.com/"
});

st.interceptors.request.use(
  t => {
    if (!navigator.onLine) {
      throw new Error("网络连接失败");
    }
    return t;
  },
  t => Promise.resolve()
);
`;

/* ------------------------------------------------------------------ *
 * 共享 module 级绑定 → 独立插件模块
 *
 * 原 bundle 里 `st`（axios 实例）、`kt`（electron shell）是 module 级共享单例，
 * 每个组件都能直接用。生成器把它们分别内联进了各个 .vue，却没有把定义一起带过去，
 * 于是各文件都出现「凭空引用」。正确做法是抽成插件模块，各组件 import 同一份实例
 * —— 语义与 bundle 里共享单例完全一致。
 * ------------------------------------------------------------------ */

const REQUEST_PLUGIN = `/**
 * request.js — 全局 axios 实例（从 app.asar 还原）
 *
 * 原 bundle 里它是 module 级单例：所有组件共用同一个实例，
 * 且挂了一个「离线即抛错」的请求拦截器。这里按原样保留拦截器，
 * 并把实例导出给各组件使用。
 */
import axios from 'axios'

const request = axios.create({
  baseURL: "https://www.bilibili.com/"
});

// 原 bundle：st.interceptors.request.use(onFulfilled, onRejected)
request.interceptors.request.use(
  t => {
    if (!navigator.onLine) {
      throw new Error("网络连接失败");
    }
    return t;
  },
  t => Promise.resolve()
);

export default request;
`;

const ELECTRON_PLUGIN = `/**
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
`;

/**
 * 这些插件文件由本脚本生成（放在 src/plugins/ 下），内容带 @restored 标记。
 */
const GENERATED_PLUGINS = {
  'src/plugins/request.js': REQUEST_PLUGIN,
  'src/plugins/electron.js': ELECTRON_PLUGIN,
};

/** Dexie 表结构（原 bundle 里是 module 级 `let de = {...}`，App 与 Download 共用） */
/**
 * Dexie 实例的扩展方法。
 *
 * 原 bundle 里它是一条**顶层属性赋值表达式语句**：
 *   ue.checkIfTableHasData = async function (t) { ... }
 * 生成器只索引变量/函数/类声明，这类表达式语句被整条漏掉（与缺陷 B 同源），
 * 于是运行时抛 `he.checkIfTableHasData is not a function`。
 */
const CHECK_TABLE_FN = `ue.checkIfTableHasData = async function (t) {
  try {
    const e = await ue[t].count();
    return e > 0;
  } catch (e) {
    return false;
  }
};`;

const DEXIE_STORES = `const de = {
  downloaded: "++id,uid,upname,title,pic,bv,path,downDate,type,&vid",
  download: "++id,aModel,aSelect,aid,cid,asize,assFormatName,audioFullPath,bv,completedLength,coverFormatName,desc,downloadFolder,duration,fenpTitle,formatDuration,formatName,gid,guaxiaoFormatName,hejiTitle,index,isDownloading,paused,pic,progress,progressMB,pubdate,qn,speed,srtFormatName,status,taskStack,taskStackCache,tip,title,totalLength,type,upname,vModel,vSelect,vid,video,videoFormatName,videoFullPath,vmap,vsize,xmlFormatName,zimu"
};`;

/**
 * 每个 .vue 需要新增的 import（紧跟已有 import 之后）。
 *
 * 这里只列「bundle 里通过 webpack 模块引用、但生成器漏掉」的第三方包，
 * 例如：
 *   i(2586) → axios            i(3744) → Dexie
 *   i(4353) → moment           i(3941) → lunar-javascript 的 HolidayUtil
 *   i(9118) → qrcode
 */
const EXTRA_IMPORTS = {
  'src/App.vue': [
    "import Dexie from 'dexie'",
    "import { HolidayUtil } from 'lunar-javascript'",
    "import request from './plugins/request'",
    "import { shell } from './plugins/electron'",
  ],
  'src/views/Download.vue': [
    "import moment from 'moment'",
    "import request from '../plugins/request'",
    "import { shell } from '../plugins/electron'",
  ],
  'src/views/Account.vue': [
    "import request from '../plugins/request'",
  ],
  'src/views/Search.vue': [
    "import request from '../plugins/request'",
    "import { shell } from '../plugins/electron'",
  ],
  'src/views/Setting.vue': [
    "import request from '../plugins/request'",
    "import { shell } from '../plugins/electron'",
  ],
  'src/views/Tools.vue': [
    "import request from '../plugins/request'",
  ],
};

/** 每个 .vue 需要补回的模块级声明（在 import 之后、音频常量之前） */
const MODULE_DECLS = {
  'src/App.vue': [
    ELECTRON_REMOTE.replace('%s', 'xt'),
    CHILD_SPAWN.replace('%s', 'St'),
    DEXIE_STORES + '\nconst ue = new Dexie("downloadDatabase");\nue.version(1).stores(de);\nue.open();\n' + CHECK_TABLE_FN,
    ELECTRON_REMOTE.replace('%s', 'te') + '\nconst ee = te.require("fs");',
    ELECTRON_REMOTE.replace('%s', 'fe') + '\n' + ELECTRON_IPC.replace('%s', 'qe'),
    'const me = HolidayUtil;',
  ],
  'src/views/Download.vue': [
    ELECTRON_REMOTE.replace('%s', 'Ai'),
    ELECTRON_REMOTE.replace('%s', 'xt'),
    CHILD_SPAWN.replace('%s', 'St'),
    ELECTRON_REMOTE.replace('%s', 'te') + '\nconst ee = te.require("fs");',
    DEXIE_STORES + '\nconst ue = new Dexie("downloadDatabase");\nue.version(1).stores(de);\nue.open();\n' + CHECK_TABLE_FN + '\nvar he = ue;',
    'const qa = moment;',
    CHILD_EXEC.replace('%s', 'Fa'),
    ELECTRON_REMOTE.replace('%s', 'Ia') + '\nconst Na = Ia.require("fs").promises;\nconst Ya = Ia.require("path");',
    ELECTRON_IPC.replace('%s', 'Wa') + '\n' + ELECTRON_REMOTE.replace('%s', 'Ga') + '\nconst Ja = Ga.require("path");\nconst Oa = Ga.require("fs");',
    CHILD_SPAWN.replace('%s', 'Ha') + ' // eslint-disable-line no-unused-vars',
  ],
  'src/views/Setting.vue': [
    ELECTRON_REMOTE.replace('%s', 'Ai'),
    ELECTRON_IPC.replace('%s', 'St'),
    ELECTRON_REMOTE.replace('%s', 'xt'),
    ELECTRON_IPC.replace('%s', 'Di') + '\n' + ELECTRON_REMOTE.replace('%s', 'bi'),
  ],
  'src/views/Search.vue': [
    ELECTRON_IPC.replace('%s', 'Oe'),
  ],
  'src/views/Account.vue': [
    ELECTRON_IPC.replace('%s', 'Yi'),
    "// 时间戳格式化：原 bundle 里 module 级函数 Le，同一个函数在 Search.vue 中也有",
  ],
  'src/views/Tools.vue': [
    ELECTRON_REMOTE.replace('%s', 'te') + '\nconst ee = te.require("fs");',
    ELECTRON_REMOTE.replace('%s', 'Fa'),
    ELECTRON_REMOTE.replace('%s', 'es') + '\nconst is = es.require("fs");\nconst ss = es.require("path");',
    ELECTRON_IPC.replace('%s', 'as'),
  ],
};

/** 需要补进文件的 module 级函数源码（生成器漏掉的定义） */
const MODULE_FUNCS = {
  'src/views/Account.vue': [
    {
      name: 'Le',
      // 原 bundle 里 Le 与 Search.vue 中是同一个函数
      code: `function Le(t, e) {
  var i = new Date(t * 1000);
  var a = i.getFullYear();
  var s = ("0" + (i.getMonth() + 1)).slice(-2);
  var n = ("0" + i.getDate()).slice(-2);
  var o = ("0" + i.getHours()).slice(-2);
  var r = ("0" + i.getMinutes()).slice(-2);
  var A = ("0" + i.getSeconds()).slice(-2);
  if (e) {
    return a + "-" + s + "-" + n + " " + o + ":" + r + ":" + A;
  } else {
    return a + "-" + s + "-" + n;
  }
}`,
    },
  ],
  'src/views/Download.vue': [
    {
      name: 'vi / fi / pi / qi / Vi / yi / Mi / wi（重命名规则解析）',
      code: `// 变量名 → 中文说明（原 bundle module 级 const vi）
const vi = {
  upnn: "up主昵称",
  uid: "up主uid",
  "upnn-uid": "up主昵称-uid",
  "uid-upnn": "up主uid-昵称",
  "upnn%vtype": "up主昵称_视频类型",
  "upnn-uid%vtype": "up主昵称-uid_视频类型",
  "uid-upnn%vtype": "up主uid-昵称_视频类型",
  "upnn%vtype%vqn": "up主昵称_视频类型_视频画质",
  "upnn-uid%vtype%vqn": "up主昵称-uid_视频类型_视频画质",
  "upnn-uid%vtype%aqn": "up主昵称-uid_视频类型_音频音质",
  "upnn%vtype%aqn": "up主昵称_视频类型_音频音质",
  "uid-upnn%vtype%vqn": "up主uid-昵称_视频类型_视频画质",
  "uid-upnn%vtype%aqn": "up主uid-昵称_视频类型_音频音质",
  "dd:YYYY": "下载日期_年",
  "dd:YYYY%dd:MM": "下载日期_年_月",
  "dd:YYYY%upnn": "下载日期_年_up主昵称",
  "dd:YYYY%upnn%vtype": "下载日期_年_up主昵称_视频类型",
  dd: "下载日期",
  "dd%upnn": "下载日期_up主昵称",
  pd: "发布日期",
  bv: "bv号",
  title: "视频标题",
  cid: "cid",
  index: "序号",
  "index:0": "序号(不补零)",
  "index:00": "序号(补两位)",
  "index:01": "序号(补两位)",
  aqn: "音频音质",
  vqn: "视频画质",
  vtype: "视频类型",
  v: "软件版本号"
};

const fi = ["%upnn%", "%upnn-uid%", "%uid-upnn%", "%upnn%%vtype%", "%upnn-uid%%vtype%", "%uid%%vtype%", "%uid-upnn%%vtype%", "%upnn%%vtype%%vqn%", "%upnn-uid%%vtype%%vqn%", "%upnn-uid%%vtype%%aqn%", "%upnn%%vtype%%aqn%", "%uid-upnn%%vtype%%vqn%", "%uid-upnn%%vtype%%aqn%", "%dd:YYYY%", "%dd:YYYY%%dd:MM%", "%dd:YYYY%%upnn%", "%dd:YYYY%%upnn%%vtype%", "%dd%", "%dd%%upnn%", "%pd%"];

let qi = -1;

function Vi() {
  const t = Math.floor(Math.random() * fi.length);
  if (t === qi) {
    return Vi();
  } else {
    qi = t;
    return fi[t];
  }
}

function yi(t) {
  return t.replace(/[\\/:*?"<>|]/g, "");
}

function Mi(t) {
  const e = new Set();
  const i = [];
  t.forEach(t => {
    const a = JSON.stringify(t);
    if (t.type === "var") {
      if (!e.has(a)) {
        e.add(a);
        i.push(t);
      }
    } else {
      i.push(t);
    }
  });
  return i;
}

function wi(t) {
  let e = [];
  let i = false;
  let a = "";
  let s = 0;
  while (s < t.length) {
    const n = t[s];
    if (n === "%") {
      if (i) {
        if (vi.hasOwnProperty(a)) {
          if (a === "vtype") {
            vi.vtype = Math.random() < 0.5 ? "单视频" : Math.random() < 0.5 ? "合集视频" : "多集视频";
          }
          e.push({ type: "var", value: a });
        }
        i = false;
        a = "";
      } else {
        i = true;
      }
    } else if (i) {
      if (n === "%") {
        if (vi.hasOwnProperty(a)) {
          e.push({ type: "var", value: a });
        }
        i = false;
        a = "";
      } else {
        a += n;
      }
    } else if (s === 0 || t[s - 1] === "%") {
      e.push({ type: "text", value: yi(n) });
    } else {
      e[e.length - 1].value += yi(n);
    }
    s++;
  }
  if (a) {
    e.push({ type: "text", value: yi(a) });
  }
  if (i && i === true && a === "" && e.length === 0) {
    e = [];
  }
  let n = e.filter(t => t.value !== "");
  n = Mi(n);
  const o = localStorage.getItem("createFolder");
  const r = localStorage.getItem("createFolderAddIndex");
  const A = o && JSON.parse(o) === true;
  const l = r && JSON.parse(r) === true;
  let c;
  let d = "";
  let u = d;
  let h = d;
  let p = d;
  let m = d;
  let g = d;
  let v = d;
  let w = "";
  n.forEach(t => {
    if (t.type === "var") {
      w += \`%\${t.value}%\`;
      if (t.value === "vtype") {
        u += '<span style="color: var(--theme)">单视频</span>';
        h += '<span style="color: var(--theme)">合集视频</span>';
        p += '<span style="color: var(--theme)">多集视频</span>';
        m += '<span style="color: var(--theme)">单视频</span>';
        g += '<span style="color: var(--theme)">合集视频</span>';
        v += '<span style="color: var(--theme)">多集视频</span>';
      } else {
        u += \`<span style="color: var(--theme)">\${vi[t.value]}</span>\`;
        h += \`<span style="color: var(--theme)">\${vi[t.value]}</span>\`;
        p += \`<span style="color: var(--theme)">\${vi[t.value]}</span>\`;
        m += \`<span style="color: var(--theme)">\${vi[t.value]}</span>\`;
        g += \`<span style="color: var(--theme)">\${vi[t.value]}</span>\`;
        v += \`<span style="color: var(--theme)">\${vi[t.value]}</span>\`;
      }
    }
  });
  h += '<span style="color: var(--theme-6)">合集标题</span>';
  p += '<span style="color: var(--theme-6)">分集标题</span>';
  if (A && l) {
    m += '<span style="color: var(--theme-6)">01视频标题</span>';
    g += '<span style="color: var(--theme-6)">01视频标题</span>';
    v += '<span style="color: var(--theme-6)">01视频标题</span>';
  } else if (A) {
    m += '<span style="color: var(--theme-6)">视频标题</span>';
    g += '<span style="color: var(--theme-6)">视频标题</span>';
    v += '<span style="color: var(--theme-6)">视频标题</span>';
  }
  g += '<span style="color: var(--theme-6)">合集标题</span>';
  v += '<span style="color: var(--theme-6)">分集标题</span>';
  c = t.substring(0, 2) === "%%"
    ? '<span style="color: #f56c6c">开头如果需要变量，使用%%可能会导致问题！建议使用单个%开始。</span>'
    : t.includes("%") && n.filter(t => t.type === "var").length === 0
      ? '<span style="color: #f56c6c">无效变量，请使用%内置变量名%来表示变量。</span'
      : w.length !== t.length
        ? \`<span style="color: #e6a23c">建议优化为：\${w}</span>\`
        : \`<a onclick="openExternalLink('https://zhouql.vip/bilidown/doc/bilidown-pc-dynamic-folder.html')">暂无建议，详细使用文档点我查看。</a>\`;
  return {
    addCreateFolder: A,
    resultArr: n,
    resultText: w,
    suggestText: c,
    singlePreviewText: u,
    single2TasksPreviewText: m,
    hejiPreviewText: h,
    heji2TasksPreviewText: g,
    fenjiPreviewText: p,
    fenji2TasksPreviewText: v
  };
}`,
    },
    {
      name: 'Gt / Ma / Da / ba / Ca（生成器漏掉的 module 级定义）',
      code: `// 文件名长度裁剪 + 非法字符清理（原 bundle module 级函数 Gt）
function Gt(t) {
  if (!t) return "bilidown文件夹重命名" + Ut();
  t = String(t);
  t = t.trim();
  t = t.replace(/[\/\\\\|\:*?"<>]+/g, "");
  let e = t.replace(/\\.*$/g, "");
  e = e.trim();
  const i = 205;
  const a = new TextEncoder().encode(e);
  if (a.length > i) {
    const t = a.slice(0, i - 1);
    e = new TextDecoder().decode(t).trim();
  }
  if (!e) {
    e = "bilidown文件夹重命名" + Ut();
  }
  return e;
}

const ka = () => localStorage.getItem("folderRenameRule");

const Sa = () => localStorage.getItem("folderRenameRule") && localStorage.getItem("folderRenameRule").length > 0;

class Ma {
  constructor(t, e, i) {
    this.video = t;
    this.index = t.index < 10 ? String(t.index).padStart(2, "0") : t.index;
    this.downDirectory = e;
    this.downContentType = i;
    this.contentLength = i.length;
    this.currentTime = Jt();
    this.hejiTitle = Gt(t["hejiTitle"]);
    if (!this.hejiTitle) {
      this.hejiTitle = \`bilidown系统重命名_合集_\${Ut()}\`;
    }
    this.fenpTitle = Gt(t["fenpTitle"]);
    if (!this.fenpTitle) {
      this.fenpTitle = \`bilidown系统重命名_分集_\${Ut()}\`;
    }
    this.title = Gt(\`\${t["title"]}\`);
    if (!this.title) {
      this.title = \`bilidown系统重命名_\${Ut()}\`;
    }
  }
  parseRule() {
    let t = this.downDirectory;
    const { resultArr: e } = wi(ka());
    if (e.length > 0) {
      e.forEach(e => {
        const i = e.value;
        if (e.type !== "var") return;
        switch (i) {
          case "upnn": {
            const e = Gt(this.video["upname"]);
            if (e) t = Ya.join(t, e);
            break;
          }
          case "uid": {
            const e = Gt(this.video["uid"]);
            if (e) t = Ya.join(t, e);
            break;
          }
          case "upnn-uid": {
            const e = Gt(\`\${this.video["upname"]}-\${this.video["uid"]}\`);
            if (e) t = Ya.join(t, e);
            break;
          }
          default:
            break;
        }
      });
    }
    return t;
  }
  generateFolderName() {}
}

class Da extends Ma {
  generateFolderName() {
    const t = Sa() ? this.parseRule() : this.downDirectory;
    const e = localStorage.getItem("createFolder");
    const i = localStorage.getItem("createFolderAddIndex");
    if (this.contentLength >= 2 && e && JSON.parse(e) === true) {
      return i && JSON.parse(i) === true
        ? Ya.join(t, this.hejiTitle, \`\${this.index}\${this.title}\`)
        : Ya.join(t, this.hejiTitle, this.title);
    }
    return Ya.join(t, this.hejiTitle);
  }
}

class ba extends Ma {
  generateFolderName() {
    const t = Sa() ? this.parseRule() : this.downDirectory;
    const e = localStorage.getItem("createFolder");
    const i = localStorage.getItem("createFolderAddIndex");
    if (this.contentLength >= 2 && e && JSON.parse(e) === true) {
      return i && JSON.parse(i) === true
        ? Ya.join(t, this.fenpTitle, \`\${this.index}\${this.title}\`)
        : Ya.join(t, this.fenpTitle, this.title);
    }
    return Ya.join(t, this.fenpTitle);
  }
}

class Ca extends Ma {
  generateFolderName() {
    const t = Sa() ? this.parseRule() : this.downDirectory;
    const e = localStorage.getItem("createFolder");
    const i = localStorage.getItem("createFolderAddIndex");
    if (this.contentLength >= 2 && e && JSON.parse(e) === true) {
      return i && JSON.parse(i) === true
        ? Ya.join(t, \`\${this.index}\${this.title}\`)
        : Ya.join(t, this.title);
    }
    return t;
  }
}

const xa = {
  "合集视频": Da,
  "分集视频": ba,
  "单视频": Ca
};
var Ba = xa;`,
    },
  ],
  'src/views/Setting.vue': [
    {
      name: 'yi / Mi（生成器漏掉的两个 module 级函数）',
      code: `function yi(t) {
  return t.replace(/[\\/:*?"<>|]/g, "");
}

function Mi(t) {
  const e = new Set();
  const i = [];
  t.forEach(t => {
    const a = JSON.stringify(t);
    if (t.type === "var") {
      if (!e.has(a)) {
        e.add(a);
        i.push(t);
      }
    } else {
      i.push(t);
    }
  });
  return i;
}`,
    },
  ],
};

/**
 * 需要删除的无用 import：原 bundle 里这些标识符由 webpack 共享，
 * 生成器把它们当成依赖复制进了各组件，但组件其实没用到（组件内用的是别的等价引用）。
 * 留着会被 ESLint 报 no-unused-vars，也会误导读者。
 */
const DEAD_IMPORTS = {
  'src/App.vue': [
    "import clipboard from 'clipboard-polyfill'",
    "import Download from './views/Download.vue'",
  ],
  'src/views/Setting.vue': [
    "import clipboard from 'clipboard-polyfill'",
  ],
  'src/views/Tools.vue': [
    "import moment from 'moment'",
  ],
};

/**
 * 需要在 import 之后补一行代码的地方（幂等：已存在则跳过）
 * store/index.js：Vuex 3 的 `new Vuex.Store()` 需要先 `Vue.use(Vuex)`。
 */
const EXTRA_CODE = {
  'src/store/index.js': ['Vue.use(Vuex)'],
};

/**
 * 模板层面的通用修复（与具体文件无关）。
 *
 * 反编译器在遇到 render 里的 `a && b ? X : _e()` 时，会把 `&&` 的左右操作数
 * 分别输出成一个 v-if 属性，得到 `v-if="a" v-if="b"` ——
 * vue-template-compiler 会直接报 `duplicate attribute: v-if`。
 * 例：Setting.vue 的
 *   <div v-if="user.state" v-if="!(user.vip)" slot="content">
 * 原始 render 是：
 *   t.user.state && !t.user.vip ? e("div", {...}) : t._e()
 */
const TEMPLATE_FIXES = [
  { find: /v-if="([^"]+)"(\s+)v-if="([^"]+)"/g, replace: 'v-if="$1 && $3"' },
  {
    // 反编译把 render 里的
    //   on: { "update:visible": function (e) { this.x = e } }
    // 展开成了模板属性 @update:visible="x = e"，
    // 但模板作用域里没有 e（事件对象在模板里是 $event）。
    // 不修的话，对话框关闭等动作会在触发事件时报错。
    find: /(@update:[a-zA-Z-]+=")([A-Za-z_$][\w$.]*)\s*=\s*e\b/g,
    replace: '$1$2 = $event',
  },
];

/** 生成器留下的死代码（`nt` 已被 request 取代） */
const DEAD_CODE = [
  /^var nt = st;\n\n?/gm,
];

/** 单个标识符替换（旧 → 新），用于修生成器的其它笔误 */
const NT_TO_REQUEST = { find: /(?<![\w$.])nt(?=\s*\.)/g, replace: 'request' };
// 原始产物里的 `no.956e656b.mp3` 是 webpack 的 [name].[contenthash:8][ext]，
// 源文件名应为 no.mp3（构建后会重新得到同样的 hash）。
const AUDIO_NAME = { find: /no\.956e656b\.mp3/g, replace: 'no.mp3' };
const KT_TO_SHELL = { find: /(?<![\w$.])kt(?=\s*\.)/g, replace: 'shell' };

const IDENT_FIXES = {
  'src/App.vue': [AUDIO_NAME, NT_TO_REQUEST, KT_TO_SHELL],
  'src/components/BButton.vue': [{
    // 原 bundle 在 normalizeComponent 之后给组件挂了 install：
    //   fs.install = t => t.component(fs.name, fs)
    // main.js 用 Vue.use(BButton) 全局注册，缺了它模板里的 <b-xxx> 会被当成
    // 未知自定义元素（渲染不出来，控制台报 Unknown custom element）。
    find: /^export default \{\n(  name: "BButton",)/m,
    replace: 'export default {\n  install(Vue) {\n    Vue.component(this.name, this);\n  },\n$1',
  }],
  'src/components/BEmpty.vue': [{
    // 原 bundle 在 normalizeComponent 之后给组件挂了 install：
    //   fs.install = t => t.component(fs.name, fs)
    // main.js 用 Vue.use(BEmpty) 全局注册，缺了它模板里的 <b-xxx> 会被当成
    // 未知自定义元素（渲染不出来，控制台报 Unknown custom element）。
    find: /^export default \{\n(  name: "BEmpty",)/m,
    replace: 'export default {\n  install(Vue) {\n    Vue.component(this.name, this);\n  },\n$1',
  }],
  'src/components/BProgress.vue': [{
    // 原 bundle 在 normalizeComponent 之后给组件挂了 install：
    //   fs.install = t => t.component(fs.name, fs)
    // main.js 用 Vue.use(BProgress) 全局注册，缺了它模板里的 <b-xxx> 会被当成
    // 未知自定义元素（渲染不出来，控制台报 Unknown custom element）。
    find: /^export default \{\n(  name: "BProgress",)/m,
    replace: 'export default {\n  install(Vue) {\n    Vue.component(this.name, this);\n  },\n$1',
  }],
  'src/components/BPlayer.vue': [{
    // 原 bundle 在 normalizeComponent 之后给组件挂了 install：
    //   fs.install = t => t.component(fs.name, fs)
    // main.js 用 Vue.use(BButton) 等全局注册，缺了它模板里的 <b-button> 会被
    // 当成未知自定义元素（渲染不出来，控制台报 Unknown custom element）。
    find: /^export default \{\n(  name: "BPlayer",)/m,
    replace: 'export default {\n  install(Vue) {\n    Vue.component(this.name, this);\n  },\n$1',
  }, {
    // 原 bundle 写的是 `new (i.n(module)())`：i.n() 是 webpack 的「取默认导出」getter，
    // 调用它才拿到真正的类。生成器把 getter 调用直译成了 `Plyr()`，
    // 但 `import Plyr from 'plyr'` 之后 Plyr 已经是类本身，不能再调用。
    find: /new \(Plyr\(\)\)/g,
    replace: 'new Plyr',
  }],
  'src/views/Download.vue': [AUDIO_NAME, NT_TO_REQUEST, KT_TO_SHELL, {
    // 恢复的任务缺 audio/video/amap/vmap 字段（Dexie schema 里没有它们，
    // 只有 audioFullPath/videoFullPath/vmap），而 downAllTask 在获取下载链接
    // 之前就会访问 t.audio.length，于是抛 Cannot read property 'length' of undefined，
    // 点了「下载视频」毫无反应。原版在「搜索页添加→立刻下载」的路径下 audio 是 []
    // 所以不暴露，只有从数据库恢复的任务会踩到。
    find: [
      '      ]);',
      '      await Pt(600);',
      '      this.$store.commit("updateWaitDown", t);',
    ].join('\n'),
    replace: [
      '      ]);',
      '      // 补全恢复任务里可能缺失的字段，避免下载时读取 undefined.length',
      '      t.forEach((item) => {',
      '        if (!item.audio) item.audio = [];',
      '        if (!item.video) item.video = [];',
      '        if (!item.amap) item.amap = [];',
      '        if (!item.vmap) item.vmap = [];',
      '        if (!item.taskStack) item.taskStack = [];',
      '        if (!item.taskStackCache) item.taskStackCache = [];',
      '      });',
      '      await Pt(600);',
      '      this.$store.commit("updateWaitDown", t);',
    ].join('\n'),
  }, {
    // downAllTask / addDownTask 里的 t.audio.length 加防御（双保险）。
    // 用正则全局替换：IDENT_FIXES 用的是 String.replace，
    // 字符串 find 只会替换第一处。
    find: /if \(t\.audio\.length\)/g,
    replace: 'if (t.audio && t.audio.length)',
    all: true,
  }, {
    find: /if \(!t\.audio\.length &&/g,
    replace: 'if (!(t.audio && t.audio.length) &&',
    all: true,
  }, {
    find: /else if \(t\.audio\.length &&/g,
    replace: 'else if (t.audio && t.audio.length &&',
    all: true,
  }, {
    find: /if \(t\.video\.length\)/g,
    replace: 'if (t.video && t.video.length)',
    all: true,
  }, {
    // el-option 的 value/key 丢了 v-for 别名前缀。
    // 原始 render: t._l(i.amap, function(t){ return e("el-option",
    //   {key: t.qnDesc, attrs: {value: t.qnDesc}}) })
    // 模板却写成 :value="qnDesc"（缺少 t.），qnDesc 未定义 → el-select 渲染报错，
    // 清晰度/音质下拉列表因此显示不出来。
    find: '<el-option v-for="t in i.amap" :value="qnDesc" :key="qnDesc" />',
    replace: '<el-option v-for="t in i.amap" :value="t.qnDesc" :key="t.qnDesc" />',
  }, {
    find: '<el-option v-for="t in i.vmap" :value="qnDesc" :key="qnDesc" />',
    replace: '<el-option v-for="t in i.vmap" :value="t.qnDesc" :key="t.qnDesc" />',
  }, {
    // 模板变量误用：原始 render 里 el-select 的 v-model 是
    //   model: { value: i.aModel, callback: e => t.$set(i, "aModel", e),
    //            expression: "v.aModel" }
    // 注意 value/callback 都绑定 i，只有 expression（给 devtools 看的元数据）
    // 写成了 "v.aModel"——原作者遗留的不一致。
    // 反编译器照着 expression 生成了 v-model="v.aModel"，而模板里根本没有 v
    // 这个变量，渲染时抛 Cannot read property 'aModel' of undefined，
    // 整条 v-for 中断，列表就空了（空状态 b-empty 在抛错前已创建，仍显示）。
    find: 'v-model="v.aModel"',
    replace: 'v-model="i.aModel"',
  }, {
    find: 'v-model="v.vModel"',
    replace: 'v-model="i.vModel"',
  }, {
    // echoDownload 的健壮性修复。
    //
    // 原实现把 loading 复位放在 .finally 里，看似安全；但若 IndexedDB 异常
    // （例如 user-data-dir 被不同 Chromium 版本写坏，会报
    //  "Cookie database is too new" / "Got corruption"），
    // he.download.toArray() 的 Promise 可能永不 settle —— .finally 也就永不执行，
    // 界面会永远停在「正在恢复待下载数据…」。
    // 这里加 5 秒超时与错误兜底，保证 loading 一定复位。
    find: [
      '    async echoDownload() {',
      '      he.download.toArray().then(async t => {',
      '        await Pt(600);',
      '        this.$store.commit("updateWaitDown", t);',
      '        this.download = t;',
      '        await Pt(1000);',
      '      }).finally(() => {',
      '        this.loading = false;',
      '      });',
      '    },',
    ].join('\n'),
    replace: [
      '    async echoDownload() {',
      '      // 见 tools/apply-fixes.js 的说明：本地数据库异常时 toArray() 可能永不 settle，',
      '      // 必须用超时兜底，否则界面会一直停在「正在恢复待下载数据…」。',
      '      try {',
      '        const t = await Promise.race([',
      '          he.download.toArray(),',
      '          new Promise((resolve, reject) => {',
      '            setTimeout(() => reject(new Error("读取本地任务超时")), 5000);',
      '          })',
      '        ]);',
      '        await Pt(600);',
      '        this.$store.commit("updateWaitDown", t);',
      '        this.download = t;',
      '        await Pt(1000);',
      '      } catch (e) {',
      '        console.warn("[echoDownload] 恢复待下载数据失败：", e && e.message);',
      '        this.download = [];',
      '      } finally {',
      '        this.loading = false;',
      '      }',
      '    },',
    ].join('\n'),
  }, {
    // generator 在 `const xa` 定义之前就生成了一句 `var Ba = xa;`。
    // xa 是 const，模块顶层这句是立即执行的，会踩 TDZ：
    //   ReferenceError: Cannot access 'xa' before initialization
    // restored funcs 里已在 xa 定义之后重新赋值，所以删掉这句提前的。
    find: /\nvar Ba = xa;\n\nconst La = new Dexie/,
    replace: '\n\nconst La = new Dexie',
  }, {
    // 同上：`new (Aria2())` → `new Aria2(`
    find: /new \(Aria2\(\)\)/g,
    replace: 'new Aria2',
  }, {
    // 生成器把模块级 `const ee = te.require("fs")` 内联了两遍，去重
    find: /\nconst ee = te\.require\("fs"\);\n+(?=const ae = new Map\(\[\["127")/g,
    replace: '\n',
  }, {
    find: /\nconst Na = Ia\.require\("fs"\)\.promises;\n+/g,
    replace: '\n',
  }, {
    find: /\nconst Ya = Ia\.require\("path"\);\n+/g,
    replace: '\n',
  }, {
    find: /\nconst Ja = Ga\.require\("path"\);\n+/g,
    replace: '\n',
  }, {
    find: /\nconst Oa = Ga\.require\("fs"\);\n+/g,
    replace: '\n',
  }, {
    find: /\nvar he = ue;\n+/g,
    replace: '\n',
  }],
  'src/views/Search.vue': [AUDIO_NAME, NT_TO_REQUEST, KT_TO_SHELL],
  'src/views/Setting.vue': [AUDIO_NAME, NT_TO_REQUEST, KT_TO_SHELL, {
    // 反编译器把 `nativeOn:{click:...}` 的 .native 修饰符追加到了引号外面，
    // 生成 `@click="trayTip".native` —— 浏览器报
    //   InvalidCharacterError: '.native' is not a valid attribute name
    // 同时 `attrs:{label:!1}` / `{label:!0}` 的布尔值也丢了（只剩裸 label）。
    // 依据原始 render：
    //   e("el-radio",{attrs:{label:!1},nativeOn:{click:...}},[t._v("退出程序")])
    //   e("el-radio",{attrs:{label:!0},nativeOn:{click:...}},[t._v("最小化到托盘")])
    find: [
      '        <el-radio @click="trayTip".native>',
      '          退出程序',
      '        </el-radio>',
      '        <el-radio label @click="trayTip".native>',
      '          最小化到托盘',
      '        </el-radio>',
    ].join('\n'),
    replace: [
      '        <el-radio :label="false" @click.native="trayTip">',
      '          退出程序',
      '        </el-radio>',
      '        <el-radio :label="true" @click.native="trayTip">',
      '          最小化到托盘',
      '        </el-radio>',
    ].join('\n'),
  }, {
    // 原 bundle 里就是 `return randomRule()`（递归调用自身生成器），
    // 但 randomRule 这个标识符从来不存在 —— 按语义修成调用生成器自身
    find: /\brandomRule\(\)/g,
    replace: 'Vi()',
  }],
  'src/views/Tools.vue': [AUDIO_NAME, NT_TO_REQUEST, {
    // 生成器把 `const ee = te.require("fs")` / `is` / `ss` 各内联了两遍，去重
    find: /\nconst ee = te\.require\("fs"\);\n+(?=const ae = new Map\(\[\["127")/g,
    replace: '\n',
  }, {
    find: /\nconst is = es\.require\("fs"\);\n+/g,
    replace: '\n',
  }, {
    find: /\nconst ss = es\.require\("path"\);\n+/g,
    replace: '\n',
  }],
  'src/views/Account.vue': [AUDIO_NAME, NT_TO_REQUEST, {
    // 生成器把时间戳格式化函数 Le 改名成了 formatTimestamp，但没把函数体带过来；
    // 原 bundle 里它和 Search.vue 里的是同一个函数。
    find: /\bformatTimestamp\(/g,
    replace: 'Le(',
  }],
};

/* ------------------------------------------------------------------ *
 * webpack 残留资源
 * ------------------------------------------------------------------ */

/** 内联在 bundle 里的音频 data URI（webpack assetsInlineLimit 的产物） */
const AUDIO_IDS = [2479, 5507, 2311, 9122, 7512];
const AUDIO_NAMES = {
  2479: 'yes',
  5507: 'saoma',
  2311: 'success',
  9122: 'click',
  7512: 'hover',
};

function extractAudioFromBundle() {
  const jsDir = path.resolve(ROOT, '..', 'recovered', 'assets', 'js');
  const bundle = fs.readdirSync(jsDir).find(f => /^app\..*\.js$/.test(f));
  const src = fs.readFileSync(path.join(jsDir, bundle), 'utf8');
  const found = new Map();
  // bundle 里的写法是 `},<id>:function(t){"use strict";t.exports="data:audio/mpeg;base64,..."`
  // 所以 id 在 URI **前面**的模块头里，别找后面的 `i(<id>)`（那是调用点）。
  const re = /"data:audio\/[a-z0-9+.-]+;base64,[A-Za-z0-9+/=]+"/g;
  let m;
  while ((m = re.exec(src))) {
    const before = src.slice(Math.max(0, m.index - 80), m.index);
    const idm = /(\d{2,6}):function\([^)]*\)\{"use strict";t\.exports=$/.exec(before);
    if (!idm) continue;
    const id = Number(idm[1]);
    if (AUDIO_IDS.includes(id)) found.set(id, m[0].slice(1, -1));
  }
  return found;
}

function stripDataUri(uri) {
  return Buffer.from(uri.slice(uri.indexOf(',') + 1), 'base64');
}

/** 需要 import 的音频模块：id → { ident, file } */
const AUDIO_IMPORT = {
  2779: { ident: 'tipAudioNo', file: "import tipAudioNo from '@/assets/media/no.mp3'" },
  2479: { ident: 'tipAudioYes', file: "import tipAudioYes from '@/assets/media/tip-yes.mp3'" },
  5507: { ident: 'tipAudioSaoma', file: "import tipAudioSaoma from '@/assets/media/tip-saoma.mp3'" },
  2311: { ident: 'tipAudioSuccess', file: "import tipAudioSuccess from '@/assets/media/tip-success.mp3'" },
  9122: { ident: 'tipAudioClick', file: "import tipAudioClick from '@/assets/media/tip-click.mp3'" },
  7512: { ident: 'tipAudioHover', file: "import tipAudioHover from '@/assets/media/tip-hover.mp3'" },
};

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'assets', 'dist', 'dist_electron', '.git'].includes(e.name)) continue;
      walk(p, out);
    } else if (/\.(vue|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

const report = [];
const changes = [];

/* 1) 导出音频资源 + 建立 id → 标识符映射 */
function materializeAudio() {
  const audio = extractAudioFromBundle();
  const mediaDir = path.join(SRC, 'assets', 'media');
  fs.mkdirSync(mediaDir, { recursive: true });
  for (const [id, uri] of audio) {
    const name = `tip-${AUDIO_NAMES[id]}.mp3`;
    const buf = stripDataUri(uri);
    if (!DRY) fs.writeFileSync(path.join(mediaDir, name), buf);
    report.push(`音频资源: src/assets/media/${name}  (${buf.length} 字节)`);
  }
  return audio;
}

/* 2) 重写每个源文件 */

/**
 * 一次性摘掉本脚本上一轮插入的所有 `@restored:*` 块，并把上一轮做过的替换
 * 反向还原。这样整个重写流程永远作用在「原始生成器产物」上，重复执行结果
 * 完全一致（幂等）。
 *
 * 注意：反向还原必须**按文件**做，因为像 `Le(`→`formatTimestamp(`、
 * `i(9118)`→`QRCode` 这类改写在别的文件里是合法的原始代码，不能全局反弹。
 */
function stripRestoredBlocks(text, rel) {
  let out = text
    .replace(/\n?\/\/ @restored:imports\n[\s\S]*?\/\/ @restored:imports-end/g, '')
    .replace(/\n?\/\/ @restored:module-decls\n[\s\S]*?\/\/ @restored:module-decls-end/g, '')
    .replace(/\n?\/\/ @restored:funcs\n[\s\S]*?\/\/ @restored:funcs-end/g, '');
  // 音频 import → 还原成 webpack 占位调用，交给下面的 2a 重新替换
  for (const info of Object.values(AUDIO_IMPORT)) {
    out = out.replace(new RegExp(`^import ${info.ident} from '[^']*'\\n?`, 'gm'), '');
  }
  out = out.replace(/^import QRCode from 'qrcode'\n?/gm, '');
  const identToId = new Map(Object.entries(AUDIO_IMPORT).map(([id, i]) => [i.ident, id]));
  out = out.replace(/(?<![\w$.])(tipAudioNo|tipAudioYes|tipAudioSaoma|tipAudioSuccess|tipAudioClick|tipAudioHover)(?![\w$])/g,
    m => `i(${identToId.get(m)})`);

  // 插件 import 与用法还原
  out = out.replace(/^import request from '[^']*plugins\/request'\n?/gm, '');
  out = out.replace(/^import \{ shell \} from '[^']*plugins\/electron'\n?/gm, '');
  out = out.replace(/(?<![\w$.])request(?=\s*\.)/g, 'nt');
  out = out.replace(/(?<![\w$.])shell(?=\s*\.)/g, 'kt');


  // 各文件的专属反向还原
  if (rel === 'src/views/Account.vue') {
    out = out.replace(/(?<![\w$.])Le\(/g, 'formatTimestamp(');
    out = out.replace(/\bconst e = QRCode;/g, 'const e = i(9118);');
  }
  if (rel === 'src/views/Setting.vue') {
    out = out.replace(/\bVi\(\)/g, 'randomRule()');
  }
  return out;
}

/**
 * 通用「模块级重复声明」去重。
 *
 * 生成器会把同一个 module 级定义反复内联进同一个文件（例如 `const ee =`、
 * `var he = ue;`、`class Ma`），造成 `Duplicate declaration` 语法错误。
 * 这里以「首次出现的顶层声明名」为键，把后续重复的整段声明注释掉。
 *
 * 只处理**顶层**（行首无缩进）的 const/let/var/class/function，不会误伤函数内部。
 * 被注释掉的行带 `@restored:removed-duplicate` 前缀，重复运行时可原样还原，
 * 因此整个脚本依然幂等。
 */
const dedupeSeen = new Map();

function dedupeTopLevelDeclarations(text, rel, report) {
  const lines = text.split('\n');
  const out = [];
  let removed = 0;

  // 注意：**不**去重 `var`。`var` 重复声明本来就合法，而且原 bundle 自己就有
  // 这种形态（例如 Download.vue 里 `var Ba = xa;` 先出现一次、`xa` 定义之后
  // 再赋值一次）。删掉反而会破坏运行语义。
  const declRe = [
    /^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=/,
    /^class\s+([A-Za-z_$][\w$]*)\b/,
    /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let name = null;
    let isFn = false;
    for (const re of declRe) {
      const m = re.exec(line);
      if (m) { name = m[1]; isFn = /^\s*(?:async\s+)?function\b/.test(line); break; }
    }
    if (!name) { out.push(line); continue; }

    const key = `${rel}|${isFn ? 'fn' : 'var'}|${name}`;
    if (dedupeSeen.has(key)) {
      if (isFn) {
        // 跳过整个函数体（按大括号配平）
        let depth = 0;
        let j = i;
        for (; j < lines.length; j++) {
          for (const ch of lines[j]) {
            if (ch === '{') depth++;
            else if (ch === '}') depth--;
          }
          if (depth <= 0 && j > i) break;
        }
        out.push(`// @restored:removed-duplicate ${line.trim()}`);
        i = j;
      } else {
        out.push(`// @restored:removed-duplicate ${line.trim()}`);
      }
      removed++;
      continue;
    }
    dedupeSeen.set(key, i + 1);
    out.push(line);
  }
  if (removed) report.push(`去重: ${rel} 删除 ${removed} 处重复的顶层声明`);
  return { text: out.join('\n'), removed };
}

/** 写出插件模块（src/plugins/request.js、src/plugins/electron.js） */
function writeGeneratedPlugins() {
  for (const [rel, content] of Object.entries(GENERATED_PLUGINS)) {
    const file = path.join(ROOT, rel);
    const existed = fs.existsSync(file);
    const prev = existed ? fs.readFileSync(file, 'utf8') : null;
    if (prev === content) continue;
    if (!DRY) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
    }
    changes.push(rel);
    report.push(`${existed ? '更新' : '生成'}插件模块: ${rel}`);
  }
}

/** 把 `// @restored:removed-duplicate ...` 注释行还原成原始声明，保证幂等 */
function restoreRemovedDuplicates(text) {
  return text.replace(/^\/\/ @restored:removed-duplicate (.*)$/gm, '$1');
}

/**
 * 摘掉上一次运行留下的、紧贴在画质表前的重复 `const ee = te.require("fs");`。
 * （通用去重已经覆盖，这里保留是为了让旧产物也能被正确清理。）
 */
function stripDuplicateEe(text) {
  return text.replace(/\nconst ee = te\.require\("fs"\);(\n+const ae = new Map\(\[\["127")/g, '$1');
}

function rewriteFiles() {
  for (const file of walk(SRC)) {
    if (file.endsWith('background.js')) continue;
    const rel = path.relative(ROOT, file);
    const raw = fs.readFileSync(file, 'utf8');
    let text = /@restored:/.test(raw) ? stripRestoredBlocks(raw, rel) : raw;
    text = stripDuplicateEe(text);
    text = restoreRemovedDuplicates(text);
    if (text !== raw && !DRY) fs.writeFileSync(file, text);
    const before = text;

    // 2a. 残留 i(<audioId>) → 音频 import 标识符
    const neededAudioImports = new Set();
    for (const [id, info] of Object.entries(AUDIO_IMPORT)) {
      const re = new RegExp(`(?<![\\w$.])i\\(${id}\\)`, 'g');
      if (re.test(text)) {
        text = text.replace(re, info.ident);
        neededAudioImports.add(info.file);
      }
    }

    // 2b. i(9118) → QRCode
    if (/(?<![\w$.])i\(9118\)/.test(text)) {
      text = text.replace(/(?<![\w$.])i\(9118\)/g, 'QRCode');
      neededAudioImports.add("import QRCode from 'qrcodejs2'");
    }

    // 2c. 其它 i(<id>) 残留一律报出来（不允许悄悄留着）
    const leftovers = [...text.matchAll(/(?<![\w$.])i\((\d{2,6})\)/g)].map(m => m[1]);
    if (leftovers.length) {
      report.push(`!! ${rel} 仍有 webpack 残留: i(${[...new Set(leftovers)].join('), i(')})`);
    }

    // 2d. 标识符改名
    for (const fix of IDENT_FIXES[rel] || []) text = text.replace(fix.find, fix.replace);

    // 2d-2. 模板通用修复
    for (const fix of TEMPLATE_FIXES) {
      if (fix.find.test(text)) {
        text = text.replace(fix.find, fix.replace);
        report.push(`模板修复: ${rel} 合并被拆开的 v-if 条件`);
      }
      fix.find.lastIndex = 0;
    }

    // 2e. 插入 import（去重：同一个包可能已经在文件顶部 import 过）
    const extraImports = [];
    for (const imp of [...(EXTRA_IMPORTS[rel] || []), ...neededAudioImports]) {
      const clause = /^import\s+(.+?)\s+from\s+/.exec(imp);
      const bindings = clause ? clause[1] : null;
      const already = bindings && new RegExp(
        `^import\\s+${bindings.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+from`, 'm'
      ).test(text);
      if (already) continue;
      if (extraImports.includes(imp)) continue;
      extraImports.push(imp);
    }
    if (extraImports.length) {
      const block = extraImports.join('\n');
      // 先摘掉上一次运行留下的块，保证幂等
      const stripped = text.replace(/\n\/\/ @restored:imports\n[\s\S]*?\/\/ @restored:imports-end/g, '');
      // 只认真正的 import 语句，别把 marker 注释当锚点
      const lastImport = [...stripped.matchAll(/^import\s+[^\n]*$/gm)].pop();
      if (!lastImport) throw new Error(`${rel}: 找不到 import 语句`);
      const at = lastImport.index + lastImport[0].length;
      text = `${stripped.slice(0, at)}\n// @restored:imports\n${block}\n// @restored:imports-end${stripped.slice(at)}`;
    }

    // 2f. 插入模块级声明（放在最后一条 import 之后）
    const decls = MODULE_DECLS[rel] || [];
    const declMarker = '// @restored:module-decls';
    if (decls.length) {
      const block = `${declMarker}\n${decls.join('\n\n')}`;
      const existing = text.indexOf(declMarker);
      if (existing >= 0) {
        const start = text.lastIndexOf('\n', existing);
        const end = text.indexOf(`${declMarker}-end`, existing);
        if (end < 0) throw new Error(`${rel}: @restored:module-decls 缺少结束标记，请手工检查`);
        text = text.slice(0, start) + block + text.slice(end);
      } else {
        const lastImport = [...text.matchAll(/^import\s+[^\n]*$/gm)].pop();
        if (!lastImport) throw new Error(`${rel}: 找不到 import 语句`);
        const at = lastImport.index + lastImport[0].length;
        text = text.slice(0, at) + `\n${block}\n${declMarker}-end` + text.slice(at);
      }
    }

    // 2g. 插入 module 级函数（放在 `export default` 之前）
    const fnMarker = '// @restored:funcs';
    const fns = MODULE_FUNCS[rel] || [];
    if (fns.length) {
      const body = fns.map(f => `// ${f.name}\n${f.code}`).join('\n\n');
      const existing = text.indexOf(fnMarker);
      if (existing >= 0) {
        const start = text.lastIndexOf('\n', existing);
        const end = text.indexOf(`${fnMarker}-end`, existing);
        if (end < 0) throw new Error(`${rel}: @restored:funcs 缺少结束标记，请手工检查`);
        text = text.slice(0, start) + `${fnMarker}\n${body}\n${fnMarker}-end` + text.slice(end);
      } else {
        const at = text.indexOf('\nexport default');
        if (at < 0) throw new Error(`${rel}: 找不到 export default，无法插入 module 级函数`);
        text = text.slice(0, at) + `\n${fnMarker}\n${body}\n${fnMarker}-end\n` + text.slice(at + 1);
      }
    }

    // 最后统一去掉生成器留下的顶层重复声明
    text = dedupeTopLevelDeclarations(text, rel, report).text;

    // 幂等兜底：marker 行之间不要夹空行，避免多轮运行时产生无意义 diff
    text = text.replace(/^(\/\/ @restored:[\w-]+(?:-end)?)\n\n+(?=\/\/ @restored:)/gm, '$1\n');

    if (text !== before) {
      if (!DRY) fs.writeFileSync(file, text);
      changes.push(rel);
    }
  }
}

/**
 * 2h. 清理死代码与无用 import（幂等，可反复执行）。
 *
 * `var nt = st;` 里的 `nt` 在 2d 已被全部改名成 `request`，所以这一行成了死代码；
 * 几个被生成器「顺手带上」的 import（clipboard / Download / moment / axios / Vue）
 * 在组件里根本没有引用。
 */
function postProcess() {
  for (const file of walk(SRC)) {
    if (file.endsWith('background.js')) continue;
    const rel = path.relative(ROOT, file);
    let text = fs.readFileSync(file, 'utf8');
    const before = text;

    for (const re of DEAD_CODE) text = text.replace(re, '');
    for (const imp of DEAD_IMPORTS[rel] || []) {
      const re = new RegExp(`^${imp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n`, 'm');
      if (re.test(text)) {
        text = text.replace(re, '');
        report.push(`清理无用 import: ${rel} → ${imp}`);
      }
    }
    for (const stmt of EXTRA_CODE[rel] || []) {
      if (!new RegExp(`^${stmt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm').test(text)) {
        const lastImport = [...text.matchAll(/^import .*$/gm)].pop();
        if (lastImport) {
          const at = lastImport.index + lastImport[0].length;
          text = `${text.slice(0, at)}\n\n${stmt}${text.slice(at)}`;
          report.push(`补充代码: ${rel} → ${stmt}`);
        }
      }
    }

    if (text !== before) {
      if (!DRY) fs.writeFileSync(file, text);
      changes.push(rel + ' (清理)');
    }
  }
}

/**
 * 1b. 主进程依赖名修正（background.js 不走常规 rewrite 流程）。
 *
 * 生成器把 bundle 里的 `getPortPromise({port, startPort, stopPort})` 与
 * callback 风格的 `getPort(options, cb)` 这套 API 认成了 `get-port` 包，
 * 但它是 **`portfinder`**：
 *   - `exports.getPortPromise = ...` 与 `exports.getPort` 双导出
 *   - 选项名 `host` / `startPort` / `stopPort`
 *   - 错误文案 "Native promise support is not available in this version of node"
 *     （portfinder 1.0.34 及以下才有，1.0.35 起移除）
 *
 * 为什么必须修：`get-port` 从 6.0 起是 ESM-only，而主进程是 CommonJS 且把
 * dependencies 留作运行时 external —— `require()` 一个 ESM 包会直接抛
 * `ERR_REQUIRE_ESM`，属于典型的「能构建、不能运行」陷阱。
 */
const BACKGROUND_FIXES = [
  { find: /^import getPort from 'get-port'$/gm, replace: "import portfinder from 'portfinder'" },
  { find: /(?<![\w$.])getPort(?=\.getPortPromise\()/g, replace: 'portfinder' },
];

function fixBackgroundDeps() {
  const file = path.join(SRC, 'background.js');
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  for (const fix of BACKGROUND_FIXES) text = text.replace(fix.find, fix.replace);
  if (text !== before) {
    if (!DRY) fs.writeFileSync(file, text);
    report.push('background.js: 依赖名修正 get-port → portfinder');
    changes.push('src/background.js (依赖名)');
  }
}

/* 3) 修 router / store 的 import 缺陷 */
function fixRouterAndStore() {
  const routerFile = path.join(SRC, 'router', 'index.js');
  let r = fs.readFileSync(routerFile, 'utf8');
  if (!/^import store from/m.test(r)) {
    r = r.replace(/^(import \$notify from '\.\.\/plugins\/notify')$/m, "$1\nimport store from '../store'");
    if (!DRY) fs.writeFileSync(routerFile, r);
    changes.push('src/router/index.js');
    report.push('router/index.js: 补回 `import store from \'../store\'`（缺陷 C）');
  }
  const storeFile = path.join(SRC, 'store', 'index.js');
  let s = fs.readFileSync(storeFile, 'utf8');
  if (!/^import Vue from 'vue'$/m.test(s)) {
    s = "import Vue from 'vue'\n" + s;
    if (!DRY) fs.writeFileSync(storeFile, s);
    changes.push('src/store/index.js');
    report.push("store/index.js: 补回 `import Vue from 'vue'`（Vuex 3 需要显式 Vue.use）");
  }
}

/* 4) 静态资源与 logo */
function copyStaticAssets() {
  const rec = path.resolve(ROOT, '..', 'recovered');
  // 只复制「真正被源码引用」的静态资源。
  // recovered/assets/ 下同时躺着 webpack 的构建产物（css/、js/），
  // 那些不能进 src/ —— 样式源码由 tools/restore-styles.js 从 CSS 产物反推。
  const SKIP_DIRS = new Set(['css', 'js', 'fonts']);
  const copyDir = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const e of fs.readdirSync(from, { withFileTypes: true })) {
      if (e.isDirectory() && SKIP_DIRS.has(e.name)) continue;
      const s = path.join(from, e.name);
      const d = path.join(to, e.name);
      if (e.isDirectory()) copyDir(s, d);
      else if (!DRY) fs.copyFileSync(s, d);
    }
  };
  const assetsDir = path.join(rec, 'assets');
  if (fs.existsSync(assetsDir)) {
    copyDir(assetsDir, path.join(SRC, 'assets'));
    report.push('已复制 recovered/assets/ → src/assets/（已排除 css/js/fonts 构建产物）');
  }
  // 产物名 → 源文件名
  const media = path.join(SRC, 'assets/media');
  const produced = path.join(media, 'no.956e656b.mp3');
  if (fs.existsSync(produced)) {
    const target = path.join(media, 'no.mp3');
    if (!DRY) fs.renameSync(produced, target);
    report.push('音频: no.956e656b.mp3 → no.mp3（源文件名，构建时 webpack 会重新加 hash）');
  }

  const ico = path.join(rec, 'logo.ico');
  if (fs.existsSync(ico) && !DRY) fs.copyFileSync(ico, path.join(SRC, 'logo.ico'));
}

const audioMap = materializeAudio();
writeGeneratedPlugins();
fixBackgroundDeps();
rewriteFiles();
postProcess();
fixRouterAndStore();
copyStaticAssets();

// 6) 样式恢复（从 asar 的 CSS 产物反推，见 tools/restore-styles.js）
console.log('\n--- 样式恢复 ---');
require('./restore-styles.js');

console.log(report.join('\n'));
console.log(`\n改动文件 (${changes.length}):`);
for (const c of changes) console.log('  ' + c);
console.log(`\n音频 id 映射: ${[...audioMap.keys()].join(', ')}`);
console.log(DRY ? '\n[dry-run] 未写入任何文件' : '\n完成。下一步：node tools/validate-src.js');
