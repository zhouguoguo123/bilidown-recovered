<!--
  App — reconstructed from app.asar (Bilidown v1.2.7)
  <template> was decompiled from the compiled render function;
  <script> is the original component options object (identifiers restored).
-->
<template>
<div id="app">
  <el-menu :default-active="ativeRouterName" router class="app-left-menu" @select="menuClick">
    <div class="acount">
      <div v-if="!(user.state)" @click="goAccountRouter" />
      <img v-if="user.state" :src="user.face" @click="goAccountRouter" />
      <span v-if="user.vip" class="biliMajorMembers" @click="goAccountRouter">
        大
      </span>
    </div>
    <el-menu-item index="search">
      <i class="el-icon-search" />
    </el-menu-item>
    <el-menu-item index="download">
      <i class="el-icon-download" />
      <el-badge v-if="waitDown.length && $route.name != 'download'" :value="waitDown.length" :max="99" class="el-menu-download-tip waitdown" />
    </el-menu-item>
    <el-menu-item v-if="setting.tools" index="tools">
      <i class="iconfont icon-kuozhan" />
    </el-menu-item>
    <el-menu-item index="acount">
      <i class="el-icon-user" />
    </el-menu-item>
    <label class="theme-toggle" @click="toggleTheme">
      <input type="checkbox" ref="toggleTheme" />
      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="1em" height="1em" fill="currentColor" viewBox="0 0 32 32" class="theme-toggle__around">
        <clipPath id="theme-toggle__around__cutout">
          <path d="M0 0h42v30a1 1 0 00-16 13H0Z" />
        </clipPath>
        <g clip-path="url(#theme-toggle__around__cutout)">
          <circle cx="16" cy="16" r="8.4" />
          <g>
            <circle cx="16" cy="3.3" r="2.3" />
            <circle cx="27" cy="9.7" r="2.3" />
            <circle cx="27" cy="22.3" r="2.3" />
            <circle cx="16" cy="28.7" r="2.3" />
            <circle cx="5" cy="22.3" r="2.3" />
            <circle cx="5" cy="9.7" r="2.3" />
          </g>
        </g>
      </svg>
    </label>
    <div class="left-menu-setting">
      <el-menu-item index="setting">
        <i class="el-icon-setting" />
        <el-badge v-if="newVersion && $route.name != 'setting'" type="success" is-dot class="el-menu-download-tip updateTip" />
      </el-menu-item>
    </div>
  </el-menu>
  <div class="native-bar">
    <div class="controls" @click="nativeBarEvent" />
  </div>
  <div class="main">
    <keep-alive>
      <router-view @shutdown="shutdownHandler" />
    </keep-alive>
  </div>
  <el-dialog title="关机提示" :visible="shutdownTipDialogVisible" class="shutdown-dialog" @update:visible="shutdownTipDialogVisible = $event">
    <p>
      你在
      <span>
        设置
      </span>
      中开启了
      <span>
        自动关机设置
      </span>
      ，并且下载中任务已全部完成，待下载任务为空。因此满足自动关机条件。 
    </p>
    <p>
      你的计算机将在 
      <span>
        {{ autoShutdownCount }}
      </span>
       秒后自动关机，你可以
      <span>
        点击取消按钮
      </span>
      阻止关机操作。 
    </p>
    <div style="margin: 15px 0" />
    <span slot="footer" class="dialog-footer">
      <b-button type="success" size="mini" round @click="cancelAutoShotDown">
        取消
      </b-button>
    </span>
  </el-dialog>
  <div v-show="!online" class="offline">
    <div class="native-bar">
      <div class="controls" @click="nativeBarEvent" />
    </div>
    <svg t="1713879671598" viewBox="0 0 1301 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8367" width="128" height="128" class="icon">
      <path d="M133.683597 173.84186a31.58524 31.58524 0 0 1 31.482046 31.497923 31.577302 31.577302 0 0 1-31.482046 31.489984 31.593178 31.593178 0 0 1-31.497923-31.489984 31.593178 31.593178 0 0 1 31.497923-31.489985z m-0.007938 47.246884a15.780713 15.780713 0 0 0 15.748961-15.741023 15.796589 15.796589 0 0 0-15.748961-15.756899 15.796589 15.796589 0 0 0-15.741023 15.756899 15.796589 15.796589 0 0 0 15.741023 15.741023zM91.445581 758.998326c0 7.604589 5.072372 12.692837 12.700776 12.692837 7.620465 0 12.684899-5.08031 12.684899-12.700775v-15.240931h15.24093c7.620465 0 12.700775-5.08031 12.700775-12.700775 0-7.620465-5.08031-12.700775-12.700775-12.700775h-15.24093v-15.24093c0-7.628403-5.072372-12.700775-12.692837-12.700775s-12.692837 5.072372-12.692838 12.700775v15.24093H76.204651c-7.612527 0-12.692837 5.08031-12.692837 12.700775 0 7.620465 5.08031 12.700775 12.692837 12.700775h15.248868v15.240931zM1158.961612 234.368992v-15.232992c0-7.620465-5.072372-12.692837-12.700775-12.692837-7.620465 0-12.700775 5.072372-12.700775 12.700775v15.225054h-15.232992c-7.620465 0-12.708713 5.088248-12.708713 12.700775 0 7.636341 5.08031 12.700775 12.708713 12.700776h15.24093v15.24093c0 7.620465 5.08031 12.700775 12.692837 12.700775 7.628403 0 12.700775-5.08031 12.700775-12.700775v-15.24093h15.240931c7.636341 0 12.700775-5.072372 12.700775-12.700776 0-7.620465-5.072372-12.700775-12.700775-12.700775h-15.240931zM1091.536372 798.664434a36.538543 36.538543 0 0 0 73.085023 0.031752v-0.031752a36.538543 36.538543 0 0 0-73.085023-0.03969v0.03969z" fill="#33a06f" p-id="8368" />
      <path d="M1280.206388 983.516279h-65.520124c-8.97786 0-16.312558 7.795101-16.312559 17.495318 0 9.700217 7.334698 17.503256 16.312559 17.503256h65.520124c8.993736 0 16.320496-7.803039 16.320496-17.503256s-7.32676-17.48738-16.320496-17.48738zM679.205705 983.516279h-76.64124c-8.97786 0-16.312558 7.795101-16.312558 17.503256 0 9.700217 7.334698 17.495318 16.312558 17.495318h76.64124c8.985798 0 16.312558-7.795101 16.312559-17.495318 0-9.708155-7.32676-17.495318-16.312559-17.495318zM1122.804093 983.516279H783.621953c-8.985798 0-16.320496 7.810977-16.320496 17.503256 0 9.700217 7.334698 17.495318 16.320496 17.495318h339.18214c8.969922 0 16.312558-7.795101 16.312558-17.495318 0-9.684341-7.342636-17.495318-16.312558-17.495318zM500.65662 983.516279H17.177798c-9.462078 0-17.177798 7.795101-17.177798 17.503256 0 9.700217 7.715721 17.495318 17.177798 17.495318H500.648682c9.45414 0 17.177798-7.795101 17.177799-17.495318 0-9.708155-7.715721-17.495318-17.169861-17.495318z" fill="#33a06f" p-id="8369" />
      <path d="M507.451535 810.285643c-0.809674 0-1.508217-0.11907-2.32583-0.238139a12.756341 12.756341 0 0 1-8.969922-6.636155 162.85569 162.85569 0 0 1-17.820775-59.169737c-5.477209-52.644713 15.256806-105.289426 55.327752-140.692837 2.91324-2.563969 6.866357-3.730853 10.716279-3.03231 3.841984 0.698543 7.104496 3.15138 8.969922 6.644093a162.85569 162.85569 0 0 1 17.812837 59.161799c5.477209 52.652651-15.256806 105.297364-55.327751 140.819845-2.325829 1.984496-5.23907 3.143442-8.382512 3.143441z m30.64062-175.286573c-25.742884 29.227659-38.443659 67.901519-34.482605 106.567442a135.422016 135.422016 0 0 0 7.922109 33.895193c25.742884-29.235597 38.435721-67.901519 34.474667-106.575379a143.32031 143.32031 0 0 0-7.922109-33.895194z" fill="#33a06f" p-id="8370" />
      <path d="M505.594047 810.285643c-52.295442-7.922109-91.778977-53.105116-91.778977-105.178294 0-58.701395 48.564589-106.448372 108.313798-106.448372 7.342636 0 14.558264 0.698543 21.551628 2.095628l-5.008868 24.925271a86.84155 86.84155 0 0 0-16.653892-1.635225c-45.778357 0-82.928124 36.340093-82.928124 80.951566 0 39.594667 30.164341 74.077271 70.227349 80.014884l-3.730852 25.274542z" fill="#33a06f" p-id="8371" />
      <path d="M534.012031 697.074109c-1.047814 0-2.214698-0.11907-3.262512-0.468342l-9.668465-2.556031a12.756341 12.756341 0 0 1-8.969922-15.614015 12.851597 12.851597 0 0 1 15.606077-8.969923l9.668465 2.563969a12.756341 12.756341 0 0 1 8.969923 15.614016 13.034171 13.034171 0 0 1-12.343566 9.430326z m-7.922109 44.841674c-1.047814 0-2.214698-0.11907-3.254573-0.468341l-9.676403-2.556031a12.700775 12.700775 0 0 1-8.969923-15.614016 12.756341 12.756341 0 0 1 15.614016-8.969922l9.668465 2.563969a12.700775 12.700775 0 0 1 8.969922 15.614015 13.034171 13.034171 0 0 1-12.351504 9.430326z m210.697923 43.674791c-0.349271 0-0.817612 0-1.166884-0.111132l-47.866046-4.429395a12.684899 12.684899 0 0 1-11.414822-13.859721c0.698543-6.985426 6.985426-12.113364 13.859721-11.414822l47.866046 4.429395c6.985426 0.698543 12.113364 6.866357 11.414822 13.859721a12.573767 12.573767 0 0 1-12.700775 11.525954z" fill="#33a06f" p-id="8372" />
      <path d="M785.122233 844.99845c-11.994295 0-23.877457-2.222636-35.522481-6.413892l-5.477209-1.984496-2.095628-5.469271a179.16031 179.16031 0 0 1-11.414822-63.122853 181.00986 181.00986 0 0 1 42.746047-116.593116l3.730852-4.421458 5.818543-0.119069c0.817612-0.11907 1.397085-0.11907 2.095628-0.11907 55.565891 0 100.748899 44.373333 100.748899 99.002542 0.11907 54.978481-45.071876 99.232744-100.629829 99.232745z m-21.194419-28.537055c6.985426 1.976558 14.089922 3.024372 21.194419 3.024372 41.579163 0 75.355287-33.077581 75.355286-73.60893 0-39.253333-31.561426-71.394233-71.2831-73.497798a155.147907 155.147907 0 0 0-33.069644 95.628899c0 16.534822 2.556031 32.839442 7.803039 48.453457z" fill="#33a06f" p-id="8373" />
      <path d="M744.821085 723.277395c-1.047814 0-2.095628-0.111132-3.143442-0.349271l-46.468961-11.986357a12.740465 12.740465 0 0 1-9.088992-15.494945 12.740465 12.740465 0 0 1 15.494946-9.088993l46.468961 11.994295c6.755225 1.746357 10.835349 8.731783 9.088992 15.494946-1.635225 5.477209-6.755225 9.430326-12.351504 9.430325z" fill="#33a06f" p-id="8374" />
      <path d="M675.76062 916.837209c252.086574 0 456.434109-204.355473 456.434109-456.434108S927.855132 3.968992 675.76062 3.968992C423.689922 3.968992 219.326512 208.324465 219.326512 460.403101s204.355473 456.434109 456.434108 456.434108z m0-39.689922c-230.153922 0-416.744186-186.582326-416.744186-416.744186S445.614636 43.658915 675.76062 43.658915c230.169798 0 416.744186 186.582326 416.744186 416.744186s-186.574388 416.744186-416.744186 416.744186z" fill="#33a06f" p-id="8375" />
      <path d="M781.27231 298.333271c45.119504 0 81.697736-36.570295 81.697737-81.689798S826.391814 134.945736 781.27231 134.945736s-81.689798 36.578233-81.689798 81.697737 36.570295 81.689798 81.689798 81.689798z m0-39.689922a42.007814 42.007814 0 1 1 0-84.00769 42.007814 42.007814 0 0 1 0 84.00769zM923.163783 560.28676c55.168992 0 99.891597-44.714667 99.891597-99.883659s-44.722605-99.883659-99.891597-99.883659c-55.168992 0-99.883659 44.714667-99.883659 99.883659s44.722605 99.883659 99.883659 99.883659z m0-39.689923a60.193736 60.193736 0 1 1 0-120.387473 60.193736 60.193736 0 0 1 0 120.387473z" fill="#33a06f" p-id="8376" />
      <path d="M246.966574 320.377054a19.844961 19.844961 0 1 1 7.509333 38.975504c-105.019535 20.24186-166.388093 56.875659-172.19076 98.18493-9.541457 67.861829 124.705736 157.386419 336.594357 215.849675a19.844961 19.844961 0 1 1-10.55752 38.261085C177.731473 648.025302 29.346729 549.06245 42.984186 452.012651c8.969922-63.757891 83.880682-108.488434 203.990326-131.635597zM887.355535 772.223008a19.844961 19.844961 0 0 1-0.889054-39.689923c196.965209-4.397643 329.450171-51.898543 338.237519-114.441922 5.350202-38.022946-35.697116-85.507969-117.950512-130.99262a19.844961 19.844961 0 1 1 19.209923-34.728683c95.200248 52.628837 146.39231 111.862078 138.049488 171.24614-12.732527 90.627969-160.998202 143.788651-376.657364 148.59907z" fill="#33a06f" p-id="8377" />
    </svg>
    <span>
      您已离线，请检查网络连接状态。
    </span>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import moment from 'moment'
import store from './store'
// @restored:imports
import Dexie from 'dexie'
import { HolidayUtil } from 'lunar-javascript'
import request from './plugins/request'
import { shell } from './plugins/electron'
import tipAudioSuccess from '@/assets/media/tip-success.mp3'
import tipAudioYes from '@/assets/media/tip-yes.mp3'
import tipAudioNo from '@/assets/media/no.mp3'
import tipAudioSaoma from '@/assets/media/tip-saoma.mp3'
import tipAudioHover from '@/assets/media/tip-hover.mp3'
import tipAudioClick from '@/assets/media/tip-click.mp3'
// @restored:module-decls
const { remote: xt } = window.require("electron");

const { spawn: St } = window.require("child_process");

const de = {
  downloaded: "++id,uid,upname,title,pic,bv,path,downDate,type,&vid",
  download: "++id,aModel,aSelect,aid,cid,asize,assFormatName,audioFullPath,bv,completedLength,coverFormatName,desc,downloadFolder,duration,fenpTitle,formatDuration,formatName,gid,guaxiaoFormatName,hejiTitle,index,isDownloading,paused,pic,progress,progressMB,pubdate,qn,speed,srtFormatName,status,taskStack,taskStackCache,tip,title,totalLength,type,upname,vModel,vSelect,vid,video,videoFormatName,videoFullPath,vmap,vsize,xmlFormatName,zimu"
};
const ue = new Dexie("downloadDatabase");
ue.version(1).stores(de);
ue.open();
ue.checkIfTableHasData = async function (t) {
  try {
    const e = await ue[t].count();
    return e > 0;
  } catch (e) {
    return false;
  }
};

const { remote: te } = window.require("electron");
const ee = te.require("fs");

const { remote: fe } = window.require("electron");
const { ipcRenderer: qe } = window.require("electron");

const me = HolidayUtil;
// @restored:module-decls-end
// @restored:imports-end

async function At() {
  return request.get("https://api.bilibili.com/x/web-interface/nav");
}

const mt = {
  async pcvisited() {
    return request.get("https://bili.zhouql.vip/pcVisited");
  },
  async pccount(t) {
    return request.get(`https://bili.zhouql.vip/pcCount/${t}`);
  }
};

async function vt() {
  return request.get(`https://zhouql.vip/bilidown/support/support.json?t=${new Date().getTime()}`);
}

const ft = "data:image/gif;base64,R0lGODlh9AFpAZEDAN3d3bu7u5mZmQAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkRENTUxOTVDRENEQjExRThBRjNGRjcyMEY4MEMxRDUzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkRENTUxOTVERENEQjExRThBRjNGRjcyMEY4MEMxRDUzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6REQ1NTE5NUFEQ0RCMTFFOEFGM0ZGNzIwRjgwQzFENTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6REQ1NTE5NUJEQ0RCMTFFOEFGM0ZGNzIwRjgwQzFENTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjH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";

const Mt = "data:image/webp;base64,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";

const Bt = new Audio(tipAudioNo);

const It = new Audio(tipAudioYes);

const Nt = new Audio(tipAudioClick);

const Yt = new Audio(tipAudioHover);

const Ft = new Audio(tipAudioSaoma);

const Lt = new Audio(tipAudioSuccess);

function zt(t) {
  if (store.state.setting.soundTip) {
    switch (t) {
      case "click":
        Nt.play();
        break;
      case "hover":
        Yt.play();
        break;
      case "no":
        Bt.play();
        break;
      case "yes":
        It.play();
        break;
      case "saoma":
        Ft.play();
        break;
      case "success":
        Lt.play();
        break;
    }
  }
}

function Ot(t) {
  shell.openExternal(t);
}

function Xt() {
  if (localStorage) {
    localStorage.setItem("setting", JSON.stringify({
      tray: false,
      pic: true,
      music: true,
      xml: false,
      ass: false,
      guaxiao: false,
      zimu: false,
      soundTip: true,
      maxDownCount: 1,
      videoQn: "16",
      audioQn: "64",
      videoEncoding: "avc1",
      tools: false,
      shutdown: false,
      listenClipboard: false
    }));
  }
}

async function $t() {
  // 更新源只发布 Windows 构建；其它平台直接回当前版本，避免 404 与误报有更新
  if (process.platform !== "win32") {
    return {
      data: `version: ${fe.app.getVersion()}`
    };
  }
  return request.get(`https://zhouql.vip/bdupdate/win32/latest.yml?${new Date().getTime()}`);
}

function Ae(t) {
  let e = t.target.className;
  let i = te.BrowserWindow.getFocusedWindow();
  if (e === "minimize") {
    i.minimize();
  } else if (e === "fullscreen") {
    if (i.isMaximized()) {
      i.unmaximize();
    } else {
      i.maximize();
    }
  } else if (e === "close") {
    i.close();
  }
}

function le(t, e) {
  if (!document.head.querySelector(t)) {
    let i = document.createElement("style");
    i.id = t.split("#")[1];
    i.textContent = e;
    document.head.appendChild(i);
  }
}

var he = ue;

const ge = {
  元旦节: ["愿新年的阳光带给您温暖与希望，元旦快乐！", "元旦佳节，祝福如意，幸福常伴！", "元旦快乐，愿新的一年充满希望与幸福！", "祝您元旦快乐，身体健康，心想事成！"],
  春节: ["春节快乐！", "新春快乐，万事如意！", "祝您新年快乐，幸福安康！", "新年快乐，万事顺意！", "万事如意，阖家幸福！", "新年新气象，步步高升！"],
  清明节: ["清明安康！"],
  劳动节: ["庆祝五一劳动节，尊重劳动，尊重劳动者！", "劳动节快乐！"],
  端午节: ["端午安康，万事如意！", "端午安康。", "一年一端午，一岁一安康。", "五月五，是端午，敲敲锣来打打鼓。", "万粽一心，共创美好愿景。"],
  中秋节: ["花好月圆，祝你中秋快乐，家庭幸福！", "月到中秋分外明，愿你生活更美好，心情更舒畅！", "中秋月圆，愿你平安、健康、快乐！", "中秋夜，愿你的生活像满月一样圆满无缺！", "秋意浓浓，情谊深深，中秋节快乐！", "月华如水，心意如潮，愿我们共赏这人间美景。", "月圆人更圆，愿你生活圆满，幸福相随！", "举杯邀明月，烦恼都退却。中秋节快乐！", "月圆人圆，钱包更圆。", "月亮tag了你：「祝你中秋節快樂！」"],
  国庆节: ["红旗飘飘，举杯同庆。", "愿山河无恙，国泰民安。祝福伟大的祖国母亲生日快乐！", "国庆节快乐！"]
};

const ve = new Set();

function we() {
  const t = moment().format("YYYY-MM-DD");
  const e = me.getHoliday(t);
  if (e && !e._p.work) {
    const t = e._p;
    const i = t.name.trim();
    if (ve.has(i) && ge[i]) {
      t.message = ge[i][Math.floor(Math.random() * ge[i].length)];
      return t;
    } else {
      return null;
    }
  }
  return null;
}

const Ve = window.require("fs");

export default {
  data() {
    return {
      online: true,
      shutdownTipDialogVisible: false,
      autoShutdownTimer: null,
      autoShutdownCount: 30
    };
  },
  mounted() {
    this.$router.push("/download");
    this.$nextTick(() => {
      const t = this.$children.find(t => t.$options.name === "Download");
      if (t) {
        t.initSaveTasksEvent();
      }
      this.$router.push("/search");
    });
    he.checkIfTableHasData("download").then(t => {
      if (t) {
        this.$router.push({
          name: "download",
          query: {
            echo: "true"
          }
        });
      }
    });
    if (navigator.onLine) {
      this.supportAndDataUpdateCheck();
    } else {
      this.online = false;
    }
    window.addEventListener("online", async () => {
      setTimeout(async () => {
        await this.supportAndDataUpdateCheck();
      }, 1000);
    });
    window.addEventListener("offline", () => this.online = false);
    let t = localStorage.getItem("aface");
    let e = localStorage.getItem("zanzhucode");
    if (t == null) {
      localStorage.setItem("aface", Mt);
    }
    if (e == null) {
      localStorage.setItem("zanzhucode", ft);
    }
    this.$store.commit("updateAFace", localStorage.getItem("aface"));
    this.$store.commit("updateZanzhuCode", localStorage.getItem("zanzhucode"));
    window.openExternalLink = Ot;
    const i = localStorage.getItem("defaultDownPath");
    const a = localStorage.getItem("setting");
    const s = localStorage.getItem("theme");
    const n = localStorage.getItem("buid");
    const o = localStorage.getItem("renameRule");
    const r = localStorage.getItem("folderRenameRule");
    if (!s) {
      localStorage.setItem("theme", "light");
    }
    if (s == "dark") {
      this.$refs.toggleTheme.checked = true;
      document.documentElement.setAttribute("dark-theme", "dark");
    } else {
      document.documentElement.setAttribute("dark-theme", "light");
    }
    setTimeout(() => {
      le("#lazy-style", ".app-left-menu,.native-bar,.main {transition: background 0.15s;}");
    }, 160);
    if (o) {
      this.$store.commit("updateRenameRule", o);
    } else {
      localStorage.setItem("renameRule", "%title%");
      this.$store.commit("updateRenameRule", "%title%");
    }
    if (!r) {
      localStorage.setItem("folderRenameRule", "");
    }
    this.$store.commit("updateFolderRenameRule", "");
    if (!a) {
      Xt();
    }
    this.$store.commit("updateSetting", JSON.parse(localStorage.getItem("setting")));
    this.checkUpdate();
    window.addEventListener("unhandledrejection", t => {
      t.preventDefault();
      return true;
    });
    document.querySelectorAll(".el-button--primary").forEach(t => {
      t.addEventListener("click", () => {
        zt("yes");
      });
    });
    if (localStorage.getItem("user")) {
      this.$store.commit("updateLoginInfo", JSON.parse(localStorage.getItem("user")));
      At().then(t => {
        if (t.data.data.isLogin) {
          let e = {
            state: true,
            uname: t.data.data.uname,
            face: t.data.data.face + "@120w_120h_1c.avif",
            coin: Math.floor(t.data.data.money),
            uid: t.data.data.mid
          };
          e.vip = !!t.data.data.vipStatus;
          this.$store.commit("updateLoginInfo", e);
          localStorage.setItem("user", JSON.stringify(e));
        } else {
          let t = {
            state: false,
            uname: "",
            face: "",
            vip: false,
            coin: "",
            uid: ""
          };
          this.$store.commit("updateLoginInfo", t);
          localStorage.setItem("user", JSON.stringify(t));
          if (JSON.parse(localStorage.getItem("user")).state) {
            $notify.error("登录已失效");
          }
          this.$store.commit("modifySetting", {
            key: "videoQn",
            value: "16"
          });
          this.$store.commit("modifySetting", {
            key: "audioQn",
            value: "64"
          });
          this.$store.commit("modifySetting", {
            key: "zimu",
            value: "false"
          });
          let e = JSON.parse(localStorage.getItem("setting"));
          if (e) {
            e.videoQn = "16";
            e.audioQn = "64";
            e.zimu = "false";
            localStorage.setItem("setting", JSON.stringify(e));
          }
        }
      });
    }
    qe.send("check-tray-status", this.setting.tray);
    qe.send("listen-clipboard-status-change", this.setting.listenClipBoard);
    setTimeout(() => {
      if (this.$route.name === "search") {
        const t = we();
        if (t) {
          const {
            message: e
          } = t;
          $notify.hi(e, 5000);
        } else {
          $notify.hi(this.user.uname ? `欢迎${this.user.uname}，祝你开心。` : "欢迎使用，祝你开心。");
        }
      }
    }, 380);
    if (i) {
      if (Ve.existsSync(i)) {
        this.$store.commit("updateDefaultDownPath", i);
      } else {
        setTimeout(() => {
          $notify.error("检测到默认下载文件夹已删除，已重置为桌面", 5000);
        }, 3800);
        let t = fe.app.getPath("desktop");
        localStorage.setItem("defaultDownPath", t);
        this.$store.commit("updateDefaultDownPath", t);
      }
    } else {
      let t = fe.app.getPath("desktop");
      localStorage.setItem("defaultDownPath", t);
      this.$store.commit("updateDefaultDownPath", t);
    }
    mt.pcvisited();
    if (n) {
      mt.pccount(n);
    }
  },
  methods: {
    supportAndDataUpdateCheck() {
      vt().then(t => {
        if (t.data.support) {
          this.$store.commit("updateSupport", true);
        } else {
          this.$store.commit("updateSupport", false);
        }
        let e = localStorage.getItem("faceUT");
        if (e == null) {
          localStorage.setItem("faceUT", "");
        }
        if (t.data.faceUT && t.data.faceUT != e) {
          axios.get(`https://zhouql.vip/bilidown/support/face.txt?t=${new Date().getTime()}`).then(e => {
            localStorage.setItem("aface", e.data);
            this.$store.commit("updateAFace", e.data);
            localStorage.setItem("faceUT", t.data.faceUT);
          });
          axios.get(`https://zhouql.vip/bilidown/support/zanzhucode.txt?t=${new Date().getTime()}`).then(e => {
            localStorage.setItem("zanzhucode", e.data);
            this.$store.commit("updateZanzhuCode", e.data);
            localStorage.setItem("faceUT", t.data.faceUT);
          });
        }
      }).catch(t => {
        this.$store.commit("updateSupport", false);
      }).finally(t => {
        this.online = true;
      });
    },
    shutdownHandler() {
      this.shutdownTipDialogVisible = true;
      this.autoShutdownTimer = setInterval(() => {
        this.autoShutdownCount--;
        if (this.autoShutdownCount == 0) {
          this.cancelAutoShotDown();
          qe.send("shutdown");
          qe.once("shutdown-result", async (t, e) => {
            if (!e) {
              $notify.error("自动关机失败，未知原因。");
            }
          });
        }
      }, 1000);
    },
    cancelAutoShotDown() {
      this.shutdownTipDialogVisible = false;
      if (this.autoShutdownTimer) {
        clearInterval(this.autoShutdownTimer);
      }
      this.autoShutdownCount = 30;
      $notify.info("自动关机操作已被取消。");
    },
    checkUpdate() {
      $t().then(t => {
        const e = t.data.split("\n")[0].split(":")[1].trim();
        const i = fe.app.getVersion();
        if (e != i) {
          this.$store.commit("updateNewVersion", true);
        } else {
          this.$store.commit("updateNewVersion", false);
        }
      });
    },
    nativeBarEvent(t) {
      Ae(t);
    },
    goAccountRouter() {
      if (this.$route.name !== "acount") {
        this.$router.push("/acount");
        zt("yes");
      } else {
        if (!this.user.state && !this.user.uid) {
          return;
        }
        zt("hover");
        Ot(`https://space.bilibili.com/${this.user.uid}/`);
      }
    },
    menuClick(t) {
      if (this.$route.name !== t) {
        zt("click");
      }
    },
    toggleTheme() {
      if (this.$refs.toggleTheme.checked) {
        localStorage.setItem("theme", "dark");
        document.documentElement.setAttribute("dark-theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
        document.documentElement.setAttribute("dark-theme", "light");
      }
    }
  },
  computed: {
    ...(0, mapState)(["ativeRouterName", "user", "waitDown", "newVersion", "setting", "support"])
  }
};
</script>
