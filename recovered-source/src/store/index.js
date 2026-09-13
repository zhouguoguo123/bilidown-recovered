import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    support: true,
    authorFace: "",
    zanzhuCode: "",
    ativeRouterName: "",
    defaultDownPath: "",
    renameRule: "",
    folderRenameRule: "",
    user: {
      state: false,
      uname: "",
      face: "",
      vip: false,
      cion: "",
      uid: ""
    },
    updateProgress: 0,
    newVersion: false,
    waitDown: [],
    setting: {},
    remainVideoEncoding: []
  },
  getters: {},
  mutations: {
    updateFolderRenameRule(t, e) {
      t.folderRenameRule = e;
    },
    updateRenameRule(t, e) {
      t.renameRule = e;
    },
    updateRemainVideoEncoding(t, e) {
      t.remainVideoEncoding = e;
    },
    updateActiveRouterName(t, e) {
      t.ativeRouterName = e;
    },
    updateUpdateProgress(t, e) {
      t.updateProgress = e;
    },
    updateNewVersion(t, e) {
      t.newVersion = e;
    },
    updateLoginInfo(t, e) {
      t.user = e;
    },
    updateDefaultDownPath(t, e) {
      t.defaultDownPath = e;
    },
    updateSetting(t, e) {
      t.setting = e;
    },
    modifySetting(t, e) {
      if (e.key && e.value && t.setting[e.key]) {
        t.setting[e.key] = e.value;
      }
    },
    updateWaitDown(t, e) {
      t.waitDown = e;
    },
    updateSupport(t, e) {
      t.support = e;
    },
    updateAFace(t, e) {
      t.authorFace = e;
    },
    updateZanzhuCode(t, e) {
      t.zanzhuCode = e;
    }
  },
  actions: {},
  modules: {}
});
