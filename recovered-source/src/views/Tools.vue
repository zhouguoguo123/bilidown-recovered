<!--
  Tools — reconstructed from app.asar (Bilidown v1.2.7)
  <template> was decompiled from the compiled render function;
  <script> is the original component options object (identifiers restored).
-->
<template>
<div class="bilidown-tools">
  <div class="tools-title">
     小工具 [ bilidown small tools ] 
  </div>
  <div class="tool tools-av-bv">
    <div class="title">
       av号 ⇄ bv号 
    </div>
    <div>
      <input v-model="bvav" type="text" name id placeholder="请输入av/bv号，自动识别" />
      <b-button v-show="bvav.length > 5" round size="minimini" @click="convertAvBv">
        转换
      </b-button>
      <span v-show="bvavRe" @click="copyConvertReToClipBoard">
        {{ bvavRe }}
      </span>
    </div>
  </div>
  <div v-if="user.state" class="tool tools-jointime">
    <div class="title">
      入站时间查询
    </div>
    <b-button v-show="!joinTime" type="primary" round size="minimini" @click="searchJoinTime">
      查询
    </b-button>
    <p>
      {{ joinTime }}
    </p>
  </div>
  <div class="tool tools-cc-convert-srt">
    <div class="title">
       CC字幕(
      <a href="javascript:;" draggable="false" onclick="openExternalLink('https://zhouql.vip/bilidown/pc/example/cc.json')">
        点我查看格式
      </a>
      ) -> SRT字幕 
    </div>
    <div v-show="ccConvertSrt.ccSource" class="oneline" style="max-width: 600px">
      CC源：{{ ccConvertSrt.ccSource }} 
    </div>
    <div class="convert-cc-srt">
      <b-button round size="minimini" @click="selectSourceCC">
        选择CC字幕（.json文件）
      </b-button>
      <b-button v-show="ccConvertSrt.ccSource" type="primary" round size="minimini" @click="convertCCToSRT">
        开始转换 
      </b-button>
    </div>
  </div>
  <div class="tool tools-srt-convert-txt">
    <div class="title">
       SRT字幕 -> 纯文本 
    </div>
    <div v-show="srtConvertTxt.srtSource" class="oneline" style="max-width: 600px">
      SRT源：{{ srtConvertTxt.srtSource }} 
    </div>
    <div class="convert-srt-txt">
      <b-button round size="minimini" @click="selectSourceSRT">
        选择SRT字幕（.srt文件）
      </b-button>
      <b-button v-show="srtConvertTxt.warpText" type="primary" round size="minimini" @click="downloadSrtConvertTxt('warp')">
        下载[带换行] 
      </b-button>
      <b-button v-show="srtConvertTxt.noWrapText" type="primary" round size="minimini" @click="downloadSrtConvertTxt('nowarp')">
        下载[不带换行] 
      </b-button>
    </div>
  </div>
  <div class="tool tools-cc-convert-srt">
    <div class="title">
       SRT字幕 -> 纯文本 网页版(
      <a href="javascript:;" draggable="false" onclick="openExternalLink('https://zhouql.vip/bilidown/tools/srt2plaintext/')">
        点我打开工具
      </a>
      ) 
    </div>
  </div>
  <div class="tool tools-convert-mp3">
    <div class="title">
      音频转mp3格式【此操作耗时受文件体积，机器性能等影响】
    </div>
    <p v-show="audioSource" class="oneline" style="max-width: 600px">
      音频源：{{ audioSource }}
    </p>
    <p v-show="audioTarget" class="oneline" style="max-width: 600px">
      输出位置：{{ audioTarget }}
    </p>
    <div class="convert-mp3">
      <b-button v-show="audioFormatBtnText != '正在尝试转换中...'" round size="minimini" @click="selectSourceAudio">
        选择音频 
      </b-button>
      <b-button v-show="audioFormatBtnText != '正在尝试转换中...'" type="success" round size="minimini" @click="selectAudioTarget">
        选择输出位置 
      </b-button>
      <b-button v-show="audioSource && audioTarget" type="primary" round size="minimini" @click="convertAudioFormatToMP3">
        {{ audioFormatBtnText }} 
      </b-button>
    </div>
  </div>
  <div class="tool tools-mix-av">
    <div class="title">
      手动混流【此操作耗时受文件体积，机器性能等影响】
    </div>
    <p v-show="mix.audioPath" class="oneline" style="max-width: 600px">
      音频源：{{ mix.audioPath }}
    </p>
    <p v-show="mix.videoPath" class="oneline" style="max-width: 600px">
      视频源：{{ mix.videoPath }}
    </p>
    <p v-show="mix.targetPath" class="oneline" style="max-width: 600px">
      输出位置：{{ mix.targetPath }}
    </p>
    <div class="mix-av">
      <b-button round size="minimini" @click="mixSelectAudio">
        选择音频（-audio.xxx）
      </b-button>
      <b-button round size="minimini" @click="mixSelectVideo">
        选择视频（-video.xxx）
      </b-button>
      <b-button type="success" round size="minimini" @click="mixSelectTarget">
        选择输出位置
      </b-button>
      <b-button v-show="mix.audioPath && mix.videoPath && mix.targetPath" type="primary" round size="minimini" @click="mixing">
        {{ mix.btnText }} 
      </b-button>
    </div>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
// @restored:imports
import request from '../plugins/request'
// @restored:module-decls
const { remote: te } = window.require("electron");
const ee = te.require("fs");

const { remote: Fa } = window.require("electron");

const { remote: es } = window.require("electron");
const is = es.require("fs");
const ss = es.require("path");

const { ipcRenderer: as } = window.require("electron");
// @restored:module-decls-end
// @restored:imports-end

async function lt() {
  return request.get("https://member.bilibili.com/x2/creative/h5/calendar/event?ts=0", {
    withCredentials: true
  });
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

function Ut() {
  const t = Date.now();
  const e = Math.floor(Math.random() * 1000);
  const i = t * 1000 + e;
  return i.toString(24);
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

// @restored:removed-duplicate const ee = te.require("fs");

function oe(t) {
  try {
    if (/^\d+$/.test(t)) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function re(t) {
  try {
    await ee.promises.access(t + "", ee.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function Le(t, e) {
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
}

const Pe = 23442827791579n;

const ze = 2251799813685247n;

const Re = 1n << 51n;

const Qe = 58n;

const Ue = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf";

function We(t) {
  const e = ["B", "V", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
  let i = e.length - 1;
  let a = (Re | BigInt(t)) ^ Pe;
  while (a > 0) {
    e[i] = Ue[Number(a % BigInt(Qe))];
    a /= Qe;
    i -= 1;
  }
  [e[3], e[9]] = [e[9], e[3]];
  [e[4], e[7]] = [e[7], e[4]];
  return e.join("");
}

function Ge(t) {
  const e = Array.from(t);
  [e[3], e[9]] = [e[9], e[3]];
  [e[4], e[7]] = [e[7], e[4]];
  e.splice(0, 3);
  const i = e.reduce((t, e) => t * Qe + BigInt(Ue.indexOf(e)), 0n);
  return Number(i & ze ^ Pe);
}

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

function Qa(t) {
  if (process.platform === "win32") {
    Fa(`explorer /select,"${t}"`);
  } else if (process.platform === "darwin") {
    // macOS 没有 explorer；open -R 在 Finder 中定位该文件
    Fa(`open -R "${t}"`);
  }
}

export default {
  data() {
    return {
      bvav: "",
      bvavRe: "",
      audioSource: "",
      audioTarget: "",
      audioFormatBtnText: "开始",
      ffmpegProcess: null,
      ccConvertSrt: {
        ccSource: ""
      },
      srtConvertTxt: {
        srtSource: "",
        warpText: "",
        noWrapText: "",
        filename: ""
      },
      joinTime: "",
      mix: {
        audioPath: "",
        videoPath: "",
        targetPath: "",
        btnText: "开始"
      }
    };
  },
  methods: {
    copyConvertReToClipBoard() {
      if (this.bvavRe) {
        Tt(this.bvavRe);
        $notify("复制成功，win+v快捷键可查看剪切板。", 4500);
      }
    },
    limitInput() {
      if (this.bvav.length > 18) {
        this.bvav = this.bvav.substring(0, 18);
      }
      this.bvavRe = "";
    },
    convertAvBv() {
      let t;
      this.bvavRe = "";
      try {
        if (this.bvav.toUpperCase().substring(0, 2) === "BV") {
          t = Ge(this.bvav);
        } else {
          if (this.bvav.toUpperCase().substring(0, 2) === "AV") {
            this.bvav = this.bvav.substring(2);
          }
          if (oe(this.bvav)) {
            t = We(this.bvav);
          }
        }
      } catch (e) {
        $notify.error("出错了");
      }
      if (t) {
        $notify("转换成功，点击转换结果可复制到剪切板。");
        this.bvavRe = t;
      }
    },
    selectSourceAudio() {
      es.dialog.showOpenDialog({
        title: "选择音频源",
        buttonLabel: "确定",
        properties: ["openFile"],
        filters: [{
          name: "音频文件",
          extensions: ["aac", "m4a", "m4s", "mp3", "flac"]
        }]
      }).then(t => {
        if (!t.canceled && t.filePaths.length > 0) {
          this.audioSource = t.filePaths[0];
        }
      });
    },
    selectSourceCC() {
      es.dialog.showOpenDialog({
        title: "选择CC源",
        buttonLabel: "确定",
        properties: ["openFile"],
        filters: [{
          name: "CC文件",
          extensions: ["json"]
        }]
      }).then(t => {
        if (!t.canceled && t.filePaths.length > 0) {
          this.ccConvertSrt.ccSource = t.filePaths[0];
        }
      });
    },
    selectSourceSRT() {
      es.dialog.showOpenDialog({
        title: "选择SRT源",
        buttonLabel: "确定",
        properties: ["openFile"],
        filters: [{
          name: "SRT文件",
          extensions: ["srt"]
        }]
      }).then(t => {
        if (!t.canceled && t.filePaths.length > 0) {
          const e = t.filePaths[0].split("\\");
          this.srtConvertTxt.filename = e[e.length - 1].split(".srt")[0];
          this.srtConvertTxt.srtSource = t.filePaths[0];
          is.stat(this.srtConvertTxt.srtSource, (t, e) => {
            if (t) {
              $notify.error("无法读取文件信息");
              return;
            }
            const i = e.size;
            const a = 52428800;
            if (i > a) {
              $notify.info("文件大于50MB，不予处理。");
            } else {
              is.readFile(this.srtConvertTxt.srtSource, "utf8", (t, e) => {
                if (t) {
                  $notify.error("无法读取文件信息");
                } else {
                  try {
                    this.srtConvertTxt.warpText = "";
                    this.srtConvertTxt.noWrapText = "";
                    e.split("\r").forEach(t => {
                      if (!t) {
                        return;
                      }
                      const e = t.split("\n");
                      e.forEach(t => {
                        if (t && isNaN(Number(t)) && !t.includes("-->")) {
                          this.srtConvertTxt.warpText += `${t}\n`;
                          this.srtConvertTxt.noWrapText += t;
                        }
                      });
                    });
                  } catch (i) {
                    $notify.error("不支持的格式，转换失败。");
                    this.srtConvertTxt.warpText = "";
                    this.srtConvertTxt.noWrapText = "";
                  }
                }
              });
            }
          });
        }
      });
    },
    downloadSrtConvertTxt(t) {
      let e = document.createElement("a");
      let i = "";
      i = t === "warp" ? new Blob([this.srtConvertTxt.warpText], {
        type: "text/plain"
      }) : new Blob([this.srtConvertTxt.noWrapText], {
        type: "text/plain"
      });
      const a = URL.createObjectURL(i);
      e.href = a;
      e.download = this.srtConvertTxt.filename;
      e.click();
      setTimeout(() => {
        URL.revokeObjectURL(a);
      }, 10);
    },
    selectAudioTarget() {
      es.dialog.showOpenDialog({
        title: "选择输出文件夹",
        buttonLabel: "确定",
        properties: ["openDirectory"]
      }).then(t => {
        if (!t.canceled && t.filePaths.length > 0) {
          this.audioTarget = t.filePaths[0];
        }
      });
    },
    async runFFmpegCommand(t) {
      return new Promise((e, i) => {
        this.ffmpegProcess = as(t, {
          shell: true
        });
        process.on("exit", () => {
          this.ffmpegProcess.kill();
          i(new Error("Process exited unexpectedly"));
        });
        this.ffmpegProcess.on("close", t => {
          if (t !== 0) {
            i(new Error(t));
          } else {
            e(t);
          }
        });
      });
    },
    async convertAudioFormatToMP3() {
      if (this.audioFormatBtnText !== "开始") {
        return;
      }
      const t = ss.join(__dirname.replace(/electron\.asar(\\|\/)renderer/, "app.asar"), "..", "bin", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
      const e = `"${this.audioSource}"`;
      const i = ss.join(this.audioTarget, ss.basename(this.audioSource, ss.extname(this.audioSource)) + ".mp3");
      const a = `${t} -i ${e} -q:a 0 -map a "${i}"`;
      const s = await re(`${i}`);
      if (s) {
        $notify.info("输出位置有同名文件，请更换输出位置或删除文件。", 9000);
      } else {
        this.audioFormatBtnText = "正在尝试转换中...";
        this.runFFmpegCommand(a).then(() => {
          $notify("音频 mp3 格式转换已完成");
          setTimeout(() => {
            this.audioFormatBtnText = "转换已完成";
            Qa(i);
            this.audioSource = "";
            this.audioTarget = "";
            this.audioFormatBtnText = "开始";
          }, 1000);
        }).catch(() => {
          $notify.error("转换出错了");
          setTimeout(() => {
            this.audioSource = "";
            this.audioTarget = "";
            this.audioFormatBtnText = "开始";
          }, 1500);
        });
      }
    },
    async convertCCToSRT() {
      is.stat(this.ccConvertSrt.ccSource, (t, e) => {
        if (t) {
          $notify.error("无法读取文件信息");
          return;
        }
        const i = e.size;
        const a = 52428800;
        if (i > a) {
          $notify.info("文件大于50MB，不予处理。");
        } else {
          is.readFile(this.ccConvertSrt.ccSource, "utf8", (t, e) => {
            if (t) {
              $notify.error("无法读取文件信息");
            } else {
              try {
                let t = window.JSON.parse(e);
                if (!t.body) {
                  $notify.error("json格式有误，转化失败");
                  return;
                }
                ma(t.body).then(async t => {
                  $notify.success("转换成功。");
                  this.ccConvertSrt.ccSource = "";
                  const e = await es.dialog.showSaveDialog({
                    title: "保存SRT字幕",
                    defaultPath: `bilidown tools cc-srt${Ut()}`,
                    filters: [{
                      name: "Images",
                      extensions: ["srt"]
                    }, {
                      name: "All Files",
                      extensions: ["*"]
                    }]
                  });
                  if (!e.canceled) {
                    await is.promises.writeFile(e.filePath, Buffer.from(t));
                    $notify.success(`SRT字幕已保存 ${e.filePath}`);
                  }
                });
              } catch (i) {
                $notify.error("转换失败。");
              }
            }
          });
        }
      });
    },
    async searchJoinTime() {
      if (localStorage.getItem("jointime")) {
        this.joinTime = localStorage.getItem("jointime");
      } else {
        const t = await lt();
        let e = t.data.data.pfs.profile.jointime;
        let i = Le(e, true);
        if (e) {
          localStorage.setItem("jointime", i);
        }
        this.joinTime = i;
      }
    },
    mixSelectAudio() {
      es.dialog.showOpenDialog({
        title: "选择音频",
        buttonLabel: "确定",
        properties: ["openFile"],
        filters: [{
          name: "音频文件",
          extensions: ["aac", "m4a", "m4s", "mp3", "flac"]
        }]
      }).then(t => {
        if (!t.canceled && t.filePaths.length > 0) {
          this.mix.audioPath = t.filePaths[0];
        }
      });
    },
    mixSelectVideo() {
      es.dialog.showOpenDialog({
        title: "选择视频",
        buttonLabel: "确定",
        properties: ["openFile"],
        filters: [{
          name: "视频文件",
          extensions: ["m4s", "mp4"]
        }]
      }).then(t => {
        if (!t.canceled && t.filePaths.length > 0) {
          this.mix.videoPath = t.filePaths[0];
        }
      });
    },
    mixSelectTarget() {
      es.dialog.showOpenDialog({
        title: "选择输出文件夹",
        buttonLabel: "确定",
        properties: ["openDirectory"]
      }).then(t => {
        if (!t.canceled && t.filePaths.length > 0) {
          this.mix.targetPath = t.filePaths[0];
        }
      });
    },
    async fileExist(t) {
      try {
        await is.promises.access(t + "", is.constants.F_OK);
        return true;
      } catch (e) {
        return false;
      }
    },
    async mixing() {
      const t = await this.fileExist(this.mix.audioPath);
      const e = await this.fileExist(this.mix.videoPath);
      const i = await this.fileExist(this.mix.targetPath);
      if (!t) {
        $notify.error("音频源不存在，请检查。");
        return;
      }
      if (!e) {
        $notify.error("视频源不存在，请检查。");
        return;
      }
      if (!i) {
        $notify.error("输出文件夹不存在，请检查。");
        return;
      }
      this.mix.btnText = "正在尝试混流中...";
      let a = ss.join(this.mix.targetPath, `${Jt()}-bilidown-tools-mixing-${Ut()}.mp4`);
      const s = ss.join(__dirname.replace(/electron\.asar(\\|\/)renderer/, "app.asar"), "..", "bin", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
      let n = `"${s}" -y -i "${this.mix.audioPath}" -i "${this.mix.videoPath}" -strict -2 -acodec copy -vcodec copy -f mp4 "${a}"`;
      try {
        await this.runFFmpegCommand(n);
        $notify("混流成功");
        this.mix.audioPath = "";
        this.mix.videoPath = "";
        this.mix.targetPath = "";
        setTimeout(() => Qa(a), 1000);
      } catch (o) {
        $notify(`混流失败，退出代码${o}`);
      } finally {
        this.mix.btnText = "开始";
      }
    },
    async runFFmpegCommand(t) {
      return new Promise((e, i) => {
        const a = as(t, {
          shell: true
        });
        process.on("exit", () => {
          a.kill();
          i(new Error("Process exited unexpectedly"));
        });
        a.on("close", t => {
          if (t !== 0) {
            i(new Error(t));
          } else {
            e(t);
          }
        });
      });
    }
  },
  computed: {
    ...(0, mapState)(["user"]),
    appPath() {
      return es.app.getAppPath().split("\\dist")[0];
    }
  }
};
</script>


<!-- @restored:style:START -->
<style scoped>
.bilidown-tools {
  padding:20px;
  height:100%;
  overflow:overlay
}
.bilidown-tools::-webkit-scrollbar {
  width:0!important
}
.bilidown-tools .tools-title {
  font-size:18px;
  font-weight:600
}
.bilidown-tools .title,.bilidown-tools .tools-title {
  color:var(--tools-title);
  -webkit-user-select:none;
  -moz-user-select:none;
  user-select:none
}
.bilidown-tools .title {
  font-size:15px;
  font-weight:500;
  margin:6px 0
}
.bilidown-tools .tool {
  font-size:14px;
  margin:14px 0 6px 0;
  color:var(--tools-convert-mp3);
  border:1.8px solid var(--downloader-content-border);
  padding:6px 12px;
  border-radius:6px;
  transition:all .15s
}
.bilidown-tools .tool p,.bilidown-tools .tool span {
  color:#33a06f
}
.bilidown-tools .tool div {
  margin:6px 0
}
.bilidown-tools .tools-av-bv input {
  width:160px;
  height:28px;
  border-radius:4px;
  border:1.5px solid var(--tools-av-bv-input-border);
  outline:none;
  text-indent:.4em;
  color:var(--tools-av-bv-input);
  font-size:11.5px;
  background:transparent;
  transition:all .05s
}
.bilidown-tools .tools-av-bv input:focus {
  border-color:var(--theme-4);
  box-shadow:0 0 .5px 1px var(--theme-9)
}
.bilidown-tools .tools-av-bv input::-moz-placeholder {
  -moz-user-select:none;
  user-select:none
}
.bilidown-tools .tools-av-bv input::placeholder {
  -webkit-user-select:none;
  -moz-user-select:none;
  user-select:none
}
.bilidown-tools .tools-av-bv div {
  display:flex;
  align-items:center
}
.bilidown-tools .tools-av-bv div button {
  margin-left:10px
}
.bilidown-tools .tools-av-bv span {
  margin-left:12px;
  color:var(--theme-7);
  cursor:pointer
}
.bilidown-tools .tools-jointime {
  height:74px
}
.bilidown-tools .tools-convert-mp3 .convert-mp3 {
  display:flex;
  align-items:center
}
.bilidown-tools .tools-convert-mp3 .convert-mp3 button {
  margin-right:8px
}
.bilidown-tools .tools-cc-convert-srt .convert-cc-srt {
  display:flex;
  align-items:center
}
.bilidown-tools .tools-cc-convert-srt .convert-cc-srt button {
  margin-right:8px
}
.bilidown-tools .tools-srt-convert-txt .convert-srt-txt {
  display:flex;
  align-items:center
}
.bilidown-tools .tools-srt-convert-txt .convert-srt-txt button {
  margin-right:8px
}
.bilidown-tools .tools-mix-av .mix-av {
  display:flex
}
.bilidown-tools .tools-mix-av .mix-av button {
  margin-right:8px
}
</style>
<!-- @restored:style:END -->
