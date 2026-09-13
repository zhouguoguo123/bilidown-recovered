import Vue from 'vue';
import VueRouter from 'vue-router';
import Search from '../views/Search.vue'
import Setting from '../views/Setting.vue'
import Account from '../views/Account.vue'
import Download from '../views/Download.vue'
import Tools from '../views/Tools.vue'
import $notify from '../plugins/notify'
import store from '../store'

Vue.use(VueRouter);

const routes = [{
  path: "/",
  redirect: "/search"
}, {
  path: "/search",
  name: "search",
  component: Search
}, {
  path: "/setting",
  name: "setting",
  component: Setting
}, {
  path: "/acount",
  name: "acount",
  component: Account
}, {
  path: "/download",
  name: "download",
  component: Download
}, {
  path: "/tools",
  name: "tools",
  component: Tools
}];

const router = new VueRouter({
  routes: routes
});

// keep the active route name in the store and dismiss any open toast
router.beforeEach((t, e, i) => {
  store.commit("updateActiveRouterName", t.name);
  $notify.close();
  i();
});

const originalPush = VueRouter.prototype.push;

// swallow the NavigationDuplicated rejection
VueRouter.prototype.push = function (t) {
  return originalPush.call(this, t).catch(t => t);
};

export default router;
