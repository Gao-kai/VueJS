/* 打包入口文件 */
import { initMixin } from "./init/init.js";
import { initLifeCycle } from "./lifeCycle/initLifeCycle.js";
import { initGlobalApi } from "./globalApi/index.js";

// Vue构造函数
function Vue(options) {
  this._init(options);
}

// 给Vue类拓展初始化options的方法
initMixin(Vue);

// 模板编译 组件挂载 vm._update vm._render方法 patch方法
initLifeCycle(Vue);

// 全局API Vue.mixin nexttick和$watch
initGlobalApi(Vue);


export default Vue;
