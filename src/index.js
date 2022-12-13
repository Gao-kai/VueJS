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

/* 测试DOM DIff的代码 */
import { compileToFunction } from "./template-compiler/index.js";
import { createElement, patch } from "./vdom/patch.js";

let render1 = compileToFunction(`<ul id="1" style="color:red;font-size:16px">
	<li key="a">a</li>
	<li key="b">b</li>
	<li key="c">c</li>
	<li key="d">d</li>
</ul>`);
let vm1 = new Vue({ data: { name: "你好啊，李银河！" } });
let oldVNode = render1.call(vm1);
let oldEl = createElement(oldVNode);
document.body.appendChild(oldEl);

let render2 =
  compileToFunction(`<ul id="2" style="color:yellow;background:pink">
	<li key="b">b</li>
	<li key="m">m</li>
	<li key="a">a</li>
	<li key="p">p</li>
	<li key="c">c</li>
	<li key="q">q</li>
</ul>`);
let vm2 = new Vue({ data: { name: "你好啊，李银河！" } });
let newVNode = render2.call(vm2);
// let newEl = createElement(newVNode);

// 新DOM替换旧DOM
// let parentEl = oldEl.parentNode;

setTimeout(() => {
  /*  
	直接用新节点替换老节点
 	parentEl.insertBefore(newEl, oldEl);
  	parentEl.removeChild(oldEl); 
 */

  patch(oldVNode, newVNode);
}, 1000);

export default Vue;
