<!--
  Search — reconstructed from app.asar (Bilidown v1.2.7)
  <template> was decompiled from the compiled render function;
  <script> is the original component options object (identifiers restored).
-->
<template>
<div class="search" @contextmenu.prevent="onContextmenu">
  <div class="search-content">
    <input v-model.trim="nativeLink" placeholder="请输入链接" class="search-input" ref="searchInput" @keydown.enter="search" @blur="$forceUpdate()" />
    <button @click="search">
      搜索
    </button>
    <i v-show="nativeLink" class="search-clear-icon iconfont icon-guanbi" @click="clearNativeLink" />
  </div>
  <el-collapse v-show="mediaData.heji.length || mediaData.fenp.length" v-model="activeName" accordion>
    <el-collapse-item :title="selectTipTitle" name="视频">
      <el-checkbox v-for="i in selectPages" v-model="selectedP" border :label="i.page" class="oneline" :key="i.page + i.name" @change="handleCheckedChange">
        第{{ i.page }}集 | {{ i.name }} 
      </el-checkbox>
    </el-collapse-item>
    <div style="margin: 15px 0" />
    <el-checkbox v-if="activeName" v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
      全选(A) 
      <b-button v-if="pagesReqState != 'active'" size="mini" round type="success" @click="getPagesDetails">
        下一步(Enter) 
      </b-button>
      <b-button v-if="pagesReqState == 'active'" size="mini" round type="danger" @click="revokePagesReq">
        取消 
      </b-button>
    </el-checkbox>
  </el-collapse>
</div>
</template>

<script>
import { mapState } from 'vuex'
import clipboard from 'clipboard-polyfill'
import store from '../store'
// @restored:imports
import request from '../plugins/request'
import { shell } from '../plugins/electron'
import tipAudioSuccess from '@/assets/media/tip-success.mp3'
import tipAudioYes from '@/assets/media/tip-yes.mp3'
import tipAudioNo from '@/assets/media/no.mp3'
import tipAudioSaoma from '@/assets/media/tip-saoma.mp3'
import tipAudioHover from '@/assets/media/tip-hover.mp3'
import tipAudioClick from '@/assets/media/tip-click.mp3'
// @restored:module-decls
const { ipcRenderer: Oe } = window.require("electron");
// @restored:module-decls-end
// @restored:imports-end

async function vt() {
  return request.get(`https://zhouql.vip/bilidown/support/support.json?t=${new Date().getTime()}`);
}

const Bt = new Audio(tipAudioNo);

const It = new Audio(tipAudioYes);

const Nt = new Audio(tipAudioClick);

const Yt = new Audio(tipAudioHover);

const Ft = new Audio(tipAudioSaoma);

const Lt = new Audio(tipAudioSuccess);

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

function Ut() {
  const t = Date.now();
  const e = Math.floor(Math.random() * 1000);
  const i = t * 1000 + e;
  return i.toString(24);
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

function Kt(t) {
  document.querySelector(t)?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

const ae = new Map([["127", ["8K 超高清", "杜比视界", "HDR 真彩色", "4K 超清", "1080P60 高帧率", "1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["126", ["杜比视界", "HDR 真彩色", "4K 超清", "1080P60 高帧率", "1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["125", ["HDR 真彩色", "4K 超清", "1080P60 高帧率", "1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["120", ["4K 超清", "1080P60 高帧率", "1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["116", ["1080P60 高帧率", "1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["112", ["1080P+ 高码率", "1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["80", ["1080P 高清", "720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["74", ["720P60 高帧率", "720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["64", ["720P 高清", "480P 清晰", "360P 流畅", "240P 极速"]], ["32", ["480P 清晰", "360P 流畅", "240P 极速"]], ["16", ["360P 流畅", "240P 极速"]], ["6", ["240P 极速"]]]);

const se = new Map([["hi", ["Hi-Res无损", "杜比全景声", "192K", "132K", "64K"]], ["dubi", ["杜比全景声", "192K", "132K", "64K"]], ["192", ["192K", "132K", "64K"]], ["132", ["132K"]], ["64", ["64K"]]]);

async function Be(t) {
  return request.get(t);
}

async function Ie(t) {
  return request.get(`https://api.bilibili.com/x/web-interface/view?bvid=${t}`);
}

async function Ne(t, e) {
  return request.get(`https://api.bilibili.com/x/player/playurl?cid=${e}&fourk=1&fnver=0&fnval=4048&bvid=${t}`).then(t => t.data);
}

async function Ye(t, e, i) {
  return request.get(`https://api.bilibili.com/x/player/playurl?cid=${e}&fourk=1&fnver=0&fnval=4048&bvid=${t}&qn=${i}`).then(t => t.data);
}

async function Fe(t, e) {
  return request.get(`https://api.bilibili.com/x/player/wbi/v2?aid=${t}&cid=${e}`);
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

function Ee(t) {
  let e = Math.floor(t / 86400);
  let i = Math.floor(t % 86400 / 3600);
  let a = Math.floor(t % 3600 / 60);
  let s = t % 60;
  if (e > 0) {
    return e + "天" + i + "小时" + a + "分钟" + s + "秒";
  } else if (i > 0) {
    return i + "小时" + a + "分钟" + s + "秒";
  } else if (a > 0) {
    return a + "分钟" + s + "秒";
  } else {
    return s + "秒";
  }
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

const Pe = 23442827791579n;

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

export default {
  data() {
    return {
      pagesReqState: "pending",
      checkAll: false,
      isIndeterminate: true,
      waitDown: [],
      waitDownCache: {},
      nativeLink: "",
      activeName: "",
      selectedP: [],
      selectPages: [],
      bv: "",
      p: "",
      mediaData: {
        vid: "",
        type: "single",
        idSet: {
          aid: "",
          bv: "",
          cid: ""
        },
        uid: "",
        upname: "",
        hejiTitle: "",
        title: "",
        pic: "",
        pubdate: "",
        desc: "",
        duration: "",
        fenp: [],
        heji: [],
        zimu: []
      }
    };
  },
  beforeRouteEnter(t, e, i) {
    i(t => {
      if (t.selectPages) {
        setTimeout(() => {
          t.activeName = "视频";
          setTimeout(() => Kt(".el-collapse-item__content .is-checked"), 120);
        }, 200);
      }
      t.$nextTick(() => {
        t.$refs.searchInput.focus();
      });
    });
  },
  mounted() {
    Oe.on("protocolParserLink", (t, e) => {
      this.nativeLink = e;
      setTimeout(async () => {
        await this.search(false);
      }, 60);
    });
    Oe.on("clipboard-change", async (t, e) => {
      const i = await this.parseBv(e);
      const a = this.p;
      if (i) {
        zt("hover");
        Oe.send("listen-clipboard-focus");
        this.nativeLink = e;
        await this.$router.push("/search");
        this.resetData();
        this.bv = i;
        this.p = a;
        await this.getVideoDetail(this.bv);
      }
    });
    this.$refs.searchInput.focus();
    document.addEventListener("keydown", t => {
      if (this.$route.name === "search") {
        if (t.ctrlKey && t.key == "b") {
          t.preventDefault();
          if (this.$refs.searchInput != document.activeElement) {
            this.$refs.searchInput.focus();
            $notify.info("已拿到焦点，可直接粘贴链接🫡");
          } else if (this.nativeLink) {
            $notify.info("输入似烦恼，已被俺全部清除了");
            this.nativeLink = "";
            this.resetData();
            setTimeout(() => {
              this.revokePagesReq();
            });
          }
        }
        if (t.ctrlKey && t.key == "a" && this.$refs.searchInput != document.activeElement) {
          t.preventDefault();
          if (this.selectPages.length) {
            this.checkAll = !this.checkAll;
            this.handleCheckAllChange(this.checkAll);
          }
        }
        if (t.key === "Enter") {
          t.preventDefault();
          if (this.$refs.searchInput != document.activeElement && this.selectPages.length) {
            this.getPagesDetails();
          }
        }
      }
    });
  },
  methods: {
    onContextmenu(t) {
      this.$contextmenu({
        items: [{
          label: "粘贴（V）",
          icon: "iconfont icon-niantie1",
          onClick: async () => {
            const t = await clipboard.read();
            if (t) {
              this.nativeLink = t;
            }
            zt("yes");
          }
        }, {
          label: "了解更多",
          icon: "iconfont icon-mianzeshengming",
          onClick: async () => {
            zt("hover");
            Ot("https://zhouql.vip/");
          }
        }],
        event: t,
        customClass: "",
        zIndex: 4
      });
      return false;
    },
    handleCheckAllChange(t) {
      if (t) {
        this.selectedP = [];
        this.selectPages.forEach(t => this.selectedP.push(t.page));
        this.checkAll = true;
      } else {
        this.selectedP = [];
        this.checkAll = false;
      }
      this.isIndeterminate = false;
    },
    handleCheckedChange() {
      if (this.selectedP.length === this.selectPages.length) {
        this.checkAll = true;
      } else {
        this.checkAll = false;
      }
      this.isIndeterminate = this.selectedP.length > 0 && this.selectedP.length < this.selectPages.length;
    },
    async supportCheck() {
      try {
        const t = await vt();
        if (t.data && t.data.support) {
          this.$store.commit("updateSupport", true);
        } else {
          this.$store.commit("updateSupport", false);
        }
      } catch (t) {
        this.$store.commit("updateSupport", false);
      }
    },
    async search(t = true) {
      if (t) {
        zt("hover");
      }
      if (!t) {
        await this.$router.push("/search");
      }
      if (!this.support && (await this.supportCheck(), !this.support)) {
        $notify.error(`未知原因，连接服务器失败 | <a onclick="openExternalLink('https://zhouql.vip/bilidown/support/support.json?t=${new Date().getTime()}')">详情</a>`, 4000);
        return;
      }
      if (!this.nativeLink.length) {
        $notify.warning("空空如也，输入链接再试试吧！", 2500);
        return;
      }
      this.resetData();
      const e = await this.parseBv(this.nativeLink);
      if (e) {
        this.bv = e;
        await this.getVideoDetail(this.bv);
      } else {
        $notify.error("仅支持由UP上传的单视频，合集和分集视频。");
      }
    },
    async parseBv(t = this.nativeLink) {
      try {
        if (!t || t.length < 4) {
          return "";
        }
        if (t.toLowerCase().startsWith("bv")) {
          return t;
        }
        if (t.includes("video/BV") && t.includes("?p=")) {
          this.p = t.split("?p=")[1].split("&")[0];
        }
        if (t.includes("bilibili.com/video/BV")) {
          if (t.includes("/?")) {
            return t.split("video/")[1].split("/?")[0];
          }
          if (t.includes("?")) {
            return t.split("video/")[1].split("?")[0];
          }
          if (t.includes("/")) {
            return t.split("video/")[1].split("/")[0];
          }
        }
        if (t.includes("bilibili.com/list/watchlater?bvid=")) {
          return t.split("bvid=")[1].split("&")[0];
        }
        if (t.includes("bilibili.com/list/watchlater/?bvid=")) {
          return t.split("?bvid=")[1].split("&")[0];
        }
        if (t.includes("https://m.bilibili.com/video/BV")) {
          if (t.includes("/?")) {
            return t.split("video/")[1].split("/?")[0];
          }
          if (t.includes("?")) {
            return t.split("video/")[1].split("?")[0];
          }
          if (t.includes("/")) {
            return t.split("video/")[1].split("/")[0];
          }
        }
        const e = ["https://bili2233.cn/", "https://b23.tv/"];
        if (e.some(e => t.includes(e))) {
          $notify.loading2("链接解析中...");
          let e = "https" + t.split("https")[1];
          const i = await Be(e);
          if (i.data.code == "-404") {
            $notify.error("出错了，请检查链接是否正确");
            return "";
          } else {
            return i.request.responseURL.split("video/")[1].split("/")[0];
          }
        }
        if (t.toLocaleLowerCase().includes("av")) {
          if (t.includes("/?")) {
            return We(t.split("av")[1].split("/?")[0]);
          } else if (t.split("av")[1].includes("?")) {
            return We(t.split("av")[1].split("?")[0]);
          } else if (t.split("av")[1].includes("/")) {
            return We(t.split("av")[1].split("/")[0]);
          } else {
            return We(t.split("av")[1]);
          }
        } else {
          return "";
        }
      } catch (e) {
        $notify.error(e.message);
      }
    },
    async getVideoDetail(t) {
      if (this.$route.name === "search") {
        $notify.loading2("链接解析中...");
      }
      await Pt(380);
      try {
        const e = await Ie(t);
        const i = e.data.data;
        if (e.data.code == "0") {
          this.mediaData.idSet.aid = i.aid;
          this.mediaData.idSet.bv = i.bvid;
          this.mediaData.idSet.cid = i.cid;
          this.mediaData.vid = Ut();
          this.mediaData.title = i.title;
          this.mediaData.pic = i.pic;
          this.mediaData.pubdate = Le(i.pubdate);
          this.mediaData.desc = i.desc ? i.desc : "这个视频没有写简介哦！ -- 开发者提示";
          this.mediaData.duration = Ee(i.duration);
          this.mediaData.uid = i.owner.mid;
          this.mediaData.upname = i.owner.name;
          if (i.hasOwnProperty("pages") && i.pages.length > 1 && i.hasOwnProperty("ugc_season")) {
            this.mediaData.heji = [];
            this.fenpHandler(i);
          } else if (i.hasOwnProperty("ugc_season")) {
            this.hejiHandler(i);
          } else {
            this.mediaData.heji = [];
            if (i.hasOwnProperty("pages") && i.pages.length > 1) {
              this.fenpHandler(i);
            } else {
              this.mediaData.fenp = [];
              this.mediaData.type = "单视频";
            }
          }
          if (this.mediaData.type === "单视频") {
            const t = await Ne(i.bvid, i.cid);
            if (t.code != "0") {
              $notify.warning("当前视频可能已被删除。");
              return;
            }
            if (t.data.accept_description && t.data.accept_description.length && t.data.accept_description.includes("试看")) {
              $notify.warning("当前视频是充电专属视频，不支持。");
              return;
            }
            if (!t.data.dash && t.data.durl) {
              $notify.warning(`当前视频不支持dash格式，请使用<a onclick="openExternalLink('https://zhouql.vip/bilidown/?https://www.bilibili.com/video/${this.bv}')">网页版</a>下载，查看<a onclick="openExternalLink('https://zhouql.vip/bilidown/doc/bilidown-pc-questions.html#%E6%8F%90%E7%A4%BA%E4%B8%8D%E6%94%AF%E6%8C%81dash%E6%A0%BC%E5%BC%8F-%E5%95%A5%E6%84%8F%E6%80%9D')">详情</a>。`);
              return;
            }
            let e = await this.singleHandler(t.data, i);
            this.waitDown.push(e);
            await this.commitWaitDownArr();
          } else {
            this.$nextTick(() => {
              const t = document.querySelectorAll(".el-collapse-item__content");
              if (this.selectPages.length > 4 && t.length > 0) {
                t.forEach(t => t.classList.add("el-checkbox-overflow-99"));
              } else {
                t.forEach(t => t.classList.remove("el-checkbox-overflow-99"));
              }
            });
            this.activeName = "视频";
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                Kt(".el-collapse-item__content .is-checked");
              });
            });
          }
          this.$nextTick(() => {
            let t = this;
            let e = document.querySelectorAll(".el-checkbox.oneline.is-bordered");
            const i = Array.from(e);
            let a;
            function s(e) {
              a ||= this;
              if (e.shiftKey) {
                let e;
                let s;
                let n = i.indexOf(this);
                let o = i.indexOf(a);
                if (n < o) {
                  e = Math.min(o, n) + 1;
                  s = Math.max(o, n) + 1;
                } else {
                  e = Math.min(o, n);
                  s = Math.max(o, n);
                }
                i.slice(e, s).forEach(e => {
                  t.selectedP.push(Number(e.querySelector("input").value));
                });
                t.selectedP = Array.from(new Set(t.selectedP));
              }
              a = this;
            }
            i.forEach(t => t.addEventListener("click", s));
          });
        } else {
          $notify.error("出错了，请检查链接后重试");
        }
      } catch (e) {
        $notify.error(e.message);
      }
    },
    fenpHandler(t) {
      $notify.info("分集视频，请选择后下一步");
      this.mediaData.fenp = t.pages;
      this.mediaData.type = "分集视频";
      this.selectPages = t.pages.map((t, e) => ({
        name: t.part,
        page: e + 1
      }));
      if (this.p) {
        this.selectedP.push(Number(this.p));
      }
      if (t.pages.length > 120) {
        $notify.warning("当前分集数大于120，强烈建议分几次下载", 5000);
      }
    },
    hejiHandler(t) {
      $notify.info("合集视频，请选择后下一步");
      this.mediaData.type = "合集视频";
      for (let e = 0; e < t.ugc_season.sections.length; e++) {
        const i = t.ugc_season.sections[e];
        for (let a = 0; a < i.episodes.length; a++) {
          const s = i.episodes[a];
          if (s.cid == this.mediaData.idSet.cid) {
            this.mediaData.hejiTitle = t.ugc_season.sections.length === 1 ? t.ugc_season.title : i.title;
            this.mediaData.heji = t.ugc_season.sections[e].episodes;
            this.selectedP.push(a + 1);
            break;
          }
        }
      }
      this.selectPages = this.mediaData.heji.map((t, e) => ({
        name: t.title,
        page: e + 1
      }));
      if (t.pages.length > 120) {
        $notify.warning("当前合集数大于120，强烈建议分几次下载", 5000);
      }
    },
    async getPagesDetails() {
      zt("hover");
      if (this.selectedP.length) {
        $notify.loading2("准备获取数据");
        await Pt(500);
        this.pagesReqState = "active";
        if (this.mediaData.fenp.length) {
          await this.getFenjiPagesByUserSelect(this.selectedP, this.mediaData.fenp);
        } else if (this.mediaData.heji.length) {
          await this.getHejiPagesByUserSelect(this.selectedP, this.mediaData.heji);
        }
      } else {
        $notify.info("至少选择一个视频 (。_。)");
      }
    },
    revokePagesReq() {
      this.waitDown = [];
      this.pagesReqState = "cancel";
    },
    async singleHandler(t, e) {
      try {
        const i = await this.buildVideoAudioObj(t, e.duration, this.mediaData.idSet.bv, this.mediaData.idSet.cid);
        let {
          audioQnMap: a,
          videoQnMap: s,
          qn: n
        } = i;
        let o = {
          vid: this.mediaData.vid,
          aid: this.mediaData.idSet.aid,
          bv: this.mediaData.idSet.bv,
          cid: this.mediaData.idSet.cid,
          upname: this.mediaData.upname,
          uid: this.mediaData.uid,
          type: this.mediaData.type,
          title: this.mediaData.title,
          hejiTitle: this.mediaData.hejiTitle,
          fenpTitle: this.mediaData.title,
          pic: this.mediaData.pic + "@240w",
          zimu: this.mediaData.zimu,
          duration: e.duration,
          formatDuration: this.mediaData.duration,
          desc: this.mediaData.desc,
          pubdate: this.mediaData.pubdate,
          aModel: n.audio.audioDesc,
          vModel: n.video.videoDesc,
          aSelect: n.audio.audioDesc,
          vSelect: n.video.videoDesc,
          video: s[n.video.videoIndex].link,
          vsize: s[n.video.videoIndex].size,
          audio: [],
          asize: 0,
          index: "1",
          amap: a,
          vmap: s,
          qn: n,
          isDownloading: false,
          taskStack: [],
          taskStackCache: [],
          audioFullPath: "",
          videoFullPath: "",
          downloadFolder: "",
          formatName: "",
          coverFormatName: "",
          audioFormatName: "",
          videoFormatName: "",
          xmlFormatName: "",
          assFormatName: "",
          srtFormatName: "",
          guaxiaoFormatName: "",
          status: "pending",
          paused: false,
          tip: "",
          gid: "",
          totalLength: "",
          completedLength: "",
          speed: "",
          progress: "",
          progressMB: "--/--"
        };
        if (n.audio.audioDesc) {
          o.audio = a[n.audio.audioIndex].link;
          o.asize = a[n.audio.audioIndex].size;
        }
        if (this.user.state) {
          const t = await Fe(e.aid, e.cid);
          let i = t.data.data;
          if (i.subtitle.subtitles && i.subtitle.subtitles.length) {
            i.subtitle.subtitles.forEach(t => {
              this.mediaData.zimu.push({
                src: t.subtitle_url,
                desc: t.lan_doc
              });
            });
          }
        }
        return o;
      } catch (i) {
        $notify.error(i.message);
        this.revokePagesReq();
      }
    },
    async getHejiPagesByUserSelect(t, e) {
      try {
        t.sort((t, e) => t - e);
        for (const i of t) {
          if (this.pagesReqState === "cancel") {
            this.pagesReqState = "pending";
          }
          if (this.pagesReqState === "pending") {
            this.waitDown = [];
            $notify.close();
            return;
          }
          let a = e[i - 1];
          if (this.waitDownCache[a.cid]) {
            if (this.waitDownCache[a.cid] !== -1) {
              this.waitDownCache[a.cid].gid = "";
              this.waitDownCache[a.cid].tip = "";
              this.waitDownCache[a.cid].taskStack = [];
              this.waitDownCache[a.cid].taskStackCache = [];
              this.waitDownCache[a.cid].status = "pending";
              this.waitDownCache[a.cid].progress = "";
              this.waitDownCache[a.cid].progressMB = "--/--";
              this.waitDownCache[a.cid].speed = "";
              this.waitDownCache[a.cid].paused = false;
              this.waitDownCache[a.cid].isDownloading = false;
              this.waitDown.push(this.waitDownCache[a.cid]);
            }
          } else {
            const s = await Ne(a.bvid, a.cid);
            if (s.code != "0") {
              $notify.warning(`合集第${i}集视频可能已被删除，已跳过。`);
              this.waitDownCache[a.cid] = Object.freeze(-1);
              await Pt(1200);
              continue;
            }
            if (s.data.accept_description && s.data.accept_description.length && s.data.accept_description.includes("试看")) {
              $notify.warning(`合集第${i}集是充电专属视频，已跳过。`);
              this.waitDownCache[a.cid] = Object.freeze(-1);
              await Pt(1500);
              continue;
            }
            let n;
            if (!s.data.dash && s.data.durl) {
              $notify.warning(`合集第${i}集不支持dash格式，请使用<a onclick="openExternalLink('https://zhouql.vip/bilidown/?https://www.bilibili.com/video/${this.bv}')">网页版</a>下载，查看<a onclick="openExternalLink('https://zhouql.vip/bilidown/doc/bilidown-pc-questions.html#%E6%8F%90%E7%A4%BA%E4%B8%8D%E6%94%AF%E6%8C%81dash%E6%A0%BC%E5%BC%8F-%E5%95%A5%E6%84%8F%E6%80%9D')">详情</a>。`);
              await Pt(2500);
              continue;
            }
            n = await this.buildVideoAudioObj(s.data, a.arc.duration, a.bvid, a.cid);
            let {
              audioQnMap: o,
              videoQnMap: r,
              qn: A
            } = n;
            if (this.$route.name === "search") {
              $notify.loading2(`正在排序，填装合集 ${i} / ${e.length} 的数据...`);
            }
            let l = {
              vid: this.mediaData.vid,
              aid: a.aid,
              bv: a.bvid,
              cid: a.cid,
              upname: this.mediaData.upname,
              uid: this.mediaData.uid,
              type: this.mediaData.type,
              title: a.title,
              hejiTitle: this.mediaData.hejiTitle,
              fenpTitle: this.mediaData.title,
              pic: a.arc.pic,
              zimu: [],
              duration: a.arc.duration,
              formatDuration: Ee(a.arc.duration),
              desc: a.page.part,
              pubdate: Le(a.arc.pubdate),
              aModel: A.audio.audioDesc,
              vModel: A.video.videoDesc,
              aSelect: A.audio.audioDesc,
              vSelect: A.video.videoDesc,
              video: r[A.video.videoIndex].link,
              vsize: r[A.video.videoIndex].size,
              audio: [],
              asize: 0,
              index: i,
              amap: o,
              vmap: r,
              qn: A,
              isDownloading: false,
              taskStack: [],
              taskStackCache: [],
              audioFullPath: "",
              videoFullPath: "",
              downloadFolder: "",
              formatName: "",
              coverFormatName: "",
              audioFormatName: "",
              videoFormatName: "",
              xmlFormatName: "",
              assFormatName: "",
              srtFormatName: "",
              guaxiaoFormatName: "",
              status: "pending",
              paused: false,
              tip: "",
              gid: "",
              totalLength: "",
              completedLength: "",
              speed: "",
              progress: "",
              progressMB: "--/--"
            };
            if (A.audio.audioDesc) {
              l.audio = o[A.audio.audioIndex].link;
              l.asize = o[A.audio.audioIndex].size;
            }
            l.pic += t.length !== 1 ? "@168w" : "@240w";
            if (this.user.state) {
              const t = await Fe(a.aid, a.cid);
              let e = t.data.data;
              if (e.subtitle && e.subtitle.subtitles && e.subtitle.subtitles.length) {
                e.subtitle.subtitles.forEach(t => {
                  l.zimu.push({
                    src: t.subtitle_url,
                    desc: t.lan_doc
                  });
                });
              }
            }
            if (this.pagesReqState !== "pending") {
              this.waitDown.push(l);
              this.waitDownCache[a.cid] = Object.freeze(l);
              await Pt(150);
            }
          }
        }
        await this.commitWaitDownArr();
      } catch (i) {
        $notify.error(i.message);
        this.revokePagesReq();
      } finally {
        this.pagesReqState = "pending";
      }
    },
    async commitWaitDownArr() {
      if (this.waitDown.length) {
        this.$store.commit("updateWaitDown", this.waitDown);
        this.waitDown = [];
        await Pt(60);
        this.pagesReqState = "pending";
        if (this.$route.name === "download") {
          await this.$router.push("/acount");
        }
        await this.$router.push("/download");
        this.activeName = "";
      }
    },
    async getFenjiPagesByUserSelect(t, e) {
      try {
        t.sort((t, e) => t - e);
        for (const i of t) {
          if (this.pagesReqState === "cancel") {
            this.pagesReqState = "pending";
          }
          if (this.pagesReqState === "pending") {
            this.waitDown = [];
            $notify.close();
            return;
          }
          let a = e[i - 1];
          if (this.waitDownCache[a.cid]) {
            if (this.waitDownCache[a.cid] !== -1) {
              this.waitDownCache[a.cid].gid = "";
              this.waitDownCache[a.cid].tip = "";
              this.waitDownCache[a.cid].taskStack = [];
              this.waitDownCache[a.cid].taskStackCache = [];
              this.waitDownCache[a.cid].status = "pending";
              this.waitDownCache[a.cid].progress = "";
              this.waitDownCache[a.cid].progressMB = "--/--";
              this.waitDownCache[a.cid].speed = "";
              this.waitDownCache[a.cid].paused = false;
              this.waitDownCache[a.cid].isDownloading = false;
              this.waitDown.push(this.waitDownCache[a.cid]);
            }
          } else {
            const s = await Ne(this.bv, a.cid);
            if (s.code != "0") {
              $notify.warning(`分集第${i}集视频可能已被删除，已跳过。`);
              this.waitDownCache[a.cid] = Object.freeze(-1);
              await Pt(1200);
              continue;
            }
            if (s.data.accept_description && s.data.accept_description.length && s.data.accept_description.includes("试看")) {
              $notify.warning(`分集第${i}集是充电专属视频，已跳过。`);
              this.waitDownCache[a.cid] = Object.freeze(-1);
              await Pt(1500);
              continue;
            }
            let n;
            if (!s.data.dash && s.data.durl) {
              $notify.warning(`分集第${i}集不支持dash格式，请使用<a onclick="openExternalLink('https://zhouql.vip/bilidown/?https://www.bilibili.com/video/${this.bv}')">网页版</a>下载，查看<a onclick="openExternalLink('https://zhouql.vip/bilidown/doc/bilidown-pc-questions.html#%E6%8F%90%E7%A4%BA%E4%B8%8D%E6%94%AF%E6%8C%81dash%E6%A0%BC%E5%BC%8F-%E5%95%A5%E6%84%8F%E6%80%9D')">详情</a>。`);
              await Pt(2500);
              continue;
            }
            n = await this.buildVideoAudioObj(s.data, a.duration, this.mediaData.idSet.bv, a.cid);
            let {
              audioQnMap: o,
              videoQnMap: r,
              qn: A
            } = n;
            if (this.$route.name === "search") {
              $notify.loading2(`正在排序，填装分集 ${i} / ${e.length} 的数据...`);
            }
            let l = {
              vid: this.mediaData.vid,
              aid: this.mediaData.idSet.aid,
              bv: this.mediaData.idSet.bv,
              cid: a.cid,
              upname: this.mediaData.upname,
              uid: this.mediaData.uid,
              type: this.mediaData.type,
              title: a.part,
              hejiTitle: this.mediaData.hejiTitle,
              fenpTitle: this.mediaData.title,
              pic: "",
              zimu: [],
              duration: a.duration,
              formatDuration: Ee(a.duration),
              desc: this.mediaData.desc,
              pubdate: this.mediaData.pubdate,
              aModel: A.audio.audioDesc,
              vModel: A.video.videoDesc,
              aSelect: A.audio.audioDesc,
              vSelect: A.video.videoDesc,
              video: r[A.video.videoIndex].link,
              vsize: r[A.video.videoIndex].size,
              audio: [],
              asize: 0,
              index: i,
              amap: o,
              vmap: r,
              qn: A,
              isDownloading: false,
              taskStack: [],
              taskStackCache: [],
              audioFullPath: "",
              videoFullPath: "",
              downloadFolder: "",
              formatName: "",
              coverFormatName: "",
              audioFormatName: "",
              videoFormatName: "",
              xmlFormatName: "",
              assFormatName: "",
              srtFormatName: "",
              guaxiaoFormatName: "",
              status: "pending",
              paused: false,
              tip: "",
              gid: "",
              totalLength: "",
              completedLength: "",
              speed: "",
              progress: "",
              progressMB: "--/--"
            };
            if (A.audio.audioDesc) {
              l.audio = o[A.audio.audioIndex].link;
              l.asize = o[A.audio.audioIndex].size;
            }
            l.pic = this.mediaData.pic ? this.mediaData.pic : a.first_frame;
            l.pic += t.length !== 1 ? "@168w" : "@240w";
            if (this.user.state) {
              const t = await Fe(this.mediaData.idSet.aid, a.cid);
              let e = t.data.data;
              if (e.subtitle && e.subtitle.subtitles && e.subtitle.subtitles.length) {
                e.subtitle.subtitles.forEach(t => {
                  l.zimu.push({
                    src: t.subtitle_url,
                    desc: t.lan_doc
                  });
                });
              }
            }
            if (this.pagesReqState !== "pending") {
              this.waitDown.push(l);
              this.waitDownCache[a.cid] = Object.freeze(l);
              await Pt(150);
            }
          }
        }
        await this.commitWaitDownArr();
      } catch (i) {
        $notify.error(i.message);
        this.revokePagesReq();
      } finally {
        this.pagesReqState = "pending";
      }
    },
    async buildVideoAudioObj(t, e, i, a) {
      let s = [];
      let n = [];
      let o = t.accept_quality;
      let r = t.dash.video.map(t => t.id);
      let A = o.filter(t => !r.includes(t));
      const l = {
        av01: "AV1",
        avc1: "AVC",
        hev1: "HEVC"
      };
      t.dash.video.forEach(t => {
        const i = t.codecs.split(".")[0];
        const a = l[i] || i;
        n.push({
          qnCode: t.id,
          codecs: t.codecs.split(".")[0],
          qnDesc: je(t.id) + " | " + a,
          link: t.backupUrl && t.backupUrl.length ? t.backupUrl.concat(t.baseUrl) : t.baseUrl,
          size: Ht(t.bandwidth * e / 8)
        });
      });
      if (this.user.state && this.user.vip && A.length > 0 && (A.includes(112) || A.includes(116))) {
        for (const t of A) {
          let s = await Ye(i, a, t);
          if (s && s.data && s.data.dash && s.data.dash.video && s.data.dash.video.length > 0) {
            s.data.dash.video.forEach(t => {
              n.push({
                qnCode: t.id,
                codecs: t.codecs.split(".")[0],
                qnDesc: je(t.id) + " | " + t.codecs.split(".")[0],
                link: t.backupUrl && t.backupUrl.length ? t.backupUrl.concat(t.baseUrl) : t.baseUrl,
                size: Ht(t.bandwidth * e / 8)
              });
            });
          }
        }
        n = n.filter((t, e, i) => e === i.findIndex(e => e.qnCode === t.qnCode && e.codecs === t.codecs));
        n = this.sortVideoQnMap(n);
      }
      if (t.dash.flac && t.dash.flac.audio) {
        let i = t.dash.flac.audio;
        s.push({
          qnCode: i.id,
          qnDesc: Te(i.id) + " | " + i.codecs.substring(0, 4),
          codecs: i.codecs,
          link: i.backupUrl && i.backupUrl.length ? i.backupUrl.concat(i.baseUrl) : i.baseUrl,
          size: Ht(i.bandwidth * e / 8)
        });
      }
      if (t.dash.dolby && t.dash.dolby.audio) {
        t.dash.dolby.audio.forEach(t => {
          s.push({
            qnCode: t.id,
            qnDesc: Te(t.id) + " | " + t.codecs.substring(0, 4),
            codecs: t.codecs,
            link: t.backupUrl && t.backupUrl.length ? t.backupUrl.concat(t.baseUrl) : t.baseUrl,
            size: Ht(t.bandwidth * e / 8)
          });
        });
      }
      if (t.dash.audio != null) {
        t.dash.audio.forEach(t => {
          s.push({
            qnCode: t.id,
            qnDesc: Te(t.id) + " | " + t.codecs.substring(0, 4),
            codecs: t.codecs,
            link: t.backupUrl && t.backupUrl.length ? t.backupUrl.concat(t.baseUrl) : t.baseUrl,
            size: Ht(t.bandwidth * e / 8)
          });
        });
      }
      let c = this.selectDefaultQnBySystem(n, s);
      return {
        audioQnMap: s,
        videoQnMap: n,
        qn: c
      };
    },
    sortVideoQnMap(t) {
      const e = ["127", "126", "125", "120", "116", "112", "80", "74", "64", "32", "16", "6"];
      return t.sort((t, i) => e.indexOf(t.qnCode.toString()) - e.indexOf(i.qnCode.toString()));
    },
    selectDefaultQnBySystem(t, e) {
      try {
        let i;
        let a;
        let s;
        let n;
        const o = ae.get(this.setting.videoQn);
        const r = se.get(this.setting.audioQn);
        let A = [];
        for (let [e, l] of t.entries()) {
          const t = l.codecs;
          if (o.includes(l.qnDesc.split("|")[0].trim())) {
            if ((!this.defaultVideoEncoding || t !== this.defaultVideoEncoding) && (!this.remainVideoEncoding || !this.remainVideoEncoding.includes(t))) {
              a = l.qnDesc;
              n = e;
              break;
            }
            if (this.defaultVideoEncoding && t === this.defaultVideoEncoding) {
              a = l.qnDesc;
              n = e;
              break;
            }
            if (this.remainVideoEncoding && this.remainVideoEncoding.includes(t)) {
              A.push({
                videoDesc: l.qnDesc,
                videoIndex: e
              });
            }
          }
        }
        if (!a && !n && !!A.length) {
          a = A[0].videoDesc;
          n = A[0].videoIndex;
        }
        for (let [t, l] of e.entries()) {
          if (r.includes(l.qnDesc.split("|")[0].trim())) {
            i = l.qnDesc;
            s = t;
            break;
          }
        }
        return {
          video: {
            videoDesc: a,
            videoIndex: n
          },
          audio: {
            audioDesc: i,
            audioIndex: s
          }
        };
      } catch (i) {
        $notify.error(i.message);
      }
    },
    resetData() {
      this.pagesReqState = "pending";
      this.checkAll = false;
      this.isIndeterminate = true;
      this.waitDown = [];
      this.waitDownCache = {};
      this.activeName = "";
      this.selectedP = [];
      this.selectPages = [];
      this.bv = "";
      this.p = "";
      this.mediaData.vid = "";
      this.mediaData.upname = "";
      this.mediaData.type = "单视频";
      this.mediaData.idSet.aid = "";
      this.mediaData.idSet.bv = "";
      this.mediaData.idSet.cid = "";
      this.mediaData.title = "";
      this.mediaData.hejiTitle = "";
      this.mediaData.pic = "";
      this.mediaData.pubdate = "";
      this.mediaData.desc = "";
      this.mediaData.duration = "";
      this.mediaData.heji = [];
      this.mediaData.fenp = [];
      this.mediaData.zimu = [];
    },
    updateRemainVideoEncodingVuex() {
      if (!this.defaultVideoEncoding) {
        return;
      }
      const t = {
        av01: ["avc1", "hev1"],
        avc1: ["av01", "hev1"]
      };
      this.$store.commit("updateRemainVideoEncoding", t[this.defaultVideoEncoding] || ["av01", "avc1"]);
    },
    clearNativeLink() {
      this.nativeLink = "";
      this.$refs.searchInput.focus();
      zt("no");
      $notify.close();
    }
  },
  computed: {
    selectTipTitle() {
      return `已选择 [ ${this.selectedP.length} / ${this.selectPages.length} ]`;
    },
    defaultVideoEncoding() {
      return this.setting.videoEncoding;
    },
    ...(0, mapState)(["setting", "user", "remainVideoEncoding", "support"])
  },
  watch: {
    nativeLink() {
      this.resetData();
    },
    defaultVideoEncoding() {
      this.updateRemainVideoEncodingVuex();
    }
  }
};
</script>
