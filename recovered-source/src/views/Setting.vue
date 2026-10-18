<!--
  Setting — reconstructed from app.asar (Bilidown v1.2.7)
  <template> was decompiled from the compiled render function;
  <script> is the original component options object (identifiers restored).
-->
<template>
<div class="setting">
  <div class="setting-content">
    <div class="setting-menu">
      <span>
        通知
      </span>
      <el-checkbox v-model="setting.soundTip">
        系统提示音
      </el-checkbox>
    </div>
    <div class="setting-menu">
      <span>
        退出
      </span>
      <el-radio-group v-model="setting.tray">
        <el-radio :label="false" @click.native="trayTip">
          退出程序
        </el-radio>
        <el-radio :label="true" @click.native="trayTip">
          最小化到托盘
        </el-radio>
      </el-radio-group>
    </div>
    <div class="setting-menu downdefault">
      <span>
        存储
      </span>
      <div :style="{
  color: folderRenameRule.length ? 'var(--theme-9)' : 'var(--setting-down-default)'
}">
        {{ defaultDownPath }}
      </div>
      <a @click.prevent="selectDefaultDownPath">
        更改
      </a>
      <a @click="openAndEchoFolderRenameRule">
        高级
      </a>
      <a v-show="defaultDownPath != '暂无，点击更改选择'" @click.prevent="openDefaultDownPath">
        打开目录
      </a>
    </div>
    <div class="setting-menu">
      <span>
        功能
      </span>
      <el-checkbox v-model="setting.pic">
        封面
      </el-checkbox>
      <el-checkbox v-model="setting.music">
        音频
      </el-checkbox>
      <el-checkbox v-model="setting.xml">
        XML弹幕
      </el-checkbox>
      <el-checkbox v-model="setting.ass">
        ASS弹幕
      </el-checkbox>
      <el-checkbox v-model="setting.guaxiao">
        刮削
      </el-checkbox>
      <el-tooltip transition :open-delay="240" :disabled="user.state" :placement="tipPlacement">
        <div v-if="!(user.state)" slot="content">
          <p>
            <a style="cursor: pointer" @click="goLogin">
              请登录
            </a>
          </p>
        </div>
        <el-checkbox v-model="setting.zimu" :disabled="!user.state">
          SRT字幕
        </el-checkbox>
      </el-tooltip>
      <el-checkbox v-model="setting.tools">
        辅助工具
      </el-checkbox>
      <el-checkbox v-model="setting.shutdown">
         自动关机 
        <el-tooltip transition :open-delay="240" :placement="tipPlacement">
          <div slot="content">
            <p>
              开启后，下载中全部完成并且待下载为空时提示30秒后自动关机。30秒内支持手动取消关机。
            </p>
          </div>
          <i class="iconfont icon-xiangqing" />
        </el-tooltip>
      </el-checkbox>
      <el-checkbox v-model="setting.listenClipBoard">
        监听剪切板
      </el-checkbox>
    </div>
    <div class="setting-menu">
      <span>
        音质
      </span>
      <el-radio-group v-model="setting.audioQn">
        <el-radio label="64">
          64K
        </el-radio>
        <el-radio label="132">
          132K
        </el-radio>
        <el-radio label="192">
          192K
        </el-radio>
        <el-tooltip v-for="i in audioQnVipMapping" transition :open-delay="240" :disabled="user.vip" :placement="tipPlacement" :key="i.code">
          <div v-if="!(user.state)" slot="content">
            <p>
              <a style="cursor: pointer" @click="goLogin">
                请登录
              </a>
            </p>
          </div>
          <div v-if="user.state && !user.vip" slot="content">
            <p>
              <a style="cursor: pointer" @click="goGetBigMembers">
                B站大会员专享
              </a>
            </p>
          </div>
          <el-radio :disabled="!user.vip" :label="i.code">
            {{ i.text }}
          </el-radio>
        </el-tooltip>
      </el-radio-group>
    </div>
    <div class="setting-menu">
      <span>
        画质
      </span>
      <el-radio-group v-model="setting.videoQn">
        <el-radio label="16">
          360P
        </el-radio>
        <el-radio label="32">
          480P
        </el-radio>
        <el-tooltip v-for="i in videoQnLoginMapping" transition :open-delay="240" :disabled="user.state" :placement="tipPlacement" :key="i.code">
          <div v-if="user.state && !(user.vip)" slot="content">
            <p>
              <a style="cursor: pointer" @click="goGetBigMembers">
                B站大会员专享
              </a>
            </p>
          </div>
          <div v-else slot="content">
            <p>
              <a style="cursor: pointer" @click="goLogin">
                请登录
              </a>
            </p>
          </div>
          <el-radio :disabled="!user.state" :label="i.code">
            {{ i.text }}
          </el-radio>
        </el-tooltip>
        <el-tooltip v-for="i in videoQnVipMapping" transition :open-delay="240" :disabled="user.vip" :placement="tipPlacement" :key="i.code">
          <div v-if="!(user.state)" slot="content">
            <p>
              <a style="cursor: pointer" @click="goLogin">
                请登录
              </a>
            </p>
          </div>
          <div v-if="user.state && !user.vip" slot="content">
            <p>
              <a style="cursor: pointer" @click="goGetBigMembers">
                B站大会员专享
              </a>
            </p>
          </div>
          <el-radio :disabled="!user.vip" :label="i.code">
            {{ i.text }}
          </el-radio>
        </el-tooltip>
      </el-radio-group>
    </div>
    <div class="setting-menu">
      <span>
        编码
      </span>
      <el-radio-group v-model="setting.videoEncoding">
        <el-radio label="avc1">
          AVC 
          <el-tooltip transition :open-delay="240" :placement="tipPlacement">
            <div slot="content">
              <p style="margin-bottom: 4px">
                AVC视频可广泛兼容各种设备和播放器，适用于大多数场景。
              </p>
              <p>
                但它相对较老，压缩效率不如一些新的视频编码标准。
              </p>
            </div>
            <i class="iconfont icon-xiangqing" />
          </el-tooltip>
        </el-radio>
        <el-radio label="av01">
          AV1 
          <el-tooltip transition :open-delay="240" :placement="tipPlacement">
            <div slot="content">
              <p style="margin-bottom: 4px">
                AV1视频格式能显著减小文件大小的同时保持相对较高的质量。
              </p>
              <p>
                但它相对较新，支持有限的播放器和设备。
              </p>
            </div>
            <i class="iconfont icon-xiangqing" />
          </el-tooltip>
        </el-radio>
        <el-radio label="hev1">
          HEVC 
          <el-tooltip transition :open-delay="240" :placement="tipPlacement">
            <div slot="content">
              <p style="margin-bottom: 4px">
                HEVC视频格式能减小文件大小的同时保持相对较高的质量。
              </p>
              <p>
                但它相对较新，支持有限的播放器和设备。
              </p>
            </div>
            <i class="iconfont icon-xiangqing" />
          </el-tooltip>
        </el-radio>
      </el-radio-group>
    </div>
    <div class="setting-menu rename">
      <span>
        命名
      </span>
      <div>
        {{ renameFileNameShow }}
      </div>
      <a @click.prevent="renameDialogVisible = true">
        自定义
      </a>
    </div>
    <div class="setting-menu">
      <span>
        并发
      </span>
      <el-radio-group v-model="setting.maxDownCount">
        <el-radio :label="1">
          1个
        </el-radio>
        <el-radio :label="2">
          2个
        </el-radio>
        <el-radio :label="3">
          3个
        </el-radio>
        <el-radio :label="4">
          4个
        </el-radio>
      </el-radio-group>
    </div>
    <div class="setting-menu updateInfo">
      <span>
        版本
      </span>
      <b-button type="info" round size="small" class="versionDesc" @click="verionDetails">
        {{ version.currentVersion }} 详情 
      </b-button>
      <b-button v-show="version.updateText.length" type="success" round size="mini" class="newVersion" style="margin-left: 10px" @click="updateAlert">
        {{ version.updateText }} 
      </b-button>
    </div>
    <div class="setting-menu systemMenuZanZhu">
      <span>
         微信赞助5毛，请作者吃麻辣王子 
        <svg t="1693142025541" viewBox="0 0 1048 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20496" width="16" height="16" class="icon">
          <path d="M1013.199216 376.850382c-11.459481-68.310411-49.11206-125.905464-105.96299-162.218624-57.595053-36.759633-126.79841-46.730869-194.959997-28.127816-7.73887 2.083542-30.95548 8.482992-43.159083-19.198351-6.697099-15.328916-16.221862-30.360183-29.91371-47.474992-71.584548-89.592304-201.210623-113.106563-301.518285-54.767388-101.051785 58.934472-144.806166 183.798165-101.647083 290.654102 7.441221 18.305404 19.793649 25.597801 38.694351 22.770137 125.310166-18.751878 239.160851-63.101556 338.724392-131.560792 20.240122-13.989496 32.2949-22.174839 43.456732-22.174839 3.125313 0 6.101801 0.595298 9.227114 1.934718 14.287145 6.101801 16.519511 20.984244 20.984244 50.45148l0.595298 4.018259c18.900702 123.375448 64.440976 236.630836 135.579051 336.789674 14.287145 20.091297 23.960732 22.621313 47.77264 12.798901 88.550533-36.908457 145.103814-125.45899 143.913219-225.766653 0-1.637069 0-3.869435-0.148824-6.250626 0-6.101801-0.297649-14.287145-1.637069-22.026015z" fill="#FDCA10" p-id="20497" />
          <path d="M1048.024132 403.489954c0-1.33942 0-3.274137-0.148825-5.35768 0-7.143572-0.297649-16.81716-1.934717-26.788396-13.096549-77.68635-55.957984-143.169097-120.696609-184.691112-65.482747-41.968488-144.210868-53.279144-221.450744-32.146076-1.488244 0.446473-2.67884 0.595298-3.422962 0.744123-0.148824-0.297649-0.446473-0.744122-0.595298-1.33942-7.887695-18.007755-18.751878-35.420213-34.378442-54.916213-82.002258-102.24238-230.082561-129.179601-344.37972-62.506259-115.190105 67.119816-164.897463 209.693615-115.636578 331.729644 13.096549 32.443725 40.182595 48.219114 74.263388 43.010259 130.221372-19.496 248.983263-65.631571 353.755659-137.811418 6.250626-4.315908 12.798901-8.780641 17.710106-11.905954 1.041771 5.506504 2.232366 13.096549 3.422962 20.537771l0.595298 4.018259c19.644824 128.584303 67.119816 246.602072 141.383203 350.927995 15.47774 21.728366 32.146076 32.146076 52.683847 32.146076 10.41771 0 21.87719-2.67884 34.824915-8.036519 101.200609-42.266137 165.79041-143.169097 164.302166-257.019783v-0.744122z m-177.101066 227.254897c-23.663084 9.971236-33.485496 7.292397-47.77264-12.798901-71.138075-100.158838-116.678349-213.414226-135.579052-336.789674l-0.595297-4.018259c-4.464733-29.467236-6.697099-44.349679-20.984244-50.45148-3.125313-1.33942-6.101801-1.934718-9.227115-1.934718-11.161832 0-23.21661 8.334168-43.456732 22.174839-99.56354 68.60806-213.56305 112.808914-338.724391 131.560792-18.900702 2.827664-31.253129-4.315908-38.694351-22.770137-43.159083-106.855937 0.595298-231.868454 101.647082-290.654102C437.695164 6.724036 567.470063 30.089471 639.203436 119.681775c13.691847 17.114809 23.21661 32.146076 29.91371 47.474992 12.203603 27.830167 35.420213 21.430717 43.159083 19.19835 68.012762-18.603053 137.364944-8.631817 194.959997 28.127817 56.85093 36.31316 94.50351 93.908212 105.96299 162.218623 1.33942 7.590046 1.488244 15.924213 1.637069 22.026015 0 2.381191 0 4.613557 0.148824 6.250626 1.190595 100.158838-55.362686 188.858195-143.913219 225.766653z" fill="#492A12" p-id="20498" />
          <path d="M704.090885 813.054772c-16.668336-16.370687-25.597801-31.699603-12.947725-54.767389 20.83542-37.950228 13.245374-71.2869-16.81716-101.944731-25.151328-25.746626-25.746626-41.968488-6.994748-73.221617 4.018259-6.697099 7.292397-12.798901 2.827665-19.942473-6.845924-11.013007-48.516763-13.543023-57.446229-3.869435-19.644824 21.281893-24.258381 53.874442-12.203602 80.960487 6.250626 14.13832 16.668336 25.448977 26.788396 36.461984 16.370687 17.858931 18.900702 37.206106 8.036519 57.743877-19.347175 36.461984-14.287145 66.524518 17.561282 94.205861 21.430717 18.454229 21.281893 40.629068 5.060031 63.845679-17.263633 24.55603-14.882443 30.657832 14.13832 35.420213 5.655328 0.892947 11.459481 1.785893 17.114809 2.530015 10.268885 2.530015 15.775389-4.315908 21.281893-11.013007 28.425465-34.824915 26.937221-73.66809-6.250626-106.409464zM291.103106 490.105769c-9.07829 18.751878-22.174839 32.741374-44.647328 30.806656-38.991999-3.422962-62.803907 13.840672-75.453983 50.153831-7.73887 22.174839-23.960732 33.485496-47.921465 32.741374-31.550778-0.892947-55.511511 11.905954-71.733373 39.438473-8.334168 13.989496-19.049526 25.300152-37.503755 25.300152-8.334168 0-13.691847 4.464733-13.840672 13.245374-0.297649 12.501252 25.89545 38.545526 38.396702 38.545526 27.086045-0.148824 43.903205-16.519511 56.702106-37.503755 9.822412-16.221862 22.770137-26.639572 41.670839-25.89545 42.563786 1.33942 69.501007-18.305404 83.192854-58.041526 6.101801-17.710107 18.900702-26.490748 38.247877-25.002504 7.143572 0.595298 14.584794 0.744122 21.579541-0.446473 28.127816-4.762382 45.093801-23.365435 57.14858-47.623816 8.929466-17.858931-4.762382-28.127816-13.989496-39.289648-15.031267-18.15658-21.728366-17.263633-31.848427 3.869435z" fill="#DA5586" p-id="20499" />
          <path d="M617.028597 870.649824c-2.976489-25.89545-29.467236-47.028518-60.571541-48.665587-17.858931-0.892947-33.931969 5.655328-52.535022 10.864183-1.33942-25.448977 6.845924-45.986747 17.114809-66.078045 8.185343-15.924213 3.422962-24.853679-14.733619-26.193098-6.548275-0.446473-13.096549-0.595298-19.347175-2.083542-15.924213-3.571786-25.300152 2.232366-32.443724 16.965984-18.603053 38.099053-25.89545 76.34693-8.185344 116.529525 3.125313 7.143572 3.720611 13.245374 0.892947 20.537771-12.501252 31.997251-9.375939 63.696854 3.274137 94.949983 15.031267 37.206106 22.621313 41.075541 61.910961 33.039022 18.751878-3.869435 23.21661-12.352427 12.947725-29.020763-8.482992-13.840672-13.989496-28.276641-17.412458-43.903205-2.381191-11.013007-1.488244-16.668336 12.352427-12.203603 16.81716 5.357679 34.229618 4.762382 51.195603-0.892947 28.57429-9.375939 48.516763-37.503755 45.540274-63.845678z m-54.023267 17.412458c-11.75713 5.804153-22.918961 0.297649-31.848427-6.548275-6.548275-5.06003 3.125313-7.292397 4.911206-10.864183 10.268885-7.73887 20.686595-6.994748 29.318412 1.041771 5.208855 4.911206 4.613557 12.798901-2.381191 16.221862zM478.770706 587.883416c0.744122-4.315908 1.785893-8.482992 2.381191-12.7989 3.422962-22.323664 15.47774-36.31316 38.099052-41.819664 13.245374-3.274137 27.086045-6.548275 38.843175-12.947725 28.723114-15.626565 40.331419-41.670839 39.587297-73.965739-0.446473-23.365435-21.579542-22.621313-35.122564-29.318412-16.073038-8.036519-23.21661-2.232366-24.258381 16.668336-2.232366 35.271389-12.501252 49.260885-47.772641 56.404457-40.480244 8.185343-62.952732 30.95548-69.501006 71.882197-5.506504 34.229618-7.441221 34.527267-42.563786 41.075542-40.03377 7.292397-62.803907 34.676091-63.101556 79.323418-6.39945 25.002503 16.221862 29.616061 34.527267 37.354931 18.603053 7.73887 24.853679 3.125313 24.407205-17.114809-0.892947-39.736122 9.07829-53.13032 49.112061-60.125068 31.848427-5.655328 50.302656-22.918961 55.51151-54.618564zM232.615107 707.538254c-35.122564 0-36.461984 1.488244-36.164336 40.480244 0.148824 24.704855 3.274137 27.086045 36.461985 27.086045 30.806656 0 31.253129-0.446473 31.253129-33.783144 0-32.741374-0.892947-33.783145-31.550778-33.783145zM84.534804 432.510717c-10.120061 0-41.37319 31.104305-41.075542 40.777892 0.148824 8.929466 32.741374 41.075541 41.373191 41.075541 8.631817 0 40.926717-32.741374 41.075541-41.37319 0-10.120061-31.104305-40.480244-41.37319-40.331419z" fill="#EA6835" p-id="20500" />
          <path d="M284.406007 846.391443c-33.931969 0-34.378442 0.297649-34.378443 32.890198 0 34.97374 0.595298 35.569038 31.699603 35.717862 33.783145 0 34.527267-0.744122 34.527267-33.039023 0-34.676091-0.744122-35.569038-31.848427-35.569037zM851.575891 735.517246c-10.41771 0.297649-38.991999 30.211358-38.545526 40.182595 0.595298 10.268885 30.509007 39.587297 39.884946 38.991999 10.41771-0.595298 38.545526-30.360183 38.247877-40.331419-0.446473-10.715359-29.318412-39.140824-39.587297-38.843175z" fill="#47CBE9" p-id="20501" />
          <path d="M536.068109 870.649824c-1.785893 3.571786-11.459481 5.804153-4.911206 10.864183 8.929466 6.845924 20.091297 12.352427 31.848427 6.548275 6.994748-3.422962 7.73887-11.310656 2.381191-16.221862-8.631817-8.036519-19.198351-8.929466-29.318412-1.041771z" fill="#F7F1E6" p-id="20502" />
        </svg>
      </span>
      <p>
        <span>
          软件由B站UP主
          <a @click.prevent="openZhouqlWebsiteLink">
            王子周棋洛
          </a>
          一人开发，工作量有点大，不过同
          <a @click.prevent="openBili">
            网站
          </a>
          一样简洁纯净，免费无广告。\^o^/ 
          <a @click="openOfficialWebsite">
            官网
            <img :src="logo" alt />
          </a>
          ，详细使用请查阅
          <a @click="openBilidownPcDoc">
            文档
          </a>
          。
        </span>
      </p>
      <div class="support-charging">
        <img :src="authorFace" alt @click="openZhouqlWebsiteLink" />
        <div class="support-desc">
          <b-button size="mini" type="warning" round leftIcon="iconfont icon-zanzhu" class="zanzhuBtn" @click="zanzhuDetails">
            微信赞助￥0.5 
          </b-button>
        </div>
      </div>
    </div>
    <el-dialog title="自定义文件命名设置" :visible="renameDialogVisible" class="rename-dialog" @update:visible="renameDialogVisible = $event">
      <p class="desc-text">
        此设置用于自定义下载文件名，支持以下变量。点击变量可快速添加到输入框，或手动输入命名规则，保存后即可生效。
      </p>
      <p class="about">
        视频相关
      </p>
      <div class="var-btns">
        <b-button size="minimini" @click="renameFileName += '%title%'">
          视频标题 
          <span class="var-text">
            %title%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%upnn%'">
          up主昵称 
          <span class="var-text">
            %upnn%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%uid%'">
          up主uid 
          <span class="var-text">
            %uid%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%aqn%'">
          音质 
          <span class="var-text">
            %aqn%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%vqn%'">
          画质 
          <span class="var-text">
            %vqn%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%bv%'">
          bv号 
          <span class="var-text">
            %bv%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%cid%'">
          cid号 
          <span class="var-text">
            %cid%
          </span>
        </b-button>
      </div>
      <p class="about">
        日期相关
      </p>
      <div class="var-btns">
        <b-button size="minimini" @click="renameFileName += '%dd%'">
          下载日期 
          <span class="var-text">
            %dd%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%dd:YYYY%'">
          下载年 
          <span class="var-text">
            %dd:YYYY%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%dd:MM%'">
          下载月 
          <span class="var-text">
            %dd:MM%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%dd:DD%'">
          下载日 
          <span class="var-text">
            %dd:DD%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%dd:YYYYMMDD%'">
          下载年月日 
          <span class="var-text">
            %dd:YYYYMMDD%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%pd%'">
          发布日期 
          <span class="var-text">
            %pd%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%pd:YYYY%'">
          发布年 
          <span class="var-text">
            %pd:YYYY%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%pd:MM%'">
          发布月 
          <span class="var-text">
            %pd:MM%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%pd:DD%'">
          发布日 
          <span class="var-text">
            %pd:DD%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%pd:YYYYMMDD%'">
          发布年月日 
          <span class="var-text">
            %pd:YYYYMMDD%
          </span>
        </b-button>
      </div>
      <p class="about">
        排序相关
      </p>
      <div class="var-btns">
        <b-button size="minimini" @click="renameFileName += '%index%'">
          序号 
          <span class="var-text">
            %index%
          </span>
           [建议前置]
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%index:0%'">
          从0开始 
          <span class="var-text">
            %index:0%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%index:00%'">
          从0开始并补零 
          <span class="var-text">
            %index:00%
          </span>
        </b-button>
        <b-button size="minimini" @click="renameFileName += '%index:01%'">
          从1开始并补零 
          <span class="var-text">
            %index:01%
          </span>
        </b-button>
      </div>
      <div class="rename-input">
        <span class="file-name">
          文件名：
        </span>
        <input v-model="renameFileName" maxlength="150" placeholder="请在此输入自定义的文件命名规则" />
        <b-button size="mini" type="info" @click="randomRuleToRename">
          随机生成
        </b-button>
      </div>
      <div class="suggest">
         建议： 
        <span v-html="renamePreview.suggestText" />
      </div>
      <div class="preview">
         预览： 
        <span v-html="renamePreview.previewText" />
      </div>
      <span slot="footer" class="dialog-footer">
        <b-button type="success" size="mini" round @click="updateRenameRule">
          保存
        </b-button>
      </span>
    </el-dialog>
    <el-dialog title="存储高级设置" :visible="folderRenameDialogVisible" class="rename-folder-dialog" @update:visible="folderRenameDialogVisible = $event" @close="closeFoldersRenameDialog">
      <p class="desc-text">
        此设置便于对下载的文件归档，支持以下文件夹变量。若要根据UP主昵称动态创建文件夹，可点击变量按钮快速添加或手动输入自定义配置。支持多个变量组合，保存后即可生效。
      </p>
      <p class="about">
        视频相关
      </p>
      <div class="var-btns">
        <b-button size="minimini" @click="folderRenameRule += '%upnn%'">
          up主昵称 
          <span class="var-text">
            %upnn%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%uid%'">
          up主uid 
          <span class="var-text">
            %uid%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%upnn-uid%'">
          up主昵称-uid 
          <span class="var-text">
            %upnn-uid%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%uid-upnn%'">
          up主uid-昵称 
          <span class="var-text">
            %uid-upnn%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%vtype%'">
          视频类型 
          <span class="var-text">
            %vtype%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%aqn%'">
          音质 
          <span class="var-text">
            %aqn%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%vqn%'">
          画质 
          <span class="var-text">
            %vqn%
          </span>
        </b-button>
      </div>
      <p class="about">
        日期相关
      </p>
      <div class="var-btns">
        <b-button size="minimini" @click="folderRenameRule += '%dd%'">
          下载日期 
          <span class="var-text">
            %dd%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%dd:YYYY%'">
          下载年 
          <span class="var-text">
            %dd:YYYY%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%dd:MM%'">
          下载月 
          <span class="var-text">
            %dd:MM%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%dd:DD%'">
          下载日 
          <span class="var-text">
            %dd:DD%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%dd:YYYYMMDD%'">
          下载年月日 
          <span class="var-text">
            %dd:YYYYMMDD%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%pd%'">
          发布日期 
          <span class="var-text">
            %pd%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%pd:YYYY%'">
          发布年 
          <span class="var-text">
            %pd:YYYY%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%pd:MM%'">
          发布月 
          <span class="var-text">
            %pd:MM%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%pd:DD%'">
          发布日 
          <span class="var-text">
            %pd:DD%
          </span>
        </b-button>
        <b-button size="minimini" @click="folderRenameRule += '%pd:YYYYMMDD%'">
          发布年月日 
          <span class="var-text">
            %pd:YYYYMMDD%
          </span>
        </b-button>
      </div>
      <div class="rename-input">
        <span class="folder-name">
          文件夹变量配置
          <svg t="1727524794309" viewBox="0 0 1043 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8628" width="64" height="64" class="icon">
            <path d="M17.311613 838.831752C1.746067 604.650134 15.020433 373.04077 63.582381 143.650188 77.951233 90.169441 130.401374 40.823892 177.63035 35.530329c181.769806-19.245062 363.539611-23.644299 545.313676-13.19771 47.241752 2.878881 94.8242 52.079634 104.125199 107.872855a2359.251301 2359.251301 0 0 1-9.407467 110.721924" fill="#F2C84B" p-id="8629" />
            <path d="M603.593976 236.187466c115.270215 1.030605 230.540431 4.522739 345.810646 10.467883 56.108364 3.262164 97.626424 48.791918 88.044351 101.625343-28.959156 155.276437-81.379486 318.388881-142.943244 486.522331-21.157218 57.407267-91.144683 109.418762-154.101036 112.617045-211.090951 10.612679-422.181901 5.17432-633.277111-16.319336-62.973387-6.830954-101.804208-56.304264-83.691959-109.201568 51.964649-152.963963 117.378271-313.240113 183.903414-476.923223 23.54209-56.964363 76.84823-105.381515 118.370548-106.510071 41.888567-1.068934 76.162579-1.567201 76.162579-1.57146" fill="#FFE287" p-id="8630" />
            <path d="M770.47111 751.443242m-251.263261 0a251.263262 251.263262 0 1 0 502.526523 0 251.263262 251.263262 0 1 0-502.526523 0Z" fill="#69D19F" p-id="8631" />
            <path d="M736.401515 727.253829h85.173987v148.368827h-85.173987zM736.401515 603.065898h85.173987v63.88049h-85.173987z" fill="#FFFFFF" p-id="8632" />
          </svg>
          ：
        </span>
        <input v-model="folderRenameRule" maxlength="150" placeholder="请在此输入文件夹变量" />
        <b-button size="mini" type="info" @click="randomFolderRuleToRename">
          随机生成
        </b-button>
      </div>
      <div class="suggest">
         建议：
        <span v-html="folderRenamePreview.suggestText" />
      </div>
      <div class="preview oneline">
        <span>
          单视频预览：{{ defaultDownPath }}
        </span>
        <span v-html="folderRenamePreview.singlePreviewText" />
      </div>
      <div class="preview oneline">
        <span>
          合集视频预览：{{ defaultDownPath }}
        </span>
        <span v-html="folderRenamePreview.hejiPreviewText" />
      </div>
      <div class="preview oneline">
        <span>
          分集视频预览：{{ defaultDownPath }}
        </span>
        <span v-html="folderRenamePreview.fenjiPreviewText" />
      </div>
      <div v-if="folderRenamePreview.addCreateFolder" class="preview oneline">
        <span>
          自定义批量类型大于1时，单视频预览：{{ defaultDownPath }}
        </span>
        <span v-html="folderRenamePreview.single2TasksPreviewText" />
      </div>
      <div v-if="folderRenamePreview.addCreateFolder" class="preview oneline">
        <span>
          自定义批量类型大于1时，合集视频预览：{{ defaultDownPath }}
        </span>
        <span v-html="folderRenamePreview.heji2TasksPreviewText" />
      </div>
      <div v-if="folderRenamePreview.addCreateFolder" class="preview oneline">
        <span>
          自定义批量类型大于1时，分集视频预览： {{ defaultDownPath }}
        </span>
        <span v-html="folderRenamePreview.fenji2TasksPreviewText" />
      </div>
      <span slot="footer" class="dialog-footer">
        <b-button type="success" size="mini" round @click="updateFolderRenameRule">
          保存
        </b-button>
      </span>
    </el-dialog>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import { MessageBox } from 'element-ui'
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
const { remote: Ai } = window.require("electron");

const { ipcRenderer: St } = window.require("electron");

const { remote: xt } = window.require("electron");

const { ipcRenderer: Di } = window.require("electron");
const { remote: bi } = window.require("electron");
// @restored:module-decls-end
// @restored:imports-end

const yt = "data:image/webp;base64,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";

const bt = "data:image/webp;base64,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";

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

async function $t() {
  return request.get(`https://zhouql.vip/bdupdate/win32/latest.yml?${new Date().getTime()}`);
}

const ii = `\n<img src="${yt}" style="width: 100%;border-radius: 6px;object-fit: cover;">\n<P>▢ <span style="color: #33a06f;">重要</span> 新版软件已适配服务器目录调整。</P>\n<P>▢ 修复了一些已知问题。</P>\n<p>------------------------------------------------------</p>\n<P>心中虽有千言万语，但手指放在键盘上确实一个字也打不出来(/▽＼)。<br>我很喜欢简单纯净的事物，这个软件也是我心中的样子，希望你能喜欢。<br>小周祝你开心，使用愉快。<svg t="1693142025541" class="icon" viewBox="0 0 1048 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20496" width="16" height="16">\n<path d="M1013.199216 376.850382c-11.459481-68.310411-49.11206-125.905464-105.96299-162.218624-57.595053-36.759633-126.79841-46.730869-194.959997-28.127816-7.73887 2.083542-30.95548 8.482992-43.159083-19.198351-6.697099-15.328916-16.221862-30.360183-29.91371-47.474992-71.584548-89.592304-201.210623-113.106563-301.518285-54.767388-101.051785 58.934472-144.806166 183.798165-101.647083 290.654102 7.441221 18.305404 19.793649 25.597801 38.694351 22.770137 125.310166-18.751878 239.160851-63.101556 338.724392-131.560792 20.240122-13.989496 32.2949-22.174839 43.456732-22.174839 3.125313 0 6.101801 0.595298 9.227114 1.934718 14.287145 6.101801 16.519511 20.984244 20.984244 50.45148l0.595298 4.018259c18.900702 123.375448 64.440976 236.630836 135.579051 336.789674 14.287145 20.091297 23.960732 22.621313 47.77264 12.798901 88.550533-36.908457 145.103814-125.45899 143.913219-225.766653 0-1.637069 0-3.869435-0.148824-6.250626 0-6.101801-0.297649-14.287145-1.637069-22.026015z" fill="#FDCA10" p-id="20497"></path>\n<path d="M1048.024132 403.489954c0-1.33942 0-3.274137-0.148825-5.35768 0-7.143572-0.297649-16.81716-1.934717-26.788396-13.096549-77.68635-55.957984-143.169097-120.696609-184.691112-65.482747-41.968488-144.210868-53.279144-221.450744-32.146076-1.488244 0.446473-2.67884 0.595298-3.422962 0.744123-0.148824-0.297649-0.446473-0.744122-0.595298-1.33942-7.887695-18.007755-18.751878-35.420213-34.378442-54.916213-82.002258-102.24238-230.082561-129.179601-344.37972-62.506259-115.190105 67.119816-164.897463 209.693615-115.636578 331.729644 13.096549 32.443725 40.182595 48.219114 74.263388 43.010259 130.221372-19.496 248.983263-65.631571 353.755659-137.811418 6.250626-4.315908 12.798901-8.780641 17.710106-11.905954 1.041771 5.506504 2.232366 13.096549 3.422962 20.537771l0.595298 4.018259c19.644824 128.584303 67.119816 246.602072 141.383203 350.927995 15.47774 21.728366 32.146076 32.146076 52.683847 32.146076 10.41771 0 21.87719-2.67884 34.824915-8.036519 101.200609-42.266137 165.79041-143.169097 164.302166-257.019783v-0.744122z m-177.101066 227.254897c-23.663084 9.971236-33.485496 7.292397-47.77264-12.798901-71.138075-100.158838-116.678349-213.414226-135.579052-336.789674l-0.595297-4.018259c-4.464733-29.467236-6.697099-44.349679-20.984244-50.45148-3.125313-1.33942-6.101801-1.934718-9.227115-1.934718-11.161832 0-23.21661 8.334168-43.456732 22.174839-99.56354 68.60806-213.56305 112.808914-338.724391 131.560792-18.900702 2.827664-31.253129-4.315908-38.694351-22.770137-43.159083-106.855937 0.595298-231.868454 101.647082-290.654102C437.695164 6.724036 567.470063 30.089471 639.203436 119.681775c13.691847 17.114809 23.21661 32.146076 29.91371 47.474992 12.203603 27.830167 35.420213 21.430717 43.159083 19.19835 68.012762-18.603053 137.364944-8.631817 194.959997 28.127817 56.85093 36.31316 94.50351 93.908212 105.96299 162.218623 1.33942 7.590046 1.488244 15.924213 1.637069 22.026015 0 2.381191 0 4.613557 0.148824 6.250626 1.190595 100.158838-55.362686 188.858195-143.913219 225.766653z" fill="#492A12" p-id="20498"></path>\n<path d="M704.090885 813.054772c-16.668336-16.370687-25.597801-31.699603-12.947725-54.767389 20.83542-37.950228 13.245374-71.2869-16.81716-101.944731-25.151328-25.746626-25.746626-41.968488-6.994748-73.221617 4.018259-6.697099 7.292397-12.798901 2.827665-19.942473-6.845924-11.013007-48.516763-13.543023-57.446229-3.869435-19.644824 21.281893-24.258381 53.874442-12.203602 80.960487 6.250626 14.13832 16.668336 25.448977 26.788396 36.461984 16.370687 17.858931 18.900702 37.206106 8.036519 57.743877-19.347175 36.461984-14.287145 66.524518 17.561282 94.205861 21.430717 18.454229 21.281893 40.629068 5.060031 63.845679-17.263633 24.55603-14.882443 30.657832 14.13832 35.420213 5.655328 0.892947 11.459481 1.785893 17.114809 2.530015 10.268885 2.530015 15.775389-4.315908 21.281893-11.013007 28.425465-34.824915 26.937221-73.66809-6.250626-106.409464zM291.103106 490.105769c-9.07829 18.751878-22.174839 32.741374-44.647328 30.806656-38.991999-3.422962-62.803907 13.840672-75.453983 50.153831-7.73887 22.174839-23.960732 33.485496-47.921465 32.741374-31.550778-0.892947-55.511511 11.905954-71.733373 39.438473-8.334168 13.989496-19.049526 25.300152-37.503755 25.300152-8.334168 0-13.691847 4.464733-13.840672 13.245374-0.297649 12.501252 25.89545 38.545526 38.396702 38.545526 27.086045-0.148824 43.903205-16.519511 56.702106-37.503755 9.822412-16.221862 22.770137-26.639572 41.670839-25.89545 42.563786 1.33942 69.501007-18.305404 83.192854-58.041526 6.101801-17.710107 18.900702-26.490748 38.247877-25.002504 7.143572 0.595298 14.584794 0.744122 21.579541-0.446473 28.127816-4.762382 45.093801-23.365435 57.14858-47.623816 8.929466-17.858931-4.762382-28.127816-13.989496-39.289648-15.031267-18.15658-21.728366-17.263633-31.848427 3.869435z" fill="#DA5586" p-id="20499"></path>\n<path d="M617.028597 870.649824c-2.976489-25.89545-29.467236-47.028518-60.571541-48.665587-17.858931-0.892947-33.931969 5.655328-52.535022 10.864183-1.33942-25.448977 6.845924-45.986747 17.114809-66.078045 8.185343-15.924213 3.422962-24.853679-14.733619-26.193098-6.548275-0.446473-13.096549-0.595298-19.347175-2.083542-15.924213-3.571786-25.300152 2.232366-32.443724 16.965984-18.603053 38.099053-25.89545 76.34693-8.185344 116.529525 3.125313 7.143572 3.720611 13.245374 0.892947 20.537771-12.501252 31.997251-9.375939 63.696854 3.274137 94.949983 15.031267 37.206106 22.621313 41.075541 61.910961 33.039022 18.751878-3.869435 23.21661-12.352427 12.947725-29.020763-8.482992-13.840672-13.989496-28.276641-17.412458-43.903205-2.381191-11.013007-1.488244-16.668336 12.352427-12.203603 16.81716 5.357679 34.229618 4.762382 51.195603-0.892947 28.57429-9.375939 48.516763-37.503755 45.540274-63.845678z m-54.023267 17.412458c-11.75713 5.804153-22.918961 0.297649-31.848427-6.548275-6.548275-5.06003 3.125313-7.292397 4.911206-10.864183 10.268885-7.73887 20.686595-6.994748 29.318412 1.041771 5.208855 4.911206 4.613557 12.798901-2.381191 16.221862zM478.770706 587.883416c0.744122-4.315908 1.785893-8.482992 2.381191-12.7989 3.422962-22.323664 15.47774-36.31316 38.099052-41.819664 13.245374-3.274137 27.086045-6.548275 38.843175-12.947725 28.723114-15.626565 40.331419-41.670839 39.587297-73.965739-0.446473-23.365435-21.579542-22.621313-35.122564-29.318412-16.073038-8.036519-23.21661-2.232366-24.258381 16.668336-2.232366 35.271389-12.501252 49.260885-47.772641 56.404457-40.480244 8.185343-62.952732 30.95548-69.501006 71.882197-5.506504 34.229618-7.441221 34.527267-42.563786 41.075542-40.03377 7.292397-62.803907 34.676091-63.101556 79.323418-6.39945 25.002503 16.221862 29.616061 34.527267 37.354931 18.603053 7.73887 24.853679 3.125313 24.407205-17.114809-0.892947-39.736122 9.07829-53.13032 49.112061-60.125068 31.848427-5.655328 50.302656-22.918961 55.51151-54.618564zM232.615107 707.538254c-35.122564 0-36.461984 1.488244-36.164336 40.480244 0.148824 24.704855 3.274137 27.086045 36.461985 27.086045 30.806656 0 31.253129-0.446473 31.253129-33.783144 0-32.741374-0.892947-33.783145-31.550778-33.783145zM84.534804 432.510717c-10.120061 0-41.37319 31.104305-41.075542 40.777892 0.148824 8.929466 32.741374 41.075541 41.373191 41.075541 8.631817 0 40.926717-32.741374 41.075541-41.37319 0-10.120061-31.104305-40.480244-41.37319-40.331419z" fill="#EA6835" p-id="20500"></path>\n<path d="M284.406007 846.391443c-33.931969 0-34.378442 0.297649-34.378443 32.890198 0 34.97374 0.595298 35.569038 31.699603 35.717862 33.783145 0 34.527267-0.744122 34.527267-33.039023 0-34.676091-0.744122-35.569038-31.848427-35.569037zM851.575891 735.517246c-10.41771 0.297649-38.991999 30.211358-38.545526 40.182595 0.595298 10.268885 30.509007 39.587297 39.884946 38.991999 10.41771-0.595298 38.545526-30.360183 38.247877-40.331419-0.446473-10.715359-29.318412-39.140824-39.587297-38.843175z" fill="#47CBE9" p-id="20501"></path>\n<path d="M536.068109 870.649824c-1.785893 3.571786-11.459481 5.804153-4.911206 10.864183 8.929466 6.845924 20.091297 12.352427 31.848427 6.548275 6.994748-3.422962 7.73887-11.310656 2.381191-16.221862-8.631817-8.036519-19.198351-8.929466-29.318412-1.041771z" fill="#F7F1E6" p-id="20502"></path>\n</svg></P>\n`;

const ni = [{
  text: "1080高码",
  code: "112"
}, {
  text: "1080高帧",
  code: "116"
}, {
  text: "4K",
  code: "120"
}, {
  text: "HDR",
  code: "125"
}, {
  text: "杜比",
  code: "126"
}, {
  text: "8K",
  code: "127"
}];

const oi = [{
  text: "杜比全景声",
  code: "dubi"
}, {
  text: "Hi-Res无损",
  code: "hi"
}];

const ri = [{
  text: "720P",
  code: "64"
}, {
  text: "1080P",
  code: "80"
}];

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

const ui = ["%title%", "UP：%upnn% %title%", "UP主%upnn%的视频 %title% bv号是%bv%", "下载日期：%dd:YYYYMMDD% %title%", "发布日期：%pd:YYYYMMDD% %title%", "小彩蛋 %v% 是隐藏变量哦（软件版本号），嘿嘿，开发者祝你开心啊，朋友。", "%dd:YYYY%年%dd:MM%月%dd:DD%日下载的视频 %title%", "%index%-%title%", "%index:0%-%title%", "%index:00%-%title%", "%index:01%-%title%", "%index:01%-%title%-%upnn%", "%index%-%title%-%upnn%", "%index%-%title%-%upnn%-%aqn%-%vqn%", "%dd%下载的视频+%title% + bv号是+%bv%", "%index%-%title%-%upnn%-%aqn%-%vqn%-%cid%", "%index%-%title%-%upnn%-%aqn%-%vqn%-%cid%-%bv%"];

let hi = -1;

function pi() {
  const t = Math.floor(Math.random() * ui.length);
  if (t === hi) {
    return pi();
  } else {
    hi = t;
    return ui[t];
  }
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

const vi = {
  upnn: "up主昵称",
  uid: "up主uid",
  "upnn-uid": "up主昵称-uid",
  "uid-upnn": "up主uid-昵称",
  aqn: "音质",
  vqn: "画质",
  vtype: "单视频",
  dd: "2024-11-07",
  "dd:YYYY": "2024",
  "dd:MM": "11",
  "dd:DD": "07",
  "dd:YYYYMMDD": "20241107",
  pd: "2018-12-12",
  "pd:YYYY": "2024",
  "pd:MM": "06",
  "pd:DD": "20",
  "pd:YYYYMMDD": "20240620"
};

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
        if (vi.hasOwnProperty(a)) {
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
        value: yi(n)
      });
    } else {
      e[e.length - 1].value += yi(n);
    }
    s++;
  }
  if (a) {
    e.push({
      type: "text",
      value: yi(a)
    });
  }
  if (i && i === true && a === "" && e.length === 0) {
    e = [];
  }
  let n = e.filter(t => t.value !== "");
  n = Mi(n);
  let o = localStorage.getItem("createFolder");
  let r = localStorage.getItem("createFolderAddIndex");
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
        u += "\\<span style=\"color: var(--theme)\">单视频</span>";
        h += "\\<span style=\"color: var(--theme)\">合集视频</span>";
        p += "\\<span style=\"color: var(--theme)\">多集视频</span>";
        m += "\\<span style=\"color: var(--theme)\">单视频</span>";
        g += "\\<span style=\"color: var(--theme)\">合集视频</span>";
        v += "\\<span style=\"color: var(--theme)\">多集视频</span>";
      } else {
        u += `\\<span style="color: var(--theme)">${vi[t.value]}</span>`;
        h += `\\<span style="color: var(--theme)">${vi[t.value]}</span>`;
        p += `\\<span style="color: var(--theme)">${vi[t.value]}</span>`;
        m += `\\<span style="color: var(--theme)">${vi[t.value]}</span>`;
        g += `\\<span style="color: var(--theme)">${vi[t.value]}</span>`;
        v += `\\<span style="color: var(--theme)">${vi[t.value]}</span>`;
      }
    }
  });
  h += "\\<span style=\"color: var(--theme-6)\">合集标题</span>";
  p += "\\<span style=\"color: var(--theme-6)\">分集标题</span>";
  if (A && l) {
    m += "\\<span style=\"color: var(--theme-6)\">01视频标题</span>";
    g += "\\<span style=\"color: var(--theme-6)\">01视频标题</span>";
    v += "\\<span style=\"color: var(--theme-6)\">01视频标题</span>";
  } else if (A) {
    m += "\\<span style=\"color: var(--theme-6)\">视频标题</span>";
    g += "\\<span style=\"color: var(--theme-6)\">视频标题</span>";
    v += "\\<span style=\"color: var(--theme-6)\">视频标题</span>";
  }
  g += "\\<span style=\"color: var(--theme-6)\">合集标题</span>";
  v += "\\<span style=\"color: var(--theme-6)\">分集标题</span>";
  c = t.substring(0, 2) === "%%" ? "<span style=\"color: #f56c6c\">开头如果需要变量，使用%%可能会导致问题！建议使用单个%开始。</span>" : t.includes("%") && n.filter(t => t.type === "var").length === 0 ? "<span style=\"color: #f56c6c\">无效变量，请使用%内置变量名%来表示变量。</span" : w.length !== t.length ? `<span style="color: #e6a23c">建议优化为：${w}</span>` : "<a onclick=\"openExternalLink('https://zhouql.vip/bilidown/doc/bilidown-pc-dynamic-folder.html')\">暂无建议，详细使用文档点我查看。</a>";
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

// @restored:funcs
// yi / Mi（生成器漏掉的两个 module 级函数）
// @restored:removed-duplicate function yi(t) {

// @restored:removed-duplicate function Mi(t) {
// @restored:funcs-end
export default {
  data() {
    return {
      folderRenameDialogVisible: false,
      folderRenameRule: "",
      renameDialogVisible: false,
      renameFileName: "%title%",
      renameFileNameShow: "%title%",
      tipPlacement: "top-start",
      videoQnVipMapping: ni,
      videoQnLoginMapping: ri,
      audioQnVipMapping: oi,
      logo: Object.freeze(bt),
      setting: {
        tray: false,
        pic: true,
        music: true,
        xml: false,
        ass: false,
        guaxiao: false,
        zimu: false,
        soundTip: true,
        maxDownCount: 2,
        videoQn: "16",
        audioQn: "64",
        videoEncoding: "avc1",
        tools: false,
        shutdown: false,
        listenClipBoard: false
      },
      version: {
        updateState: "pending",
        serverVersion: "",
        currentVersion: "",
        updateText: "",
        updateDesc: "",
        newVersion: false
      }
    };
  },
  mounted() {
    let t = localStorage.getItem("renameRule");
    let e = localStorage.getItem("folderRenameRule");
    this.version.currentVersion = bi.app.getVersion();
    setTimeout(() => {
      this.checkUpdate();
    }, 200);
    if (t) {
      this.renameFileName = t;
      this.renameFileNameShow = t;
    }
    if (e) {
      this.folderRenameRule = e;
    }
    if (localStorage.getItem("setting") && localStorage.getItem("setting") != "null") {
      this.setting = JSON.parse(localStorage.getItem("setting"));
    }
  },
  beforeRouteLeave(t, e, i) {
    this.closeDialog();
    this.closeRenameRuleDialog();
    this.closeFoldersRenameDialog();
    i();
  },
  methods: {
    randomRuleToRename() {
      this.renameFileName = pi();
    },
    randomFolderRuleToRename() {
      this.folderRenameRule = Vi();
    },
    updateRenameRule() {
      this.$store.commit("updateRenameRule", this.renamePreview.resultText);
      localStorage.setItem("renameRule", this.renamePreview.resultText);
      this.renameFileNameShow = this.renamePreview.resultText;
      this.closeRenameRuleDialog();
      $notify("保存成功");
    },
    closeRenameRuleDialog() {
      this.renameDialogVisible = false;
    },
    updateFolderRenameRule() {
      this.$store.commit("updateFolderRenameRule", this.folderRenamePreview.resultText);
      localStorage.setItem("folderRenameRule", this.folderRenamePreview.resultText);
      this.folderRenameRule = this.folderRenamePreview.resultText;
      this.closeFoldersRenameDialog();
      $notify("保存成功");
    },
    openAndEchoFolderRenameRule() {
      this.folderRenameRule = "1";
      this.folderRenameRule = localStorage.getItem("folderRenameRule") || "";
      this.folderRenameDialogVisible = true;
    },
    closeFoldersRenameDialog() {
      this.folderRenameDialogVisible = false;
      setTimeout(() => this.folderRenameRule = localStorage.getItem("folderRenameRule") || "", 50);
    },
    closeDialog() {
      try {
        MessageBox.close();
      } catch (t) {}
    },
    trayTip() {
      $notify.info("操作将在下次启动时生效。", 4500);
    },
    goLogin() {
      this.$router.push("/acount");
      zt("yes");
    },
    goGetBigMembers() {
      Ot("https://account.bilibili.com/big");
    },
    verionDetails() {
      this.$alert(ii, `v${this.version.currentVersion} 代号【起风了】 | “纵有疾风起，人生不言弃。”`, {
        showClose: false,
        dangerouslyUseHTMLString: true,
        confirmButtonText: "知道啦",
        customClass: "versionDescAlert"
      }).catch(() => {});
    },
    zanzhuDetails() {
      this.$alert(`<img src="${this.zanzhuCode}" style="width: 100%; border-radius: 6px;object-fit: cover; border:2px solid #ccc;">`, "微信扫码赞助UP \\^o^/", {
        showClose: false,
        showConfirmButton: false,
        dangerouslyUseHTMLString: true,
        closeOnClickModal: true,
        customClass: "zanzhuAlert"
      }).catch(() => {});
    },
    openBilidownPcDoc() {
      Ot("https://zhouql.vip/bilidown/doc/bilidown-pc-questions.html");
    },
    openZhouqlWebsiteLink() {
      Ot("https://zhouql.vip");
    },
    openBili() {
      Ot("https://zhouql.vip/bilidown/");
    },
    openOfficialWebsite() {
      Ot("https://zhouql.vip/bilidown/pc/");
    },
    async checkUpdate() {
      if (!this.version.newVersion) {
        try {
          const t = await $t();
          this.version.serverVersion = t.data.split("\n")[0].split(":")[1].trim();
          this.version.updateDesc = t.data.split("\n")[2].split(":")[1];
          if (this.version.serverVersion != this.version.currentVersion) {
            this.version.updateText = "我更新了，你点不点";
            this.version.newVersion = true;
            this.$store.commit("updateNewVersion", true);
          } else {
            this.version.updateText = "";
            this.version.newVersion = false;
            this.$store.commit("updateNewVersion", false);
          }
        } catch (t) {}
      }
    },
    updateAlert() {
      if (this.version.updateState != "active") {
        this.$alert(`${this.version.updateDesc}`, `新版本${this.version.serverVersion}`, {
          confirmButtonText: "下载更新",
          dangerouslyUseHTMLString: true,
          customClass: "updateAlert",
          callback: t => {
            if (t != "cancel") {
              this.version.updateState = "active";
              this.version.updateText = "正在请求更新，请等待...";
              Di.send("startUpdate");
              Di.on("updateDownProgress", (t, e) => {
                this.version.updateText = `更新中，请勿退出， ${e.toFixed(2)}%`;
                this.$store.commit("updateUpdateProgress", Math.floor(e));
              });
              Di.on("updateDownSuccess", (t, e) => {
                this.$alert(`新版${this.version.serverVersion}已就绪，点击安装开始新版本`, "新版安装提示", {
                  confirmButtonText: "安装",
                  showClose: false,
                  customClass: "startUpdateAlert",
                  callback: t => {
                    if (t != "cancel") {
                      Di.send("updateApp");
                      this.version.updateState = "pending";
                      this.version.updateText = "我更新了，你点不点";
                    }
                  }
                });
              });
            }
          }
        });
      }
    },
    selectDefaultDownPath() {
      bi.dialog.showOpenDialog({
        title: "选择目录",
        defaultPath: this.defaultDownPath,
        buttonLabel: "确定",
        properties: ["openDirectory", "createDirectory"]
      }).then(t => {
        if (!t.canceled && t.filePaths.length > 0) {
          const e = t.filePaths[0];
          localStorage.setItem("defaultDownPath", e);
          this.$store.commit("updateDefaultDownPath", e);
          $notify.success(`默认存储位置已修改：${e}`);
        }
      });
    },
    openDefaultDownPath() {
      jt(this.defaultDownPath, true);
    }
  },
  computed: {
    ...(0, mapState)(["user", "defaultDownPath", "authorFace", "zanzhuCode"]),
    renamePreview() {
      const t = di(this.renameFileName);
      if (t.resultArr.length === 0) {
        this.renameFileName = "%title%";
      }
      return t;
    },
    folderRenamePreview() {
      return wi(this.folderRenameRule);
    }
  },
  watch: {
    setting: {
      deep: true,
      handler(t) {
        this.$store.commit("updateSetting", t);
        localStorage.setItem("setting", JSON.stringify(t));
      }
    },
    "setting.listenClipBoard": {
      handler(t) {
        Di.send("listen-clipboard-status-change", t);
      }
    }
  }
};
</script>
