import { initState } from "./initState.js";
import { compileToFunction } from "../template-compiler/index.js";
import {mountComponent} from '../lifeCycle/mountComponent.js'

export function initMixin(Vue) {
  /* 在这里给Vue原型拓展两个方法 */
  Vue.prototype._init = function (options) {
    // 给生成的实例上挂载$options用于在其他地方获取用户传入的配置
    let vm = this;

    // 将用户传入的options挂载到实例对象上 方便其他地方拿到
    vm.$options = options;

    // 开始初始化options中的各个状态 data - props - methods...
    initState(vm);

    if (options.el) {
      vm.$mount(options.el);
    }
  };

  Vue.prototype.$mount = function (elementSelector) {
    let vm = this;
    let options = vm.$options;
    // 获取挂载的DOM元素节点
    let element = document.querySelector(elementSelector);

    /* 
			编译模板优先级 render - template - el 
		*/
    if (!options.render) {
      let templateString;

      // 如果没有传递template属性但是有element
      if (!options.template && element) {
        templateString = element.outerHTML;
      } else {
        templateString = options.template;
      }

      // 确定template模板字符串，进行模板编译得到render函数
      if (templateString) {
        // 核心1：基于确定的模板字符串 模板编译 得到render函数
        const render = compileToFunction(templateString);
		
        // 核心2：将render函数挂载到options对象上
        options.render = render;
      }
    }

    
    /**
     * 组件的挂载
     * 
     * 1. 执行上一步模板编译时生成的render函数，得到一个虚拟DOM对象
     * 2. 将虚拟DOM对象更新到element 真实DOM元素上
     * 3. render函数已经在上一步模板编译完成之后挂载到了options对象上，通过参数vm.$options获取
     * 
     */
    mountComponent(vm, element);
  };
}
