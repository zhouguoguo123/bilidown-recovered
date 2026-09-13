/**
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
