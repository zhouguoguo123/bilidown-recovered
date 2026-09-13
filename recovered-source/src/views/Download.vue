<!--
  Download — reconstructed from app.asar (Bilidown v1.2.7)
  <template> was decompiled from the compiled render function;
  <script> is the original component options object (identifiers restored).
-->
<template>
<div v-loading="loading" element-loading-text="正在恢复待下载数据..." class="downloader">
  <el-tabs v-model="activeName">
    <el-tab-pane label="待下载" name="待下载" class="download">
      <span slot="label">
         {{ downloadTitle }} 
      </span>
      <div v-if="download.length" class="download-menu">
        <b-button size="small" type="primary" round class="downDirectory" @click="selectCacheDownPath">
          存储：{{ downDirectory }} 
        </b-button>
        <b-button size="small" type="primary" round @click="selectDownContentDialogVisible = true">
          自定义批量 
        </b-button>
        <b-button size="small" type="success" round @click="downAllTask">
          下载视频
        </b-button>
        <b-button size="small" type="danger" round @click="removeAllTack">
          清空
        </b-button>
      </div>
      <div class="download-content">
        <ul>
          <li v-for="(i, a) in download" :key="i.cid">
            <div class="download-left">
              <img v-lazy="i.pic" alt @click="previewVideo(i)" />
              <i class="iconfont icon-tuiguangzhong" />
            </div>
            <div class="download-right">
              <div class="download-right-meta">
                <h2 class="download-right-title oneline" @click="previewVideo(i)">
                  {{ i.title }}
                </h2>
                <b-button v-show="setting.pic" size="minimini" round plain type="success" @click="saveCover(i)">
                  封面 
                </b-button>
                <b-button v-show="setting.xml" size="minimini" round plain type="success" @click="saveXML(i)">
                  xml弹幕 
                </b-button>
                <b-button v-show="setting.ass" size="minimini" round plain type="success" @click="saveASS(i)">
                  ass弹幕 
                </b-button>
                <b-button v-show="setting.guaxiao" size="minimini" round plain type="success" @click="saveNfo(i)">
                  nfo刮削 
                </b-button>
                <b-button v-for="(a, s) in i.zimu" v-show="setting.zimu" size="minimini" round plain type="success" :key="a.desc" @click="saveSrt(i.zimu[s], i)">
                  {{ a.desc }} 
                </b-button>
                <b-button v-show="setting.music" size="minimini" round plain type="success" @click="saveAAC(i)">
                  音频 
                </b-button>
                <b-button size="minimini" round plain type="success" @click="addDownTask(i)">
                  下载
                </b-button>
                <span class="delete-download-item" @click.prevent="removeDownloadTask(a)">
                  <i class="iconfont icon-guanbi" />
                </span>
              </div>
              <div class="download-right-size">
                <div class="download-right-qnsize">
                  <span v-show="i.audio" class="audioSize oneline">
                    audio：
                    <span>
                      {{ i.asize }}
                    </span>
                  </span>
                  <span v-show="i.video" class="videoSize oneline">
                    video：
                    <span>
                      {{ i.vsize }}
                    </span>
                  </span>
                  <span class="videoQn">
                    音质： 
                    <el-select v-model="v.aModel" size="mini" :placeholder="i.aSelect" @change="qnChange('audio', i)">
                      <el-option v-for="t in i.amap" :value="qnDesc" :key="qnDesc" />
                    </el-select>
                  </span>
                  <span class="audioQn">
                    画质： 
                    <el-select v-model="v.vModel" size="mini" :placeholder="i.vSelect" @change="qnChange('video', i)">
                      <el-option v-for="t in i.vmap" :value="qnDesc" :key="qnDesc" />
                    </el-select>
                  </span>
                </div>
              </div>
              <div class="download-right-desc">
                <p>
                  发布：
                  <span>
                    {{ i.pubdate }}
                  </span>
                   时长：
                  <span>
                    {{ i.formatDuration }}
                  </span>
                </p>
                <p class="oneline">
                  简介：
                  <span>
                    {{ i.desc }}
                  </span>
                </p>
              </div>
              <div v-show="i.tip" class="download-error-tip">
                 {{ i.tip }} 
              </div>
            </div>
          </li>
        </ul>
      </div>
      <b-empty v-show="!download.length" size="big">
        啥也没有（no data）
      </b-empty>
    </el-tab-pane>
    <el-tab-pane label="下载中" name="下载中" class="downloading">
      <span slot="label">
         {{ downloadingTitle }} 
      </span>
      <div v-if="downloading.length" class="downloading-menu">
        <b-button size="small" type="primary" round @click="removeAllDownloadingTask">
          清空
        </b-button>
        <b-button v-show="pauseAll" size="small" type="success" round @click="restoreAllTask">
          开始
        </b-button>
        <b-button v-show="!pauseAll" size="small" type="danger" round @click="pauseAllTask">
          暂停
        </b-button>
      </div>
      <div class="downloading-content">
        <ul>
          <li v-for="i in downloading" :key="i.cid">
            <div class="downloading-left">
              <img v-lazy="i.pic" @click="saveCover(i)" />
            </div>
            <div class="downloading-right">
              <div class="downloading-right-meta">
                <h2 class="downloading-right-title oneline">
                  {{ i.title }}
                </h2>
                <span v-show="i.tip" class="downloading-tip">
                  <span style="color: #999">
                    当前任务
                  </span>
                  ：{{ i.tip }}
                </span>
                <span v-if="i.status != 'error'" class="downloading-delete" @click="removeDownloadingTask(i)">
                  <i class="iconfont icon-shanchu" />
                </span>
                <span v-if="i.gid && i.status == 'active'" class="downloading-pause" @click="i.paused = true">
                  <i class="iconfont icon-zanting" />
                </span>
                <span v-if="i.gid && i.status == 'paused'" class="downloading-resume" @click="restoreTask(i)">
                  <i class="iconfont icon-tuiguangzhong" />
                </span>
                <span class="downloaded-open-folder" @click.prevent="openDownFolder(i.downloadFolder)">
                  <i class="iconfont icon-wenjianjia-dakai" />
                </span>
              </div>
              <div class="downloading-desc">
                <span class="downloading-progress-mb">
                   {{ i.progressMB = i.progressMB == '0.00 bytes / 0.00 bytes' ? '... / ...' : i.progressMB }} 
                </span>
                <div class="downloading-speed-status">
                  <span v-show="i.speed && i.status == 'active'" class="downloading-speed">
                    <span v-if="i.speed == '0.00 bytes/s'" class="download-icon-retry">
                      <i class="iconfont icon-zhongshi" />
                      <span>
                        重试中，可能需要一些时间...
                      </span>
                    </span>
                    <span v-else v-text="i.speed" />
                  </span>
                  <span :class="['downloading-status', 'b-status--' + i.status]">
                    {{ i.status }}
                  </span>
                </div>
              </div>
              <div class="downloading-progress">
                <b-progress :value="i.progress" :key="i.cid" />
              </div>
            </div>
          </li>
        </ul>
      </div>
      <b-empty v-show="!downloading.length" size="big">
        没下载任务（no data）
      </b-empty>
    </el-tab-pane>
    <el-tab-pane label="已下载" name="已下载" class="downloaded">
      <span slot="label">
         {{ downloadedTitle }} 
      </span>
      <div class="downloaded-menu">
        <b-button size="small" type="primary" round @click="importDownloadedRecord">
          导入
        </b-button>
        <b-button v-if="totalCount !== 0" size="small" type="success" round @click="exportDB">
          导出
        </b-button>
        <b-button v-if="totalCount !== 0" size="small" type="danger" round @click="clearDownloadedDialog">
          清空记录
        </b-button>
      </div>
      <div class="downloaded-content">
        <ul ref="downloadedUlDomRef">
          <li v-for="(i, a) in downloaded" :key="i.id">
            <div class="downloaded-left">
              <img v-lazy="i.pic" @click="saveCover(i)" />
            </div>
            <div class="downloaded-right">
              <div class="downloaded-right-meta">
                <h2 class="downloaded-right-title oneline">
                  {{ i.title }}
                </h2>
                <span class="downloaded-down-date">
                  {{ i.downDate }}
                </span>
                <el-tooltip transition :open-delay="360" content="复制BV" placement="bottom">
                  <span class="downloaded-link-copy" @click.prevent="copyBV(i.bv)">
                    <i class="iconfont icon-fuzhi" />
                  </span>
                </el-tooltip>
                <el-tooltip transition :open-delay="360" content="浏览器打开" placement="bottom">
                  <span class="downloaded-link" @click.prevent="openVideoLinkOnBrowser(i.bv)">
                    <i class="iconfont icon-lianjie" />
                  </span>
                </el-tooltip>
                <el-tooltip transition :open-delay="360" content="打开文件夹" placement="bottom">
                  <span class="downloaded-open-folder" @click.prevent="openDownFolder(i.path)">
                    <i class="iconfont icon-wenjianjia-dakai" />
                  </span>
                </el-tooltip>
                <el-tooltip transition :open-delay="360" content="删除记录" placement="bottom">
                  <span class="downloaded-delete" @click.prevent="deleteDownloadedRecords(i, a)">
                    <i class="iconfont icon-shanchu" />
                  </span>
                </el-tooltip>
              </div>
              <div class="downloaded-desc">
                <p class="downloaded-upname" @click="openUpPageOnBrowser(i.uid)">
                  <i v-show="i.upname" class="iconfont icon-UP" />
                  <span v-show="i.upname" class="oneline">
                    {{ i.upname }}
                  </span>
                </p>
                <p class="downloaded-type">
                  {{ i.type }}
                </p>
              </div>
            </div>
          </li>
          <li v-if="totalCount > 15" class="pagination">
            <el-pagination background :page-size="pageSize" :current-page="currentPage" layout="prev, pager, next" :total="totalCount" @current-change="handlerCurrentChange" @update:currentPage="currentPage = e" @update:current-page="currentPage = e" />
          </li>
        </ul>
        <b-empty v-show="!downloaded.length" size="big">
          快去下载吧（no data）
        </b-empty>
      </div>
    </el-tab-pane>
  </el-tabs>
  <el-dialog v-if="previewVideoVisible" :title="previewVideoTitle" :visible="previewVideoVisible" @close="handlerClose" @update:visible="previewVideoVisible = e">
    <b-player v-if="previewVideoVisible" :videoSource="previewVideoSrc" ref="plyrPlayer" />
  </el-dialog>
  <el-dialog title="自定义批量提示" :visible="selectDownContentDialogVisible" class="push-all" @update:visible="selectDownContentDialogVisible = e">
    <span>
      请勾选你想要批量下载的类型，然后点击开始下载开始吧！
    </span>
    <br />
    <div v-if="downContentType.length > 1" class="create-folder">
      <div>
        <p class="title">
          <svg t="1734776101494" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="23456" width="200" height="200" class="icon">
            <path d="M912 208H427.872l-50.368-94.176A63.936 63.936 0 0 0 321.056 80H112c-35.296 0-64 28.704-64 64v736c0 35.296 28.704 64 64 64h800c35.296 0 64-28.704 64-64v-608c0-35.296-28.704-64-64-64z m-800-64h209.056l68.448 128H912v97.984c-0.416 0-0.8-0.128-1.216-0.128H113.248c-0.416 0-0.8 0.128-1.248 0.128V144z m0 736v-96l1.248-350.144 798.752 1.216V784h0.064v96H112z" fill="#020202" p-id="23457" />
          </svg>
           大于一项创建文件夹 
          <el-tooltip transition :open-delay="500" placement="top-start">
            <div slot="content">
              <p style="margin-bottom: 4px">
                当选择的类型超过一个时，软件会创建一个名为“视频标题”的文件夹。
              </p>
              <p>
                以避免将多个视频的不同类型文件混乱地放在同一个文件夹里。
              </p>
            </div>
            <i class="iconfont icon-xiangqing" />
          </el-tooltip>
        </p>
      </div>
      <el-switch v-model="createFolder" size="medium" active-color="#51ae84" />
    </div>
    <div v-if="downContentType.length > 1 && createFolder" class="create-folder-add-index">
      <div>
        <p class="title">
          <svg t="1734775340247" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12804" width="16" height="16" class="icon">
            <path d="M128 96a32 32 0 0 0 0 64h32v192H128a32 32 0 0 0 0 64h128a32 32 0 0 0 0-64h-32V140.8a44.8 44.8 0 0 0-44.8-44.8H128zM437.312 256a32 32 0 0 1 32-32H896a32 32 0 0 1 0 64H469.312a32 32 0 0 1-32-32zM437.312 512a32 32 0 0 1 32-32H896a32 32 0 0 1 0 64H469.312a32 32 0 0 1-32-32zM469.312 736a32 32 0 0 0 0 64H896a32 32 0 0 0 0-64H469.312zM208.576 672.384A126.976 126.976 0 0 0 192 672H128a32 32 0 0 1 0-64h66.304c9.536 0 18.56 0 26.752 1.6a83.2 83.2 0 0 1 65.344 65.344c1.6 8.192 1.6 17.216 1.6 26.752v4.672c0 9.472 0 18.56-1.6 26.688a83.2 83.2 0 0 1-65.344 65.344 139.52 139.52 0 0 1-26.688 1.6H192c-13.44 0-15.488 0.128-16.576 0.384a19.2 19.2 0 0 0-15.04 15.104A128.128 128.128 0 0 0 160 832v32H256a32 32 0 0 1 0 64H152.512c-4.992 0-11.52 0-17.28-0.768a44.48 44.48 0 0 1-26.112-12.352 44.48 44.48 0 0 1-12.352-26.176 134.016 134.016 0 0 1-0.768-17.216v-41.856c0-9.472 0-18.56 1.6-26.688a83.2 83.2 0 0 1 65.344-65.344c8.192-1.6 17.216-1.6 26.752-1.6H192c13.44 0 15.488-0.128 16.576-0.384a19.2 19.2 0 0 0 15.04-15.104c0.256-1.024 0.384-3.072 0.384-16.512 0-13.44-0.128-15.488-0.384-16.512a19.2 19.2 0 0 0-15.04-15.104z" fill="#333333" p-id="12805" />
          </svg>
           文件夹名前添加序号 
          <el-tooltip transition :open-delay="500" placement="top-start">
            <div slot="content">
              <p style="margin-bottom: 4px">
                创建文件夹时，软件会在文件夹名前添加序号（如01视频标题、02视频标题等）
              </p>
              <p>
                以便在创建文件夹后仍能保持原视频的顺序。（根据文件夹排序）
              </p>
            </div>
            <i class="iconfont icon-xiangqing" />
          </el-tooltip>
        </p>
      </div>
      <el-switch v-model="createFolderAddIndex" size="medium" active-color="#51ae84" />
    </div>
    <div style="margin: 8px 0" />
    <el-checkbox-group v-model="downContentType">
      <el-checkbox label="封面" :key="'封面'">
        封面
      </el-checkbox>
      <el-checkbox label="NFO刮削" :key="'NFO刮削'">
        NFO刮削
      </el-checkbox>
      <el-checkbox label="XML弹幕" :key="'XML弹幕'">
        XML弹幕
      </el-checkbox>
      <el-checkbox label="ASS弹幕" :key="'ASS弹幕'">
        ASS弹幕
      </el-checkbox>
      <el-tooltip transition :open-delay="240" :disabled="user.state" placement="top-start">
        <div v-if="!(user.state)" slot="content">
          <p>
            此功能需
            <a style="cursor: pointer" @click="goLogin">
              登录
            </a>
          </p>
        </div>
        <el-checkbox label="SRT字幕" :disabled="!user.state" :key="'SRT字幕'">
          SRT字幕
        </el-checkbox>
      </el-tooltip>
      <br />
      <el-checkbox label="音频MP3" :key="'音频MP3'">
        音频 (mp3格式 | 需转换耗时)
      </el-checkbox>
      <el-checkbox label="音频" :key="'音频'">
        音频 (aac格式 | 默认不耗时)
      </el-checkbox>
      <br />
      <el-checkbox label="无声视频" :key="'无声视频'">
        无声视频
      </el-checkbox>
      <el-checkbox label="有声视频" :key="'有声视频'">
        有声视频
      </el-checkbox>
    </el-checkbox-group>
    <div style="margin: 10px 0" />
    <span slot="footer" class="dialog-footer">
      <b-button type="success" size="mini" round @click="pushAllTask">
        开始下载
      </b-button>
    </span>
  </el-dialog>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Dexie from 'dexie'
import Aria2 from 'aria2'
import { Button, Loading, MessageBox, RadioGroup } from 'element-ui'
import store from '../store'
// @restored:imports
import moment from 'moment'
import request from '../plugins/request'
import { shell } from '../plugins/electron'
import tipAudioSuccess from '@/assets/media/tip-success.mp3'
import tipAudioYes from '@/assets/media/tip-yes.mp3'
import tipAudioNo from '@/assets/media/no.mp3'
import tipAudioSaoma from '@/assets/media/tip-saoma.mp3'
import tipAudioHover from '@/assets/media/tip-hover.mp3'
import tipAudioClick from '@/assets/media/tip-click.mp3'
// @restored:module-decls
const { remote: Ai } = window.require("electron");

const { remote: xt } = window.require("electron");

const { spawn: St } = window.require("child_process");

const { remote: te } = window.require("electron");
const ee = te.require("fs");

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
var he = ue;

const qa = moment;

const { exec: Fa } = window.require("child_process");

const { remote: Ia } = window.require("electron");
const Na = Ia.require("fs").promises;
const Ya = Ia.require("path");

const { ipcRenderer: Wa } = window.require("electron");
const { remote: Ga } = window.require("electron");
const Ja = Ga.require("path");
const Oa = Ga.require("fs");

const { spawn: Ha } = window.require("child_process"); // eslint-disable-line no-unused-vars
// @restored:module-decls-end
// @restored:imports-end

async function ct(t) {
  return request.get(`https://api.bilibili.com/x/v1/dm/list.so?oid=${t}`);
}

async function dt(t) {
  return request.get(`https://api.bilibili.com/x/web-interface/view/detail?bvid=${t}`).then(t => t.data.data);
}

async function ut(t) {
  return request.get(t, {
    responseType: "arraybuffer"
  });
}

async function ht(t) {
  return request.get(`https:${t}`);
}

async function pt(t, e) {
  return request.get(t, {
    responseType: "arraybuffer",
    onDownloadProgress: e
  });
}

async function gt(t, e) {
  return request.get(`https://api.bilibili.com/x/player/playurl?avid=${t}&cid=${e}&qn=64&platform=html5&otype=json&high_quality=1`);
}

const Bt = new Audio(tipAudioNo);

const It = new Audio(tipAudioYes);

const Nt = new Audio(tipAudioClick);

const Yt = new Audio(tipAudioHover);

const Ft = new Audio(tipAudioSaoma);

const Lt = new Audio(tipAudioSuccess);

function jt(t, e = false) {
  try {
    if (e) {
      if (process.platform === "win32") {
        St("explorer", [t], {
          detached: true
        });
      }
      if (process.platform === "darwin") {
        St("open", [t]);
      }
    } else {
      xt.shell.showItemInFolder(t);
    }
  } catch (i) {}
}

function Tt(t) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(t);
  }
  {
    let e = document.createElement("textarea");
    e.value = t;
    e.style.position = "absolute";
    e.style.opacity = 0;
    e.style.left = "-999999px";
    e.style.top = "-999999px";
    document.body.appendChild(e);
    e.focus();
    e.select();
    return new Promise((t, i) => {
      if (document.execCommand("copy")) {
        t();
      } else {
        i();
      }
      e.remove();
    });
  }
}

function Pt(t) {
  return new Promise(e => setTimeout(e, t));
}

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

async function Rt() {
  let t = "";
  t = localStorage.getItem("defaultDownPath") ? localStorage.getItem("defaultDownPath") : xt.app.getPath("downloads");
  return xt.dialog.showOpenDialog({
    title: "选择下载目录",
    defaultPath: t,
    buttonLabel: "确定",
    properties: ["openDirectory", "createDirectory"]
  }).then(t => {
    if (!t.canceled && t.filePaths.length > 0) {
      return t.filePaths[0];
    }
  });
}

async function Qt() {
  const t = await xt.dialog.showOpenDialog({
    title: "选择下载记录文件",
    defaultPath: xt.app.getPath("desktop"),
    buttonLabel: "确定",
    properties: ["openFile"],
    filters: [{
      name: "BiliDown Export Files",
      extensions: ["bilidownexport"]
    }]
  });
  if (!t.canceled && t.filePaths.length > 0) {
    return t.filePaths[0];
  }
}

function Ut() {
  const t = Date.now();
  const e = Math.floor(Math.random() * 1000);
  const i = t * 1000 + e;
  return i.toString(24);
}

function Wt(t) {
  if (!t) {
    return "bilidown文件重命名" + Ut();
  }
  let e = t.replace(/[\\/:*?"<>|]/g, "");
  const i = 205;
  const a = new TextEncoder().encode(e);
  if (a.length > i) {
    const t = a.slice(0, i - 1);
    e = new TextDecoder().decode(t).trim();
  }
  e ||= "bilidown文件重命名" + Ut();
  return e;
}

function Jt(t = false) {
  const e = new Date();
  const i = e.getFullYear();
  const a = String(e.getMonth() + 1).padStart(2, "0");
  const s = String(e.getDate()).padStart(2, "0");
  if (t) {
    const t = String(e.getHours()).padStart(2, "0");
    const n = String(e.getMinutes()).padStart(2, "0");
    return `${i}-${a}-${s} ${t}:${n}`;
  }
  return `${i}-${a}-${s}`;
}

function Ot(t) {
  shell.openExternal(t);
}

function Ht(t) {
  const e = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = Number(t);
  let a = 0;
  while (i >= 1024 && a < e.length - 1) {
    i /= 1024;
    a++;
  }
  return i.toFixed(2) + " " + e[a];
}

function Zt(t) {
  const e = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = /^(\d+(\.\d+)?)\s*([a-zA-Z]+)$/;
  const a = t.match(i);
  if (!a) {
    throw new Error("Invalid file size format");
  }
  const s = parseFloat(a[1]);
  const n = a[3].toUpperCase();
  const o = e.findIndex(t => t.toUpperCase() === n);
  if (o === -1) {
    throw new Error("Unknown unit");
  }
  return Math.round(s * Math.pow(1024, o));
}

function _t(t, e, i, a, s) {
  let n = "";
  t.forEach((t, e) => {
    n += `    <${s}>${t.tag_name}</${s}>\n`;
  });
  n += `    <${s}>${e}</${s}>\n`;
  n += `    <${s}>${i}</${s}>\n`;
  n += `    <${s}>${a}</${s}>`;
  return n;
}


const ae = new Map([["127", ["8K 超高清", "杜比视界", "HDR 真彩色", "4K 超清", "1080P60 高帧率", "1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["126", ["杜比视界", "HDR 真彩色", "4K 超清", "1080P60 高帧率", "1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["125", ["HDR 真彩色", "4K 超清", "1080P60 高帧率", "1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["120", ["4K 超清", "1080P60 高帧率", "1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["116", ["1080P60 高帧率", "1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["112", ["1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["80", ["1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["74", ["720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["64", ["720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["32", ["480P 清晰", "360P 流畅", "240P 极速"]], ["16", ["360P 流畅", "240P 极速"]], ["6", ["240P 极速"]]]);

const se = new Map([["hi", ["Hi-Res无损", "杜比全景声", "192K", "132K", "64K"]], ["dubi", ["杜比全景声", "192K", "132K", "64K"]], ["192", ["192K", "132K", "64K"]], ["132", ["132K"]], ["64", ["64K"]]]);

function ne(t, e) {
  return new Promise((i, a) => {
    ee.rename(t, e, t => {
      if (t) {
        a(false);
      } else {
        i(true);
      }
    });
  });
}

async function Ne(t, e) {
  return request.get(`https://api.bilibili.com/x/player/playurl?cid=${e}&fourk=1&fnver=0&fnval=4048&bvid=${t}`).then(t => t.data);
}

function je(t) {
  switch (t) {
    case 6:
      return "240P 极速";
    case 16:
      return "360P 流畅";
    case 32:
      return "480P 清晰";
    case 64:
      return "720P 高清";
    case 74:
      return "720P60 高帧率";
    case 80:
      return "1080P 高清";
    case 112:
      return "1080P+ 高码率";
    case 116:
      return "1080P60 高帧率";
    case 120:
      return "4K 超清";
    case 125:
      return "HDR 真彩色";
    case 126:
      return "杜比视界";
    case 127:
      return "8K 超高清";
    default:
      return "未知Code";
  }
}

function Te(t) {
  switch (t) {
    case 30216:
      return "64K";
    case 30232:
      return "132K";
    case 30280:
      return "192K";
    case 30250:
      return "杜比全景声";
    case 30251:
      return "Hi-Res无损";
    default:
      return "未知Code";
  }
}

function si(t, e, i, a) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>\n<movie>\n    <plot>${t.View.desc}</plot>\n    <title>${e.title}</title>\n    <year>${e.pubdate}</year>\n    <mpaa>PG</mpaa>\n    <customrating>PG</customrating>\n    <countrycode>CN</countrycode>\n    <premiered>${e.pubdate}</premiered>\n    <release>${e.pubdate}</release>\n    <runtime>${e.formatDuration}</runtime>\n    <country>中国</country>\n    <id>${t.View.bvid}</id>\n    <num>${t.View.bvid}</num>\n${i}\n    <genre>https://www.bilibili.com/video/${e.bv}</genre>\n    <genre>cid:${e.cid}</genre>\n    <genre>aid:${e.aid}</genre>\n    <genre>${t.View.dimension.width}x${t.View.dimension.height}</genre>\n    <genre>${e.pubdate}</genre>\n${a}\n    <tag>https://www.bilibili.com/video/${e.bv}</tag>\n    <tag>cid:${e.cid}</tag>\n    <tag>aid:${e.aid}</tag>\n    <tag>1920x1080</tag>\n    <tag>${e.pubdata}</tag>\n    <actor>\n        <name>${t.Card.card.name}</name>\n        <type>Actor</type>\n    </actor>\n</movie>`;
}

const ci = {
  bv: "BV435cx1",
  cid: "1433223",
  upnn: "王子周棋洛",
  uid: "1608325226",
  title: "测试标题",
  aqn: "192K  mp4a",
  vqn: "1080P 高清  avc1",
  dd: "2024-11-07",
  "dd:YYYY": "2024",
  "dd:MM": "11",
  "dd:DD": "07",
  "dd:YYYYMMDD": "20241107",
  pd: "2024-06-20",
  "pd:YYYY": "2024",
  "pd:MM": "06",
  "pd:DD": "20",
  "pd:YYYYMMDD": "20240620",
  index: 1,
  "index:0": "0",
  "index:00": "00",
  "index:01": "01",
  v: Ai.app.getVersion()
};

function di(t) {
  let e = [];
  let i = false;
  let a = "";
  let s = 0;
  while (s < t.length) {
    const n = t[s];
    if (n === "%") {
      if (i) {
        if (ci.hasOwnProperty(a)) {
          e.push({
            type: "var",
            value: a
          });
        }
        i = false;
        a = "";
      } else {
        i = true;
      }
    } else if (i) {
      if (n === "%") {
        if (ci.hasOwnProperty(a)) {
          e.push({
            type: "var",
            value: a
          });
        }
        i = false;
        a = "";
      } else {
        a += n;
      }
    } else if (s === 0 || t[s - 1] === "%") {
      e.push({
        type: "text",
        value: mi(n)
      });
    } else {
      e[e.length - 1].value += mi(n);
    }
    s++;
  }
  if (a) {
    e.push({
      type: "text",
      value: mi(a)
    });
  }
  if (i && i === true && a === "" && e.length === 0) {
    e = [];
  }
  let n = e.filter(t => t.value !== "");
  if (n.length === 0) {
    n.push({
      type: "var",
      value: "title"
    });
  }
  n = gi(n);
  let o;
  let r = "";
  let A = "";
  n.forEach(t => {
    if (t.type === "var") {
      A += `%${t.value}%`;
      r += `<span style="color: var(--theme)">${ci[t.value]}</span>`;
    } else {
      A += t.value;
      r += t.value;
    }
  });
  o = t.length === 0 ? "<span style=\"color: #e6a23c\">请输入内容。</span>" : t.substring(0, 2) === "%%" ? "<span style=\"color: #f56c6c\">开头如果需要变量，使用%%可能会导致问题！建议使用单个%开始。</span>" : t.includes("%") && n.filter(t => t.type === "var").length === 0 ? "<span style=\"color: #f56c6c\">无效变量，请使用%内置变量名%来表示变量。</span" : A.length !== t.length ? `<span style="color: #e6a23c">建议优化为：${A}</span>` : "<a onclick=\"openExternalLink('https://zhouql.vip/bilidown/doc/bilidown-pc-rename.html')\">暂无建议，详细使用文档点我查看。</a>";
  return {
    resultArr: n,
    previewText: r,
    resultText: A,
    suggestText: o
  };
}

function mi(t) {
  return t.replace(/[\\/:*?"<>|]/g, "");
}

function gi(t) {
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

var zi = {
  playResX: 560,
  playResY: 420,
  fontlist: ["Microsoft YaHei UI", "Microsoft YaHei", "文泉驿正黑", "STHeitiSC", "黑体"],
  font_size: 1,
  r2ltime: 8,
  fixtime: 4,
  opacity: 0.6,
  space: 0,
  max_delay: 6,
  bottom: 50,
  use_canvas: null,
  debug: false
};

var Ri = zi.debug ? console.log.bind(console) : function () {};

function Qi(t) {
  var e = Number(t).toString(16).toUpperCase();
  return (Array(7).join("0") + e).slice(-6);
}

function Ui(t) {
  var e = Math.round((1 - t) * 255).toString(16).toUpperCase();
  return Array(3 - e.length).join("0") + e;
}

var Wi = Math.hypot ? Math.hypot.bind(Math) : function () {
  return Math.sqrt([0].concat(Array.apply(Array, arguments)).reduce(function (t, e) {
    return t + e * e;
  }));
};

var Gi = function () {
  function t() {
    var t = document.createElement("canvas");
    var e = t.getContext("2d");
    return function (t, i, a) {
      e.font = "bold " + a + "px " + t;
      return Math.ceil(e.measureText(i).width + zi.space);
    };
  }
  function e() {
    var t = document.createElement("div");
    t.setAttribute("style", ["all: unset", "top: -10000px", "left: -10000px", "width: auto", "height: auto", "position: absolute", ""].join(" !important; "));
    function e() {
      document.body.parentNode.appendChild(t);
    }
    if (document.body) {
      e();
    } else {
      document.addEventListener("DOMContentLoaded", e);
    }
    return function (e, i, a) {
      t.textContent = i;
      t.style.font = "bold " + a + "px " + e;
      return t.clientWidth + zi.space;
    };
  }
  if (zi.use_canvas === null && navigator.platform.match(/linux/i) && !navigator.userAgent.match(/chrome/i)) {
    zi.use_canvas = false;
  }
  Ri("use canvas: %o", zi.use_canvas !== false);
  if (zi.use_canvas === false) {
    return e();
  } else {
    return t();
  }
}();

function Ji(t) {
  var e = "The quick brown fox jumps over the lazy dog7531902468,.!-，。：！天地玄黄則近道矣";
  var i = ["monospace", "sans-serif", "sans", "Symbol", "Arial", "Comic Sans MS", "Fixed", "Terminal", "Times", "Times New Roman", "宋体", "黑体", "文泉驿正黑", "Microsoft YaHei"];
  function a(t, i) {
    var a = Gi(t, e, 72);
    var s = Gi(i + "," + t, e, 72);
    return a !== s;
  }
  function s(t) {
    var e = i.some(function (e) {
      return a(e, t);
    });
    Ri("font %s: %o", t, e);
    return e;
  }
  var n = t[t.length - 1];
  t = t.filter(s);
  Ri("fontlist: %o", t);
  return t[0] || n;
}

var Oi = function () {
  var t = false;
  return function () {
    if (!t) {
      t = true;
      Gi = Gi.bind(window, zi.font = Ji(zi.fontlist));
    }
  };
}();

function Hi(t, e) {
  var i = `[Script Info]\nTitle: ${e.title}\nOriginal Script: 根据 ${e.ori} 的弹幕信息，由 https://zhouql.vip/bilidown/ 生成\nScriptType: v4.00+\nCollisions: Normal\nPlayResX: ${zi.playResX}\nPlayResY: ${zi.playResY}\nTimer: 10.0000\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Fix,${zi.font},25,&H${Ui(zi.opacity)}FFFFFF,&H${Ui(zi.opacity)}FFFFFF,&H${Ui(zi.opacity)}000000,&H${Ui(zi.opacity)}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0\nStyle: R2L,${zi.font},25,&H${Ui(zi.opacity)}FFFFFF,&H${Ui(zi.opacity)}FFFFFF,&H${Ui(zi.opacity)}000000,&H${Ui(zi.opacity)}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
  function a(t, e) {
    t = "" + t;
    while (t.length < e) {
      t = "0" + t;
    }
    return t;
  }
  function s(t) {
    t = t * 100 ^ 0;
    var e = [[100, 2], [60, 2], [60, 2], [Infinity, 0]].map(function (e) {
      var i = t % e[0];
      t = (t - i) / e[0];
      return a(i, e[1]);
    }).reverse();
    return e.slice(0, -1).join(":") + "." + e[3];
  }
  var n = function () {
    function t(t) {
      var e = "";
      var i = t.color.split(/(..)/).filter(function (t) {
        return t;
      }).map(function (t) {
        return parseInt(t, 16);
      });
      if (t.color !== "FFFFFF") {
        e += "\\c&H" + t.color.split(/(..)/).reverse().join("");
      }
      var a = i[0] * 0.299 + i[1] * 0.587 + i[2] * 0.114 < 48;
      if (a) {
        e += "\\3c&HFFFFFF";
      }
      if (t.size !== 25) {
        e += "\\fs" + t.size;
      }
      return e;
    }
    function e(t) {
      return "\\move(" + [t.poss.x, t.poss.y, t.posd.x, t.posd.y].join(",") + ")";
    }
    function i(t) {
      return "\\pos(" + [t.poss.x, t.poss.y].join(",") + ")";
    }
    function a(e) {
      return function (i) {
        return e(i) + t(i);
      };
    }
    return {
      R2L: a(e),
      Fix: a(i)
    };
  }();
  function o(t) {
    return t.replace(/{/g, "｛").replace(/}/g, "｝").replace(/\r|\n/g, "");
  }
  function r(t) {
    return "Dialogue: " + [0, MessageBox, MessageBox, t.type, ",20,20,2,,"].join(",") + "{" + n[t.type](t) + "}" + Loading;
  }
  return i + t.map(r).filter(function (t) {
    return t;
  }).join("\n");
}

var Zi = function (t, e, i, a, s) {
  return function () {
    var n = [{
      p: -Infinity,
      m: 0,
      tf: Infinity,
      td: Infinity,
      b: false
    }, {
      p: e,
      m: Infinity,
      tf: Infinity,
      td: Infinity,
      b: false
    }, {
      p: e - i,
      m: e,
      tf: Infinity,
      td: Infinity,
      b: true
    }];
    function o(t, i, a, o) {
      var r = [];
      n.forEach(function (s) {
        if (!(s.m > e)) {
          var A = s.m;
          var l = A + t;
          var c = i;
          var d = a;
          n.forEach(function (t) {
            if (!(t.p >= l) && !(t.m <= A) && (!t.b || !o)) {
              c = Math.max(c, t.tf);
              d = Math.max(d, t.td);
            }
          });
          r.push({
            p: A,
            r: Math.max(c - i, d - a)
          });
        }
      });
      r.sort(function (t, e) {
        return t.p - e.p;
      });
      var A = s;
      r = r.filter(function (t) {
        return !(t.r >= A) && (A = t.r, true);
      });
      return r;
    }
    function r(t, e, i, a) {
      n.push({
        p: t,
        m: e,
        tf: i,
        td: a,
        b: false
      });
    }
    function A(t, e) {
      n = n.filter(function (i) {
        return i.tf > t || i.td > e;
      });
    }
    function l(t) {
      if (t.r > s) {
        return -Infinity;
      } else {
        return 1 - Wi(t.r / s, t.p / e) * Math.SQRT1_2;
      }
    }
    return function (e, i, s, n) {
      var c = t / (i + t) * a + e;
      Button;
      var d = Loading;
      if (!d.length) {
        return null;
      }
      var u = d.map(function (t) {
        return [l(t), t];
      });
      var h = u.reduce(function (t, e) {
        if (t[0] > e[0]) {
          return t;
        } else {
          return e;
        }
      })[1];
      var p = e + h.r;
      var m = i / (i + t) * a + p;
      var g = a + p;
      r(h.p, h.p + s, m, g);
      return {
        top: h.p,
        time: p
      };
    };
  };
}(zi.playResX, zi.playResY, zi.bottom, zi.r2ltime, zi.max_delay);

var Ki = function (t, e, i, a) {
  return function () {
    var s = [{
      p: -Infinity,
      m: 0,
      td: Infinity,
      b: false
    }, {
      p: t,
      m: Infinity,
      td: Infinity,
      b: false
    }, {
      p: t - e,
      m: t,
      td: Infinity,
      b: true
    }];
    function n(t, e, i, a) {
      var n = i;
      s.forEach(function (i) {
        if (!(i.p >= e) && !(i.m <= t) && (!i.b || !a)) {
          n = Math.max(n, i.td);
        }
      });
      return {
        r: n - i,
        p: t,
        m: e
      };
    }
    function o(e, i, a) {
      var o = [];
      s.forEach(function (s) {
        if (!(s.m > t)) {
          o.push(n(s.m, s.m + e, i, a));
        }
      });
      return o;
    }
    function r(t, e, i) {
      var a = [];
      s.forEach(function (s) {
        if (!(s.p < 0)) {
          a.push(n(s.p - t, s.p, e, i));
        }
      });
      return a;
    }
    function A(t, e, i) {
      s.push({
        p: t,
        m: e,
        td: i,
        b: false
      });
    }
    function l(t) {
      s = s.filter(function (e) {
        return e.td > t;
      });
    }
    function c(e, i) {
      if (e.r > a) {
        return -Infinity;
      }
      function s(e) {
        if (i) {
          return e;
        } else {
          return t - e;
        }
      }
      return 1 - (e.r / a * (31 / 32) + MessageBox / t * (1 / 32));
    }
    return function (t, e, a, s) {
      l(t);
      var n = (a ? o : r)(e, t, s);
      if (!n.length) {
        return null;
      }
      var d = n.map(function (t) {
        return [RadioGroup, t];
      });
      var u = d.reduce(function (t, e) {
        if (t[0] > e[0]) {
          return t;
        } else {
          return e;
        }
      })[1];
      Button;
      return {
        top: u.p,
        time: u.r + t
      };
    };
  };
}(zi.playResY, zi.bottom, zi.fixtime, zi.max_delay);

function Xi(t) {
  var e = Zi();
  var i = Ki();
  return t.sort(function (t, e) {
    return t.time - e.time;
  }).map(function (t) {
    var a = Math.round(t.size * zi.font_size);
    var s = Gi(t.text, a);
    switch (t.mode) {
      case "R2L":
        return function () {
          var i = e(t.time, s, a, t.bottom);
          if (i) {
            t.type = "R2L";
            t.stime = i.time;
            t.poss = {
              x: zi.playResX + s / 2,
              y: i.top + a
            };
            t.posd = {
              x: -s / 2,
              y: i.top + a
            };
            t.dtime = zi.r2ltime + t.stime;
            return t;
          } else {
            return null;
          }
        }();
      case "TOP":
      case "BOTTOM":
        return function (e) {
          var s = i(t.time, a, e, t.bottom);
          if (s) {
            t.type = "Fix";
            t.stime = s.time;
            t.posd = t.poss = {
              x: Math.round(zi.playResX / 2),
              y: s.top + a
            };
            t.dtime = zi.fixtime + t.stime;
            return t;
          } else {
            return null;
          }
        }(t.mode === "TOP");
      default:
        return null;
    }
  }).filter(function (t) {
    return t;
  }).sort(function (t, e) {
    return t.stime - e.stime;
  });
}

function _i(t) {
  var e = new DOMParser().parseFromString(t, "text/xml");
  return Array.apply(Array, e.querySelectorAll("d")).map(function (t) {
    var e = t.getAttribute("p").split(",");
    var i = t.textContent;
    return {
      text: i,
      time: Number(e[0]),
      mode: [undefined, "R2L", "R2L", "R2L", "BOTTOM", "TOP"][Number(e[1])],
      size: Number(e[2]),
      color: Qi(parseInt(e[3], 10) & 16777215),
      bottom: Number(e[5]) > 0
    };
  });
}

function $i(t) {
  t = t.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  return _i(t);
}

function ta(t, e) {
  Oi();
  var i = $i(e);
  return Hi(Xi(i), {
    title: document.title,
    ori: t
  });
}

const aa = window.require("fs").promises;

const sa = window.require("path");

class na {
  constructor(t = "localhost", e = 6800, i = false, a = "", s = "/jsonrpc") {
    this.host = t;
    this.port = e;
    this.secure = i;
    this.secret = a;
    this.path = s;
    this.version = "1.0.0";
    this.aria2 = null;
    this.connect();
  }
  connect() {
    this.aria2 = new Aria2({
      host: this.host,
      port: this.port,
      secure: this.secure,
      secret: this.secret,
      path: this.path
    });
    return this;
  }
  async getVersion() {
    if (this.aria2) {
      return this.aria2.call("getVersion").then(t => ({
        aria2Version: t.version,
        driverVersion: this.version
      }));
    }
  }
  async ensureDirExists(t) {
    try {
      await aa.access(t);
    } catch (e) {
      await aa.mkdir(t, {
        recursive: true
      });
      await aa.chmod(t, 493);
    }
  }
  async addTask(t, e, i) {
    try {
      i = sa.normalize(i);
      await this.ensureDirExists(i);
      if (!Array.isArray(t)) {
        t = [t];
      }
      return this.aria2.call("addUri", t, {
        dir: i,
        out: e,
        timeout: 15,
        continue: true,
        "--retry-wait": 1,
        "--max-tries": 1,
        "--min-split-size": "15M",
        split: 8
      });
    } catch (a) {
      throw a;
    }
  }
  async viewTaskDetails(t) {
    return this.aria2.call("tellStatus", t, ["gid", "totalLength", "completedLength", "downloadSpeed", "status", "files"]);
  }
  async viewTaskActive() {
    return this.aria2.call("tellActive", ["gid", "totalLength", "completedLength", "downloadSpeed", "status", "files"]);
  }
  async pauseAria2Task(t) {
    return this.aria2.call("forcePause", t);
  }
  async pauseAllAria2Task() {
    return this.aria2.call("pauseAll");
  }
  async restoreAria2Task(t) {
    return this.aria2.call("unpause", t);
  }
  async removeAria2Task(t) {
    return this.aria2.call("remove", t);
  }
  async clearAria2Task() {
    return this.aria2.call("purgeDownloadResult");
  }
}

const oa = {
  封面: 1,
  XML弹幕: 2,
  ASS弹幕: 3,
  SRT字幕: 4,
  NFO刮削: 5,
  音频: 6,
  "音频+": 7,
  无声视频: 8,
  有声视频: 9,
  音频MP3: 10,
  混流: 11,
  SUCCESS: 12
};

function ra(t) {
  return t.taskStack.sort((t, e) => oa[t] - oa[e]);
}

function Aa(t) {
  return t.taskStackCache.sort((t, e) => oa[t] - oa[e]);
}

const la = "pending";

const ca = "active";

const da = "paused";

const ua = "complete";

const ha = "error";

const pa = "waiting";

async function ma(t) {
  let e = "";
  for (let i = 0; i < t.length; i++) {
    const a = t[i];
    const s = ga(a.from);
    const n = ga(a.to);
    e += `${i + 1}\r\n`;
    e += `${s} --\x3e ${n}\r\n`;
    e += `${a.content}\r\n\r\n`;
  }
  return e;
}

function ga(t) {
  const e = Math.floor(t / 3600);
  const i = Math.floor(t % 3600 / 60);
  const a = Math.floor(t % 60);
  const s = Math.floor(t % 1 * 1000);
  return `${va(e)}:${va(i)}:${va(a)},${va(s, 3)}`;
}

function va(t, e = 2) {
  return t.toString().padStart(e, "0");
}


const La = new Dexie("downloadDatabase");

const Ea = 54;

async function ja() {
  return new Promise(async (t, e) => {
    try {
      const e = await za();
      const i = Ia.app.getPath("desktop");
      const a = `bilidown_export_${qa()().format("YYYY-MM-DD HHmmss")}.bilidownexport`;
      const s = await Ra(Ua(e, Ea), a, i);
      Qa(s);
      t();
    } catch (i) {
      e(i);
    }
  });
}

async function Ta(t) {
  return new Promise(async (e, i) => {
    let a;
    let s;
    let n;
    if (!t) {
      i("");
    }
    try {
      a = await Pa(t);
    } catch (o) {
      i("读取文件失败，请确认文件路径是否正确。");
    }
    try {
      s = Ua(a, Ea);
    } catch (o) {
      i("解密数据失败，请确认密钥是否正确。");
    }
    try {
      n = JSON.parse(s);
    } catch (o) {
      i("解析数据失败，请确认文件是否是bilidown导出的文件。");
    }
    try {
      if (n && n.downloaded && n.downloaded.length > 0) {
        n.downloaded.forEach(t => delete t.id);
        const t = await La.downloaded.toArray().then(t => t.map(t => t.vid));
        const i = n.downloaded.filter(e => !t.includes(e.vid));
        if (i.length > 0) {
          await La.downloaded.bulkPut(i, {
            allKeys: true
          });
          e(`总数 ${n.downloaded.length} / 去重数 ${n.downloaded.length - i.length} / 成功导入了 ${i.length} 条记录。`);
        } else {
          e("没有可导入的新数据，所有数据都已存在。");
        }
      } else {
        i("导入的数据为空，请确认文件是否是bilidown导出的文件。");
      }
    } catch (o) {
      i("导入数据失败，未知原因。");
    }
  });
}

async function Pa(t) {
  try {
    return await Na.readFile(t, "utf-8");
  } catch (e) {
    throw e;
  }
}

async function za() {
  const t = {};
  t.downloaded = await La.downloaded.toArray();
  return JSON.stringify(t, null, 2);
}

async function Ra(t, e, i) {
  const a = Ya.join(i, e);
  try {
    await Na.writeFile(a, t);
    return a;
  } catch (s) {
    throw s;
  }
}

function Qa(t) {
  if (process.platform === "win32") {
    Fa(`explorer /select,"${t}"`);
  } else if (process.platform === "darwin") {
    // macOS 没有 explorer；open -R 在 Finder 中定位该文件
    Fa(`open -R "${t}"`);
  }
}

function Ua(t, e = 748034) {
  return t.split("").map(t => String.fromCharCode(t.charCodeAt(0) ^ e)).join("");
}

// @restored:funcs
// vi / fi / pi / qi / Vi / yi / Mi / wi（重命名规则解析）
// 变量名 → 中文说明（原 bundle module 级 const vi）
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
  return t.replace(/[\/:*?"<>|]/g, "");
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
      w += `%${t.value}%`;
      if (t.value === "vtype") {
        u += '<span style="color: var(--theme)">单视频</span>';
        h += '<span style="color: var(--theme)">合集视频</span>';
        p += '<span style="color: var(--theme)">多集视频</span>';
        m += '<span style="color: var(--theme)">单视频</span>';
        g += '<span style="color: var(--theme)">合集视频</span>';
        v += '<span style="color: var(--theme)">多集视频</span>';
      } else {
        u += `<span style="color: var(--theme)">${vi[t.value]}</span>`;
        h += `<span style="color: var(--theme)">${vi[t.value]}</span>`;
        p += `<span style="color: var(--theme)">${vi[t.value]}</span>`;
        m += `<span style="color: var(--theme)">${vi[t.value]}</span>`;
        g += `<span style="color: var(--theme)">${vi[t.value]}</span>`;
        v += `<span style="color: var(--theme)">${vi[t.value]}</span>`;
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
        ? `<span style="color: #e6a23c">建议优化为：${w}</span>`
        : `<a onclick="openExternalLink('https://zhouql.vip/bilidown/doc/bilidown-pc-dynamic-folder.html')">暂无建议，详细使用文档点我查看。</a>`;
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
}

// Gt / Ma / Da / ba / Ca（生成器漏掉的 module 级定义）
// 文件名长度裁剪 + 非法字符清理（原 bundle module 级函数 Gt）
function Gt(t) {
  if (!t) return "bilidown文件夹重命名" + Ut();
  t = String(t);
  t = t.trim();
  t = t.replace(/[/\|:*?"<>]+/g, "");
  let e = t.replace(/.*$/g, "");
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
      this.hejiTitle = `bilidown系统重命名_合集_${Ut()}`;
    }
    this.fenpTitle = Gt(t["fenpTitle"]);
    if (!this.fenpTitle) {
      this.fenpTitle = `bilidown系统重命名_分集_${Ut()}`;
    }
    this.title = Gt(`${t["title"]}`);
    if (!this.title) {
      this.title = `bilidown系统重命名_${Ut()}`;
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
            const e = Gt(`${this.video["upname"]}-${this.video["uid"]}`);
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
        ? Ya.join(t, this.hejiTitle, `${this.index}${this.title}`)
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
        ? Ya.join(t, this.fenpTitle, `${this.index}${this.title}`)
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
        ? Ya.join(t, `${this.index}${this.title}`)
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
var Ba = xa;
// @restored:funcs-end
export default {
  name: "Download",
  data() {
    return {
      createFolder: true,
      createFolderAddIndex: false,
      version: Ga.app.getVersion(),
      loading: false,
      downDirectory: "",
      previewVideoVisible: false,
      previewVideoSrc: "",
      previewVideoTitle: "",
      downContentType: [],
      selectDownContentDialogVisible: false,
      activeName: "待下载",
      download: [],
      downloading: [],
      downloaded: [],
      pauseAll: false,
      aria2: null,
      aria2Available: true,
      coverStatus: "pending",
      musicStatus: "pending",
      nfoStatus: "pending",
      srtStatus: "pending",
      assStatus: "pending",
      xmlStatus: "pending",
      currentPage: 1,
      pageSize: 15,
      totalCount: 0
    };
  },
  beforeRouteEnter(t, e, i) {
    i(async t => {
      if (t.$route.query && t.$route.query.echo === "true") {
        t.loading = true;
        await t.echoDownload();
      }
      const e = new Map();
      t.download.forEach(t => e.set(t.cid, t));
      if (t.waitDown.length) {
        t.waitDown.forEach(t => e.set(t.cid, t));
        t.download = Array.from(e.values());
        t.$store.commit("updateWaitDown", t.download);
      }
      if (t.download.length) {
        t.activeName = "待下载";
      }
    });
  },
  beforeRouteLeave(t, e, i) {
    this.closeDialog();
    if (this.selectDownContentDialogVisible) {
      setTimeout(() => {
        setTimeout(() => i(), 10);
        this.selectDownContentDialogVisible = false;
      }, 250);
    } else if (this.previewVideoVisible) {
      setTimeout(() => {
        setTimeout(() => i(), 10);
        this.previewVideoVisible = false;
      }, 250);
    } else {
      i();
    }
  },
  async mounted() {
    await this.connectAria2();
    await this.getPagedItemsWithCount(1, this.pageSize);
    if (this.defaultDownPath) {
      this.downDirectory = this.defaultDownPath;
    } else if (localStorage.getItem("defaultDownPath")) {
      this.downDirectory = localStorage.getItem("defaultDownPath");
    } else {
      this.downDirectory = Ga.app.getPath("desktop");
    }
    const t = localStorage.getItem("createFolder");
    const e = localStorage.getItem("createFolderAddIndex");
    if (t) {
      this.createFolder = JSON.parse(t);
    } else {
      localStorage.setItem("createFolder", JSON.stringify(true));
      this.createFolder = true;
    }
    if (e) {
      this.createFolderAddIndex = JSON.parse(e);
    } else {
      localStorage.setItem("createFolderAddIndex", JSON.stringify(false));
      this.createFolderAddIndex = false;
    }
    Wa.on("aria2-exit", () => {
      if (this.downloading.length) {
        this.downloading.forEach(t => {
          this.errorHandler(t, "下载进程关闭。| 两秒后将退回待下载。");
        });
      }
      this.$router.push("download");
      this.$alert("下载进程已关闭，是否尝试重启下载进程？", "下载进程", {
        closeOnClickModal: false,
        confirmButtonText: "重启",
        customClass: "processExitAlert",
        callback: t => {
          if (t === "confirm") {
            $notify.loading1("正在尝试重启下载进程...");
            Wa.once("aria2-restart-status", async (t, e) => {
              if (e) {
                await Pt(2000);
                await this.connectAria2(true);
              }
            });
            Wa.send("restart-aria2");
          } else {
            $notify.warning("下载进程已关闭，请重启应用。", 5000);
          }
        }
      });
    });
    window.addEventListener("online", () => $notify.info("网络连接已恢复"));
    window.addEventListener("offline", async () => {
      if (this.getDownloadingCount() !== 0) {
        $notify.error("网络连接已断开，下载已暂停");
        await this.pauseAllTask();
      }
    });
    let i = setInterval(async () => {
      if (navigator.onLine) {
        if (!this.aria2Available) {
          clearInterval(i);
          return;
        }
        this.aria2Available = await this.checkAvailableAria2(this);
      }
    }, 30000);
  },
  methods: {
    clearDownloadedDialog() {
      this.$alert("确定清空已下载记录吗？", "警告", {
        showClose: true,
        confirmButtonText: "确定",
        customClass: "clearDownloadedAlert"
      }).then(() => {
        this.clearDownloadedRecords();
      }).catch(() => {});
    },
    async exportDB() {
      $notify.loading1("正在导出已下载记录，请等待...");
      await Pt(500);
      try {
        await ja();
        $notify("导出成功！");
      } catch (t) {
        $notify.error("导出失败！");
      }
    },
    async importDownloadedRecord() {
      Qt().then(async t => {
        if (t) {
          $notify.loading1("正在导入下载记录...");
          await Pt(1000);
          Ta(t).then(t => {
            $notify(t, 6000);
            this.getPagedItemsWithCount(1, this.pageSize);
          }).catch(t => {
            $notify.close();
            if (t) {
              $notify.error(t, 6000);
            }
          });
        }
      });
    },
    async handlerCurrentChange(t) {
      await this.getPagedItemsWithCount(t, this.pageSize);
      this.$nextTick(() => {
        this.$refs.downloadedUlDomRef.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
      });
    },
    async updateTotalCount() {
      this.totalCount = await he.downloaded.count();
    },
    async getPagedItemsWithCount(t, e) {
      await this.updateTotalCount();
      const i = (t - 1) * e;
      this.currentPage = t;
      this.downloaded = await he.downloaded.reverse().offset(i).limit(e).toArray();
    },
    initSaveTasksEvent() {
      Wa.once("save-tasks", async () => {
        try {
          const t = [...this.download];
          JSON.parse(JSON.stringify(this.downloading)).forEach(e => {
            e.tip = "";
            e.audioFullPath = "";
            e.videoFullPath = "";
            e.gid = "";
            e.isDownloading = false;
            e.status = la;
            e.totalLength = "";
            e.completedLength = "";
            e.speed = "";
            e.progress = "";
            e.paused = false;
            e.progressMB = "--/--";
            t.push(e);
          });
          await he.download.clear();
          await he.download.bulkAdd(t);
        } finally {
          Wa.send("tasks-saved");
        }
      });
    },
    goLogin() {
      this.selectDownContentDialogVisible = false;
      this.$router.push("/acount");
      zt("yes");
    },
    async echoDownload() {
      he.download.toArray().then(async t => {
        await Pt(600);
        this.$store.commit("updateWaitDown", t);
        this.download = t;
        await Pt(1000);
      }).finally(() => {
        this.loading = false;
      });
    },
    async pauseTask(t) {
      if (t.gid) {
        const e = await this.aria2.viewTaskDetails(t.gid);
        const {
          status: i
        } = e;
        if (i === ca) {
          await this.aria2.pauseAria2Task(t.gid);
        }
        t.status = da;
      }
      if (t.status !== la && t.isDownloading) {
        t.paused = true;
      }
    },
    restoreTask(t) {
      if (this.pauseAll) {
        $notify.warning("全部暂停中，不可恢复。");
      } else if (this.getDownloadingCount() < this.setting.maxDownCount) {
        t.paused = false;
        this.startDownload(t);
      }
    },
    async pauseAllTask() {
      this.pauseAll = true;
      for (const t of this.downloading) {
        if (t.status != la) {
          this.pauseTask(t);
        }
      }
    },
    restoreAllTask() {
      this.pauseAll = false;
      for (const t of this.downloading) {
        if (!(this.getDownloadingCount() < this.setting.maxDownCount)) {
          break;
        }
        t.paused = false;
        this.startDownload(t);
      }
    },
    async startDownload(t) {
      if (!t.isDownloading) {
        t.isDownloading = true;
        try {
          t.formatName = this.formatName(t);
          while (t.taskStack.length) {
            let e = t.taskStack.length !== 1 ? ra(t)[0] : t.taskStack[0];
            if (e === "封面") {
              const i = await this.coverDownloadTaskHandler(t);
              if (i !== ua) {
                return;
              }
              t.taskStack = t.taskStack.filter(t => t !== e);
              await Pt(100);
            }
            if (e === "XML弹幕") {
              const i = await this.xmlDanmuDownloadTaskHandler(t);
              if (i !== ua) {
                return;
              }
              t.taskStack = t.taskStack.filter(t => t !== e);
              await Pt(100);
            }
            if (e === "ASS弹幕") {
              const i = await this.assDanmuDownloadTaskHandler(t);
              if (i !== ua) {
                return;
              }
              t.taskStack = t.taskStack.filter(t => t !== e);
              await Pt(100);
            }
            if (e === "SRT字幕") {
              const i = await this.srtZimuDownloadTaskHandler(t);
              if (i !== ua) {
                return;
              }
              t.taskStack = t.taskStack.filter(t => t !== e);
              await Pt(100);
            }
            if (e === "NFO刮削") {
              const i = await this.nfoGuaxiaoDownloadTaskHandler(t);
              if (i !== ua) {
                return;
              }
              t.taskStack = t.taskStack.filter(t => t !== e);
              await Pt(100);
            }
            if (e === "音频") {
              const i = await this.audioDownloadTaskHandler(t);
              if (i !== ua) {
                return;
              }
              t.taskStack = t.taskStack.filter(t => t !== e);
              await Pt(500);
            }
            if (e === "音频+") {
              const i = await this.audioJiaDownloadTaskHandler(t);
              if (i !== ua) {
                return;
              }
              t.taskStack = t.taskStack.filter(t => t !== e);
            }
            if (e === "有声视频" || e === "无声视频") {
              const e = await this.videoDownloadTaskHandler(t);
              if (e !== ua) {
                return;
              }
              t.taskStack = t.taskStack.filter(t => t !== "有声视频" && t !== "无声视频");
              await Pt(500);
            }
            if (e === "音频MP3") {
              const i = await this.convertAAC2MP3Handler(t);
              if (i !== ua) {
                return;
              }
              t.taskStack = t.taskStack.filter(t => t !== e);
              await Pt(500);
            }
            if (e === "混流") {
              const i = await this.mixingTaskHandler(t);
              if (i !== ua) {
                return;
              }
              t.taskStack = t.taskStack.filter(t => t !== e);
            }
            if (e === "SUCCESS") {
              await this.completeHandler(t);
              t.isDownloading = false;
              t.taskStack = t.taskStack.filter(t => t !== e);
            }
          }
        } catch (e) {} finally {
          t.isDownloading = false;
        }
      }
    },
    async audioDownloadTaskHandler(t) {
      if (t.paused || this.pauseAll) {
        return da;
      }
      let e;
      e = t.gid ? await this.resumeDownMusicM4A(t) : await this.downAudioM4A(t);
      if (e === ua) {
        const e = t.aModel.toUpperCase().includes("HI-RES") ? "flac" : "aac";
        const i = `${t.formatName}.${e}`;
        const a = await this.fileExistPromise(Ja.join(t.downloadFolder, i));
        if (a) {
          const e = `bilidown检测到重名文件${Ut()}-${i}`;
          let a = Ja.join(t.downloadFolder, e);
          await ne(Ja.join(t.downloadFolder, t.audioFormatName), a);
          t.audioFullPath = a;
        } else {
          await ne(Ja.join(t.downloadFolder, t.audioFormatName), Ja.join(t.downloadFolder, i));
          t.audioFullPath = Ja.join(t.downloadFolder, i);
        }
      }
      return e;
    },
    async audioJiaDownloadTaskHandler(t) {
      if (t.paused || this.pauseAll) {
        return da;
      } else if (t.taskStackCache.includes("音频")) {
        return ua;
      } else if (t.gid) {
        return await this.resumeDownMusicM4A(t);
      } else {
        return await this.downAudioM4A(t);
      }
    },
    async videoDownloadTaskHandler(t) {
      if (t.gid) {
        return await this.resumeDownVideoM4A(t);
      } else {
        return await this.downVideoM4A(t);
      }
    },
    async convertAAC2MP3Handler(t) {
      const {
        audioFullPath: e
      } = t;
      t.tip = "格式转换中 aac -> mp3";
      t.status = ca;
      t.progressMB = "";
      t.speed = "";
      t.progress = 0;
      const i = await this.fileExistPromise(e);
      if (!i) {
        if (t.taskStackCache.includes("音频+") && !t.taskStack.includes("音频+")) {
          t.taskStack.unshift("音频+");
        }
        this.errorHandler(t, "音频不存在或已被删除。| 两秒后将退回待下载。");
        return ha;
      }
      const a = Ja.join(__dirname.replace(/electron\.asar(\\|\/)renderer/, "app.asar"), "..", "bin", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
      const s = `${t.formatName}.mp3`;
      const n = await this.fileExistPromise(Ja.join(t.downloadFolder, s));
      let o = "";
      o = n ? Ja.join(t.downloadFolder, `bilidown检测到重名文件-${Ut()}-${s}`) : Ja.join(t.downloadFolder, s);
      const r = `"${a}" -i "${e}" -q:a 0 -map a "${o}"`;
      let A = "";
      return this.runFFmpegCommand(r, e => {
        const i = e.toString();
        if (!A) {
          const t = i.match(/Duration:\s*(\d+:\d+:\d+\.\d+)/);
          if (t) {
            A = this.parseTime(t[1]);
          }
        }
        const a = i.match(/time=\s*(\d+:\d+:\d+\.\d+)/);
        if (a && A) {
          const e = this.parseTime(a[1]);
          let i = (e / A * 100).toFixed(2);
          t.progress = i;
          t.progressMB = i + "%";
        }
      }).then(async () => {
        t.status = ua;
        t.progressMB = "100%";
        await Pt(100);
        return ua;
      }).catch(() => {
        this.errorHandler(t, "格式转换出错 aac -> mp3。| 两秒后将退回待下载。");
        t.status = ha;
        return ha;
      });
    },
    parseTime(t) {
      const [e, i, a] = t.split(":").map(parseFloat);
      return e * 3600 + i * 60 + a;
    },
    async mixingTaskHandler(t) {
      const {
        audioFullPath: e,
        videoFullPath: i
      } = t;
      t.tip = "混流";
      const a = await this.fileExistPromise(e);
      const s = await this.fileExistPromise(i);
      if (!a) {
        if (t.taskStackCache.includes("音频+") && !t.taskStack.includes("音频+")) {
          t.taskStack.unshift("音频+");
        }
        this.errorHandler(t, "音频不存在或已被删除。| 两秒后将退回待下载。");
        return ha;
      }
      if (!s) {
        if (t.taskStackCache.includes("有声视频") && !t.taskStack.includes("有声视频")) {
          t.taskStack.unshift("有声视频");
        }
        this.errorHandler(t, "视频不存在或已被删除。| 两秒后将退回待下载。");
        return ha;
      }
      let n = Ja.join(t.downloadFolder, `${t.bv}-${t.cid}.mp4`);
      const o = Ja.join(__dirname.replace(/electron\.asar(\\|\/)renderer/, "app.asar"), "..", "bin", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
      let r = `"${o}" -y -i "${e}" -i "${i}" -strict -2 -acodec copy -vcodec copy -f mp4 "${n}"`;
      try {
        t.videoFullPath = n;
        await this.runFFmpegCommand(r);
        this.handleVideoFile(i, t);
        return ua;
      } catch (A) {
        this.errorHandler(t, "混流出错。| 两秒后将退回待下载。");
        return ha;
      }
    },
    async runFFmpegCommand(t, e = () => {}) {
      return new Promise((i, a) => {
        const s = Ha(t, {
          shell: true
        });
        process.on("exit", () => {
          s.kill();
          a(new Error("Process exited unexpectedly"));
        });
        s.stderr.on("data", e);
        s.on("close", t => {
          if (t !== 0) {
            a(new Error(t));
            s.kill();
          } else {
            i(t);
          }
        });
      });
    },
    handleVideoFile(t, e) {
      if (e.taskStackCache.includes("无声视频")) {
        ne(t, Ja.join(e.downloadFolder, `无声-${e.formatName}.mp4`));
      } else {
        this.fileDeletePromise(t);
      }
    },
    async checkDownState(t) {
      let e = 0;
      while (t.gid) {
        let a;
        try {
          a = await this.aria2.viewTaskDetails(t.gid);
        } catch (i) {
          e++;
          if (e > 6) {
            this.errorHandler(t, `${t.taskStack[0]}下载失败，请检查后重试。| 两秒后将退回待下载。`);
            return ha;
          }
          await Pt(250);
          continue;
        }
        const {
          completedLength: s,
          totalLength: n,
          downloadSpeed: o,
          status: r
        } = a;
        t.status = r;
        if (r === ca) {
          if (t.paused || this.pauseAll) {
            await this.pauseTask(t);
            t.status = da;
            return da;
          }
          t.speed = Ht(o) + "/s";
          t.totalLength = Ht(n);
          t.completedLength = Ht(s);
          t.progressMB = `${t.completedLength} / ${t.totalLength}`;
          if (s !== "0" && n !== "0") {
            t.progress = Number((s / n * 100).toFixed(2));
          }
        } else {
          if (r === ua) {
            t.gid = "";
            t.progress = 100;
            t.progressMB = `${t.totalLength} / ${t.totalLength}`;
            return r;
          }
          if (r === ha) {
            e++;
            if (e > 6) {
              this.errorHandler(t, `${t.taskStack[0]}下载失败，请检查后重试。| 两秒后将退回待下载。`);
              return r;
            }
          } else if (r !== pa) {
            return r;
          }
        }
        await Pt(300);
      }
    },
    closeDialog() {
      try {
        MessageBox.close();
      } catch (t) {}
    },
    errorHandler(t, e = "出错了，两秒后将退回待下载。") {
      t.tip = e;
      if (t.taskStackCache.includes("混流") && !t.taskStack.includes("混流")) {
        t.taskStack.unshift("混流");
      }
      setTimeout(() => {
        t.tip = e.split("|")[0];
        t.audioFullPath = "";
        t.videoFullPath = "";
        t.gid = "";
        t.isDownloading = false;
        t.totalLength = "";
        t.completedLength = "";
        t.speed = "";
        t.progress = "";
        t.paused = false;
        t.progressMB = "--/--";
        const i = new Set(this.download);
        if (!i.has(t)) {
          i.add(t);
          this.download.push(t);
        }
        t.status = la;
        this.downloading = this.downloading.filter(e => e !== t);
      }, 2000);
    },
    async completeHandler(t) {
      const e = JSON.parse(JSON.stringify(t));
      const {
        audioFullPath: i
      } = e;
      if (!e.taskStackCache.includes("混流") && e.taskStackCache.includes("无声视频")) {
        const t = await this.fileExistPromise(Ja.join(e.downloadFolder, `无声-${e.formatName}.mp4`));
        if (t) {
          await ne(e.videoFullPath, Ja.join(e.downloadFolder, `bilidown检测到重名文件-无声${Ut()}-${e.formatName}.mp4`));
        } else {
          await ne(e.videoFullPath, Ja.join(e.downloadFolder, `无声-${e.formatName}.mp4`));
        }
      } else if (e.taskStackCache.includes("有声视频")) {
        const t = await this.fileExistPromise(Ja.join(e.downloadFolder, `${e.formatName}.mp4`));
        if (t) {
          await ne(e.videoFullPath, Ja.join(e.downloadFolder, `bilidown检测到重名文件-${Ut()}-${e.formatName}.mp4`));
        } else {
          await ne(e.videoFullPath, Ja.join(e.downloadFolder, `${e.formatName}.mp4`));
        }
      }
      if (e.taskStackCache.includes("删除aac")) {
        await this.fileDeletePromise(i);
        e.taskStackCache = e.taskStackCache.filter(t => t !== "删除aac");
        e.taskStackCache.push("结果删除音频");
      }
      await Pt(150);
      let a = {
        vid: e.vid + "",
        uid: e.uid,
        upname: e.upname,
        title: e.title,
        pic: e.pic,
        bv: e.bv,
        path: e.downloadFolder,
        downDate: Jt(true),
        type: ""
      };
      const s = Aa(e);
      let n = " - [ ";
      let o = ["SUCCESS", "混流", "音频+", "结果删除音频", "删除aac"];
      if (e.taskStackCache.includes("结果删除音频")) {
        o.push("音频");
      }
      for (const A of s) {
        if (!o.includes(A)) {
          n += A === "音频" ? "音频AAC" : ` ${A} `;
        }
      }
      n += " ]";
      if (e.type == "单视频") {
        a.type = `单视频${n}`;
      } else if (e.type == "分集视频") {
        a.type = `分集视频${n}`;
        a.title = e.fenpTitle;
      } else if (e.type == "合集视频") {
        a.type = `合集视频${n}`;
        a.title = e.hejiTitle;
      } else {
        a.type = "未知";
      }
      he.downloaded.put(a).then(() => {
        this.getPagedItemsWithCount(1, this.pageSize);
      }).catch(Dexie.ConstraintError, async t => {
        if (t.name === "ConstraintError") {
          let t = await he.downloaded.get({
            vid: a.vid
          });
          if (t) {
            Object.assign(t, a);
            await he.downloaded.put(t);
            await this.getPagedItemsWithCount(1, this.pageSize);
          }
        }
      });
      if (e.status !== la) {
        await this.downCompleteClearFiles(e);
      }
      zt("success");
      e.isDownloading = false;
      const r = this.downloading.indexOf(t);
      if (r !== -1) {
        this.downloading.splice(r, 1);
      }
      if (this.downloading.length === 0) {
        this.activeName = "已下载";
        if (this.download.length) {
          return;
        }
        if (!this.setting.shutdown) {
          return;
        }
        this.$emit("shutdown");
      }
    },
    getDownloadingCount() {
      return this.downloading.filter(t => t.isDownloading === true).length;
    },
    async downloadLoop() {
      if (this.pauseAll || !this.downloading.length) {
        return;
      }
      const t = await this.checkAvailableAria2(this);
      this.aria2Available = t;
      if (!t) {
        if (this.$route.name === "download") {
          $notify.error("下载进程已关闭，请重启软件。");
        }
        return;
      }
      let e = "";
      for (let i = 0; i < this.downloading.length; i++) {
        e = this.downloading[i].status;
        if (e !== ca && !this.downloading[i].isDownloading && !this.downloading[i].paused) {
          this.downloading[i].status = ca;
          if (this.pauseAll || !(this.getDownloadingCount() < this.setting.maxDownCount)) {
            this.downloading[i].status = e;
            return;
          }
          this.startDownload(this.downloading[i]);
          await Pt(50);
        }
      }
    },
    async resumeDownMusicM4A(t) {
      const e = await this.aria2.viewTaskDetails(t.gid);
      const {
        status: i
      } = e;
      if (i == da) {
        await this.aria2.restoreAria2Task(t.gid);
        return this.checkDownState(t);
      }
      if (i == ua) {
        t.gid = "";
        t.progress = 100;
        t.progressMB = `${t.totalLength} / ${t.totalLength}`;
      }
      return i;
    },
    async downAudioM4A(t) {
      await this.updateAudioVideoDownLink(t, 3);
      const e = t.aModel.toUpperCase().includes("HI-RES") ? "flac" : "aac";
      t.audioFormatName = `${t.bv}-${t.cid}-${t.aModel.replace("|", "")}-audio.${e}`;
      t.audioFullPath = Ja.join(t.downloadFolder, t.audioFormatName);
      const i = await this.aria2.addTask(t.audio, t.audioFormatName, t.downloadFolder);
      if (i) {
        t.gid = i;
        t.tip = "音频";
      }
      return await this.checkDownState(t);
    },
    async resumeDownVideoM4A(t) {
      const e = await this.aria2.viewTaskDetails(t.gid);
      const {
        status: i
      } = e;
      if (i == da) {
        await this.aria2.restoreAria2Task(t.gid);
        return this.checkDownState(t);
      }
      if (i == ua) {
        t.gid = "";
        t.progress = 100;
        t.progressMB = `${t.totalLength} / ${t.totalLength}`;
      }
      return i;
    },
    async downVideoM4A(t) {
      await this.updateAudioVideoDownLink(t, 3);
      if (t.taskStackCache.includes("音频") || t.taskStackCache.includes("音频+")) {
        t.videoFormatName = `${t.bv}-${t.cid}-${t.vModel.replace("|", "")}-video.m4s`;
      } else {
        t.videoFormatName = `${t.bv}-${t.cid}-${t.vModel.replace("|", "")}-video.mp4`;
      }
      t.videoFullPath = Ja.join(t.downloadFolder, t.videoFormatName);
      const e = await this.aria2.addTask(t.video, t.videoFormatName, t.downloadFolder);
      if (e) {
        t.gid = e;
        t.tip = "视频";
        t.progressMB = "--/--";
        t.progress = 0;
      }
      return this.checkDownState(t);
    },
    async pushAllTask() {
      if (this.downContentType.length) {
        for (const t of this.download) {
          this.generateFolderPath(t, this.downContentType);
          t.taskStack = [...this.downContentType];
          t.taskStackCache = [...this.downContentType];
          if (this.downContentType.includes("音频MP3") && !this.downContentType.includes("音频")) {
            t.taskStack.push("音频");
            t.taskStackCache.push("音频");
            t.taskStackCache.push("删除aac");
          }
          if (!t.audio.length && this.downContentType.includes("音频")) {
            const e = t.taskStack.indexOf("音频");
            if (e !== -1) {
              t.taskStack.splice(e, 1);
              t.taskStackCache.splice(e, 1);
            }
          } else if (t.audio.length && this.downContentType.includes("有声视频") && !this.downContentType.includes("音频")) {
            t.taskStack.push("音频+");
            t.taskStackCache.push("音频+");
            t.taskStack.push("混流");
            t.taskStackCache.push("混流");
          } else if (t.audio.length && this.downContentType.includes("有声视频")) {
            t.taskStack.push("混流");
            t.taskStackCache.push("混流");
          }
          t.taskStack.push("SUCCESS");
          t.taskStackCache.push("SUCCESS");
          this.downloading.push(JSON.parse(JSON.stringify(t)));
        }
        this.download = [];
        this.$store.commit("updateWaitDown", []);
        this.activeName = "下载中";
        this.pauseAll &&= false;
        this.downContentType = [];
        this.selectDownContentDialogVisible = false;
      } else {
        $notify.warning("至少选择一个分类");
      }
    },
    downAllTask() {
      for (const t of this.download) {
        this.generateFolderPath(t, ["视频"]);
        t.taskStack = [];
        t.taskStackCache = [];
        if (t.audio.length) {
          t.taskStack.push("音频+");
          t.taskStackCache.push("音频+");
          t.taskStack.push("混流");
          t.taskStackCache.push("混流");
        }
        t.taskStack.push("有声视频");
        t.taskStackCache.push("有声视频");
        t.taskStack.push("SUCCESS");
        t.taskStackCache.push("SUCCESS");
        this.downloading.push(JSON.parse(JSON.stringify(t)));
      }
      this.download = [];
      this.$store.commit("updateWaitDown", []);
      this.activeName = "下载中";
      this.pauseAll &&= false;
    },
    addDownTask(t) {
      if (this.download.length === 1) {
        this.activeName = "下载中";
      }
      t.taskStack = [];
      t.taskStackCache = [];
      if (t.audio.length) {
        t.taskStack.push("音频+");
        t.taskStackCache.push("音频+");
        t.taskStack.push("混流");
        t.taskStackCache.push("混流");
      }
      t.taskStack.push("有声视频");
      t.taskStackCache.push("有声视频");
      t.taskStack.push("SUCCESS");
      t.taskStackCache.push("SUCCESS");
      this.generateFolderPath(t, ["视频"]);
      this.downloading.push(JSON.parse(JSON.stringify(t)));
      this.download = this.download.filter(e => e !== t);
      this.$store.commit("updateWaitDown", this.download);
    },
    async connectAria2(t = false) {
      Wa.send("getAria2Port");
      Wa.once("Aria2Port", async (e, i) => {
        this.aria2 = Object.freeze(new na("localhost", i, false, "zhouql", "/jsonrpc"));
        if (t) {
          if (i) {
            $notify("下载进程重启成功！");
          } else {
            $notify.error("下载进程重启失败，请重启软件。", 5000);
          }
        }
      });
    },
    async checkAvailableAria2(t) {
      return !!t.aria2 && t.aria2.getVersion().then(t => true).catch(t => false);
    },
    selectCacheDownPath() {
      Rt().then(t => {
        if (t && t != this.downDirectory) {
          this.downDirectory = t;
          $notify.success(`存储被临时修改至：${t}`, 4500);
        }
      });
    },
    removeDownloadTask(t) {
      this.download.splice(t, 1);
      this.$store.commit("updateWaitDown", this.download);
    },
    async removeAllDownloadingTask() {
      await this.aria2.pauseAllAria2Task();
      for (const t of this.downloading) {
        if (t.isDownloading) {
          await this.pauseTask(t);
        }
      }
      this.downloading = [];
    },
    async removeDownloadingTask(t) {
      if (t.isDownloading) {
        await this.pauseTask(t);
      }
      const e = this.downloading.indexOf(t);
      if (e != -1) {
        this.downloading.splice(e, 1);
      }
    },
    async downCompleteClearFiles(t) {
      const e = ["-video.m4s", "-video.mp4.aria2", "-video.m4s.aria2", "-audio.aac", "-audio.flac", "-audio.aac.aria2", "-audio.flac.aria2"];
      for (const i of e) {
        if (t.aModel) {
          await this.fileDeletePromise(Ja.join(t.downloadFolder, `${t.bv}-${t.cid}-${t.aModel.replace("|", "")}${i}`));
        }
        await this.fileDeletePromise(Ja.join(t.downloadFolder, `${t.bv}-${t.cid}-${t.vModel.replace("|", "")}${i}`));
      }
    },
    generateFolderPath(t, e) {
      const i = Ba[t.type];
      if (i) {
        t.downloadFolder = new i(t, this.downDirectory, e).generateFolderName();
      }
    },
    removeAllTack() {
      this.download = [];
      this.$store.commit("updateWaitDown", this.download);
    },
    async updateAudioVideoDownLink(t, e = 3) {
      if (!(e <= 0)) {
        try {
          const e = await Ne(t.bv, t.cid);
          const i = e.data;
          let a = [];
          let s = [];
          const n = {
            av01: "AV1",
            avc1: "AVC",
            hev1: "HEVC"
          };
          i.dash.video.forEach(e => {
            const i = e.codecs.split(".")[0];
            const a = n[i] || i;
            s.push({
              qnCode: e.id,
              codecs: e.codecs.split(".")[0],
              qnDesc: je(e.id) + " | " + a,
              link: e.backupUrl && e.backupUrl.length ? e.backupUrl.concat(e.baseUrl) : e.baseUrl,
              size: Ht(e.bandwidth * t.duration / 8)
            });
          });
          if (i.dash.flac && i.dash.flac.audio) {
            let e = i.dash.flac.audio;
            a.push({
              qnCode: e.id,
              qnDesc: Te(e.id) + " | " + e.codecs.substring(0, 4),
              codecs: e.codecs,
              link: e.backupUrl && e.backupUrl.length ? e.backupUrl.concat(e.baseUrl) : e.baseUrl,
              size: Ht(e.bandwidth * t.duration / 8)
            });
          }
          if (i.dash.dolby && i.dash.dolby.audio) {
            i.dash.dolby.audio.forEach(e => {
              a.push({
                qnCode: e.id,
                qnDesc: Te(e.id) + " | " + e.codecs.substring(0, 4),
                codecs: e.codecs,
                link: e.backupUrl && e.backupUrl.length ? e.backupUrl.concat(e.baseUrl) : e.baseUrl,
                size: Ht(e.bandwidth * t.duration / 8)
              });
            });
          }
          if (i.dash.audio != null) {
            i.dash.audio.forEach(e => {
              a.push({
                qnCode: e.id,
                qnDesc: Te(e.id) + " | " + e.codecs.substring(0, 4),
                codecs: e.codecs,
                link: e.backupUrl && e.backupUrl.length ? e.backupUrl.concat(e.baseUrl) : e.baseUrl,
                size: Ht(e.bandwidth * t.duration / 8)
              });
            });
          }
          t.vmap = s;
          s.forEach(e => {
            if (e.qnDesc == t.vModel) {
              t.video = e.link;
            }
          });
          t.amap = a;
          a.forEach(e => {
            if (e.qnDesc == t.aModel) {
              t.audio = e.link;
            }
          });
        } catch (i) {
          await this.updateAudioVideoDownLink(t, e - 1);
        }
      }
    },
    handlerClose() {
      if (this.$refs.plyrPlayer) {
        this.$refs.plyrPlayer.player.pause();
      }
    },
    qnChange(t, e) {
      const i = t === "audio" ? e.amap : e.vmap;
      const a = t === "audio" ? e.aModel : e.vModel;
      const s = t === "audio" ? "asize" : "vsize";
      for (const [n, o] of Object.entries(i)) {
        if (o.qnDesc == a) {
          e[s] = o.size;
          e[t] = o.link;
          return;
        }
      }
    },
    formatName(t, e = true, i = true) {
      let a = "";
      let s = false;
      this.renameRuleArray.forEach(n => {
        const o = n.value;
        if (n.type === "var") {
          s = false;
          switch (o) {
            case "bv":
              a += `${t.bv}`;
              break;
            case "cid":
              a += `${t.cid}`;
              break;
            case "upnn":
              const n = Wt(t.upname);
              if (n) {
                a += `${t.upname}`;
              }
              break;
            case "uid":
              a += `${t.uid}`;
              break;
            case "title":
              a += `${t.title}`;
              break;
            case "aqn":
              if (e) {
                a += `${t.aModel.replace(/\|/g, "")}`;
              }
              break;
            case "vqn":
              if (i) {
                a += `${t.vModel.replace(/\|/g, "")}`;
              }
              break;
            case "dd":
              a += `${qa()().format("YYYY-MM-DD")}`;
              break;
            case "dd:YYYY":
              a += `${qa()().format("YYYY")}`;
              break;
            case "dd:MM":
              a += `${qa()().format("MM")}`;
              break;
            case "dd:DD":
              a += `${qa()().format("DD")}`;
              break;
            case "dd:YYYYMMDD":
              a += `${qa()().format("YYYYMMDD")}`;
              break;
            case "pd":
              a += `${t.pubdate}`;
              break;
            case "pd:YYYY":
              a += qa()(t.pubdate).format("YYYY");
              break;
            case "pd:MM":
              a += qa()(t.pubdate).format("MM");
              break;
            case "pd:DD":
              a += qa()(t.pubdate).format("DD");
              break;
            case "pd:YYYYMMDD":
              a += qa()(t.pubdate).format("YYYYMMDD");
              break;
            case "index":
              if (t.type !== "单视频") {
                a += `${t.index}`;
              } else {
                s = true;
              }
              break;
            case "index:0":
              if (t.type !== "单视频") {
                a += "" + (t.index - 1);
              } else {
                s = true;
              }
              break;
            case "index:00":
              if (t.type !== "单视频") {
                let e = t.index < 11 ? String(t.index - 1).padStart(2, "0") : t.index - 1;
                a += `${e}`;
              } else {
                s = true;
              }
              break;
            case "index:01":
              if (t.type !== "单视频") {
                let e = t.index < 10 ? String(t.index).padStart(2, "0") : t.index;
                a += `${e}`;
              } else {
                s = true;
              }
              break;
            case "v":
              a += `${this.version}`;
              break;
          }
        } else if (!s) {
          a += `${o}`;
        }
      });
      return Wt(a);
    },
    async previewVideo(t) {
      try {
        this.previewVideoTitle = `预览 | ${t.title}`;
        const e = await gt(t.aid, t.cid);
        if (e.status === 200) {
          this.previewVideoSrc = e.data.data.durl[0].url;
          this.previewVideoVisible = true;
        } else {
          $notify.error("请求出错");
        }
      } catch (e) {
        $notify.error(e.message);
      }
    },
    copyBV(t) {
      Tt(t);
    },
    async openDownFolder(t) {
      const e = await this.fileExistPromise(t);
      if (e) {
        jt(t, true);
      } else {
        $notify.error("下载内容不存在或已被删除");
      }
    },
    async deleteDownloadedRecords(t) {
      he.downloaded.delete(t.id).then(async () => {
        await this.updateTotalCount();
        const t = (await this.getPageItemCount(this.currentPage)) === 0;
        if (t && this.currentPage > 1) {
          this.currentPage = this.currentPage - 1;
        }
        await this.getPagedItemsWithCount(this.currentPage, this.pageSize);
      });
    },
    async getPageItemCount(t) {
      const e = (t - 1) * this.pageSize;
      const i = await he.downloaded.reverse().offset(e).limit(this.pageSize).toArray();
      return i.length;
    },
    async clearDownloadedRecords() {
      $notify.loading1("正在清空已下载记录...");
      await Pt(1000);
      await he.downloaded.clear();
      await this.getPagedItemsWithCount(1, this.pageSize);
      this.downloaded = [];
      $notify("下载记录已清空");
    },
    openVideoLinkOnBrowser(t) {
      Ot(`https://www.bilibili.com/video/${t}`);
    },
    openUpPageOnBrowser(t) {
      Ot(`https://space.bilibili.com/${t}`);
    },
    selectDefaultVideoQnBySystem(t) {
      let e;
      let i;
      const a = ae.get(this.setting.videoQn);
      let s = [];
      for (let [n, o] of t.entries()) {
        const t = o.codecs;
        if (a.includes(o.qnDesc.split("|")[0].trim())) {
          if ((!this.defaultVideoEncoding || t !== this.defaultVideoEncoding) && (!this.remainVideoEncoding || !this.remainVideoEncoding.includes(t))) {
            e = o.qnDesc;
            i = n;
            break;
          }
          if (this.defaultVideoEncoding && t === this.defaultVideoEncoding) {
            e = o.qnDesc;
            i = n;
            break;
          }
          if (this.remainVideoEncoding && this.remainVideoEncoding.includes(t)) {
            s.push({
              videoDesc: o.qnDesc,
              videoIndex: n
            });
          }
        }
      }
      if (!e && !i && !!s.length) {
        e = s[0].videoDesc;
        i = s[0].videoIndex;
      }
      return {
        video: {
          videoDesc: e,
          videoIndex: i
        }
      };
    },
    selectDefaultAudioQnBySystem(t) {
      let e;
      let i;
      const a = se.get(this.setting.audioQn);
      for (let [s, n] of t.entries()) {
        if (a.includes(n.qnDesc.split("|")[0].trim())) {
          e = n.qnDesc;
          i = s;
          break;
        }
      }
      return {
        audio: {
          audioDesc: e,
          audioIndex: i
        }
      };
    },
    async coverDownloadTaskHandler(t) {
      try {
        if (t.paused || this.pauseAll) {
          t.status = da;
          return da;
        }
        t.tip = "封面";
        t.coverFormatName = `${t.formatName}.jpg`;
        if (t.pic) {
          const e = t.pic.split("@")[0];
          if (e) {
            const i = await ut(e);
            if (i && i.data) {
              await Oa.promises.mkdir(t.downloadFolder, {
                recursive: true
              });
              const e = Ja.join(t.downloadFolder, t.coverFormatName);
              await Oa.promises.writeFile(e, Buffer.from(i.data));
            }
          }
        }
        return ua;
      } catch (e) {
        return ua;
      }
    },
    async xmlDanmuDownloadTaskHandler(t) {
      try {
        if (t.paused || this.pauseAll) {
          t.status = da;
          return da;
        }
        t.tip = "xml弹幕";
        t.xmlFormatName = `${t.formatName}.xml`;
        if (t.cid) {
          const e = await ct(t.cid);
          if (e && e.data) {
            await Oa.promises.mkdir(t.downloadFolder, {
              recursive: true
            });
            const i = Ja.join(t.downloadFolder, t.xmlFormatName);
            await Oa.promises.writeFile(i, Buffer.from(e.data));
          }
        }
        return ua;
      } catch (e) {
        return ua;
      }
    },
    async assDanmuDownloadTaskHandler(t) {
      try {
        if (t.paused || this.pauseAll) {
          t.status = da;
          return da;
        }
        t.tip = "ass弹幕";
        t.assFormatName = `${t.formatName}.ass`;
        if (t.cid) {
          const e = await ct(t.cid);
          if (e && e.data) {
            let i = e.data.replace(/(?:[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, "");
            const a = ta(t.title, i);
            if (a) {
              await Oa.promises.mkdir(t.downloadFolder, {
                recursive: true
              });
              const e = Ja.join(t.downloadFolder, t.assFormatName);
              await Oa.promises.writeFile(e, Buffer.from(a));
            }
          }
        }
        return ua;
      } catch (e) {
        return ua;
      }
    },
    async srtZimuDownloadTaskHandler(t) {
      try {
        if (t.paused || this.pauseAll) {
          t.status = da;
          return da;
        }
        t.tip = "srt字幕";
        t.srtFormatName = `${t.formatName}.srt`;
        if (t.zimu.length) {
          for (const e of t.zimu) {
            const i = await ht(e.src);
            if (i.data && i.data.body) {
              const a = await ma(i.data.body);
              if (a) {
                t.tip = e.desc;
                t.srtFormatName = `${t.formatName} ${e.desc}.srt`;
                await Oa.promises.mkdir(t.downloadFolder, {
                  recursive: true
                });
                const i = Ja.join(t.downloadFolder, t.srtFormatName);
                await Oa.promises.writeFile(i, Buffer.from(a));
              }
            }
          }
        }
        return ua;
      } catch (e) {
        return ua;
      }
    },
    async nfoGuaxiaoDownloadTaskHandler(t) {
      try {
        if (t.paused || this.pauseAll) {
          t.status = da;
          return da;
        }
        t.tip = "nfo刮削";
        t.guaxiaoFormatName = `${t.formatName}.nfo`;
        const e = await dt(t.bv);
        const i = _t(e.Tags, e.View.title, e.View.tname, e.Card.card.name, "tag");
        const a = _t(e.Tags, e.View.title, e.View.tname, e.Card.card.name, "genre");
        const s = si(e, t, a, i);
        await Oa.promises.mkdir(t.downloadFolder, {
          recursive: true
        });
        const n = Ja.join(t.downloadFolder, t.guaxiaoFormatName);
        await Oa.promises.writeFile(n, Buffer.from(s));
        return ua;
      } catch (e) {
        return ua;
      }
    },
    async saveCover(t) {
      if (t.pic) {
        if (this.coverStatus === "pending") {
          try {
            this.coverStatus = "active";
            let e = await ut(t.pic.split("@")[0]);
            const i = await Ga.dialog.showSaveDialog({
              title: "保存封面",
              defaultPath: this.formatName(t, false, false),
              filters: [{
                name: "Images",
                extensions: ["jpg", "jpeg", "png", "gif"]
              }, {
                name: "All Files",
                extensions: ["*"]
              }]
            });
            if (!i.canceled) {
              await Oa.promises.writeFile(i.filePath, Buffer.from(e.data));
              $notify.success(`封面已保存 ${i.filePath}`);
            }
          } catch (e) {
            $notify.error("出错了，试试点击自定义批量按钮下载。");
          } finally {
            this.coverStatus = "pending";
          }
        }
      } else {
        $notify.error("没发现封面");
      }
    },
    async saveXML(t) {
      if (this.xmlStatus === "pending") {
        try {
          this.xmlStatus = "active";
          const e = await ct(t.cid);
          const i = await Ga.dialog.showSaveDialog({
            title: "保存XML弹幕",
            defaultPath: this.formatName(t),
            filters: [{
              name: "Xml",
              extensions: ["xml"]
            }, {
              name: "All Files",
              extensions: ["*"]
            }]
          });
          if (!i.canceled) {
            await Oa.promises.writeFile(i.filePath, e.data);
            $notify.success(`XML弹幕已保存 ${i.filePath}`);
          }
        } catch (e) {
          $notify.error("出错了，试试点击自定义批量按钮下载。");
        } finally {
          this.xmlStatus = "pending";
        }
      }
    },
    async saveASS(t) {
      if (this.assStatus === "pending") {
        try {
          this.assStatus = "active";
          const e = await ct(t.cid);
          let i = e.data.replace(/(?:[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, "");
          const a = ta(t.title, i);
          const s = await Ga.dialog.showSaveDialog({
            title: "保存ASS弹幕",
            defaultPath: this.formatName(t),
            filters: [{
              name: "Ass",
              extensions: ["ass"]
            }, {
              name: "All Files",
              extensions: ["*"]
            }]
          });
          if (!s.canceled) {
            await Oa.promises.writeFile(s.filePath, a);
            $notify.success(`ASS弹幕已保存 ${s.filePath}`);
          }
        } catch (e) {
          $notify.error("出错了，试试点击自定义批量按钮下载。");
        } finally {
          this.assStatus = "pending";
        }
      }
    },
    async saveNfo(t) {
      if (this.nfoStatus === "pending") {
        try {
          this.nfoStatus = "active";
          const e = await dt(t.bv);
          const i = _t(e.Tags, e.View.title, e.View.tname, e.Card.card.name, "tag");
          const a = _t(e.Tags, e.View.title, e.View.tname, e.Card.card.name, "genre");
          const s = si(e, t, a, i);
          const n = await Ga.dialog.showSaveDialog({
            title: "保存NFO刮削",
            defaultPath: this.formatName(t, false, false),
            filters: [{
              name: "Nfo",
              extensions: ["nfo"]
            }, {
              name: "All Files",
              extensions: ["*"]
            }]
          });
          if (!n.canceled) {
            await Oa.promises.writeFile(n.filePath, s);
            $notify.success(`NFO刮削已保存 ${n.filePath}`);
          }
        } catch (e) {
          $notify.error("出错了，试试点击自定义批量按钮下载。");
        } finally {
          this.nfoStatus = "pending";
        }
      }
    },
    async saveAAC(t) {
      if (this.musicStatus === "pending") {
        try {
          this.musicStatus = "active";
          if (t.audio.length) {
            if (t.asize !== 0 && Zt(t.asize) > 31457280) {
              $notify.info("音频较大，推荐使用上方按钮“自定义批量”进行下载。", 5000);
              return;
            }
            const e = await pt(t.audio[0], t => {
              if (this.$route.name === "download") {
                $notify.info(`音频已下载 ${Math.round(t.loaded / t.total * 100)}%`);
              }
            });
            const i = t.aModel.toUpperCase().includes("HI-RES") ? "flac" : "aac";
            const a = await Ga.dialog.showSaveDialog({
              title: "保存音频",
              defaultPath: this.formatName(t, false, false),
              filters: [{
                name: `${i.toUpperCase()}`,
                extensions: [`${i}`]
              }, {
                name: "All Files",
                extensions: ["*"]
              }]
            });
            if (!a.canceled) {
              await Oa.promises.writeFile(a.filePath, Buffer.from(e.data));
              if (this.$route.name === "download") {
                $notify.success(`音频下载完成 ${a.filePath}`);
              }
            }
          } else {
            $notify.warning("该视频音频为null，故无法下载音频。");
          }
        } catch (e) {
          $notify.error("出错了，试试点击自定义批量按钮下载。");
        } finally {
          this.musicStatus = "pending";
        }
      }
    },
    async saveSrt(t, e) {
      if (this.srtStatus === "pending") {
        try {
          this.srtStatus = "active";
          const i = await ht(t.src);
          if (i.data && i.data.body) {
            const a = await ma(i.data.body);
            const s = await Ga.dialog.showSaveDialog({
              title: `保存${t.desc}字幕`,
              defaultPath: this.formatName(e, false, false) + " " + t.desc,
              filters: [{
                name: "Srt",
                extensions: ["srt"]
              }, {
                name: "All Files",
                extensions: ["*"]
              }]
            });
            if (!s.canceled) {
              await Oa.promises.writeFile(s.filePath, a);
              $notify.success(`${t.desc}字幕已保存 ${s.filePath}`);
            }
          }
        } catch (i) {
          $notify.error("出错了，试试点击自定义批量按钮下载。");
        } finally {
          this.srtStatus = "pending";
        }
      }
    },
    async fileDeletePromise(t) {
      if (t) {
        if (await this.fileExistPromise(t)) {
          return await Oa.promises.unlink(t);
        } else {
          return undefined;
        }
      }
    },
    async fileExistPromise(t) {
      try {
        await Oa.promises.access(t + "", Oa.constants.F_OK);
        return true;
      } catch (e) {
        return false;
      }
    }
  },
  computed: {
    appPath() {
      const t = Ga.app.getAppPath();
      return t.split("\\dist")[0];
    },
    downloadedTitle() {
      if (this.downloaded.length) {
        return `已下载(${this.totalCount})`;
      } else {
        return "已下载";
      }
    },
    downloadTitle() {
      if (this.download.length) {
        return `待下载(${this.download.length})`;
      } else {
        return "待下载";
      }
    },
    downloadingTitle() {
      if (this.downloading.length) {
        return `下载中(${this.downloading.length})`;
      } else {
        return "下载中";
      }
    },
    audioQn() {
      return this.setting.audioQn;
    },
    videoQn() {
      return this.setting.videoQn;
    },
    defaultVideoEncoding() {
      return this.setting.videoEncoding;
    },
    renameRuleArray() {
      return di(this.renameRule).resultArr;
    },
    ...(0, mapState)(["waitDown", "setting", "defaultDownPath", "user", "remainVideoEncoding", "renameRule"])
  },
  watch: {
    downloading(t) {
      if (t.length !== 0) {
        this.downloadLoop();
      }
    },
    defaultDownPath(t) {
      this.downDirectory = t;
    },
    audioQn() {
      if (this.download.length) {
        this.download.forEach(t => {
          const {
            audio: e
          } = this.selectDefaultAudioQnBySystem(t.amap);
          if (e && e.audioDesc) {
            t.aModel = e.audioDesc;
            t.asize = t.amap[e.audioIndex].size;
            t.audio = t.amap[e.audioIndex].link;
          }
        });
      }
    },
    videoQn() {
      if (this.download.length) {
        this.download.forEach(t => {
          const {
            video: e
          } = this.selectDefaultVideoQnBySystem(t.vmap);
          if (e && e.videoDesc) {
            t.vModel = e.videoDesc;
            t.vsize = t.vmap[e.videoIndex].size;
            t.video = t.vmap[e.videoIndex].link;
          }
        });
      }
    },
    defaultVideoEncoding() {
      if (this.download.length) {
        this.download.forEach(t => {
          const {
            video: e
          } = this.selectDefaultVideoQnBySystem(t.vmap);
          if (e && e.videoDesc) {
            t.vModel = e.videoDesc;
            t.vsize = t.vmap[e.videoIndex].size;
            t.video = t.vmap[e.videoIndex].link;
          }
        });
      }
    },
    createFolder(t) {
      localStorage.setItem("createFolder", t);
    },
    createFolderAddIndex(t) {
      localStorage.setItem("createFolderAddIndex", t);
    }
  }
};
</script>
