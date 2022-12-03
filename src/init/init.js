import { initState } from "./initState.js";
import { compileToFunction } from "../template-compiler/index.js";
import { mountComponent } from "../lifeCycle/mountComponent.js";
import { mergeOptions } from "../globalApi/mergeOptions.js";
import { callHook } from "../lifeCycle/callHook.js";

export function initMixin(Vue) {
  /* 在这里给Vue原型拓展两个方法 */
  Vue.prototype._init = function (options) {
    // 给生成的实例上挂载$options用于在其他地方获取用户传入的配置
    let vm = this;

    /**
     * options是用户传入的配置项
     * this.constructor.options是全局Vue上的静态options对象
     *
     * Vue.mixin的作用就是将全局的配置项合并成为一个对象，将相同key的值放入一个数组中
     * Vue的实例在初始化的时候会再次将用户自己传入的配置项和之前全局的配置对象二次进行合并
     * 这样做的好处是我们定义的全局Vue的filter、指令、组件component等最终都会挂载到每一个Vue的实例$options属性上
     * 供Vue的实例this进行调用 这就是为什么全局的过滤器、组件在任意地方都可以访问调用的原因
     * 这也是为什么全局的生命周期函数总是在实例之前调用的原因
     */
    vm.$options = mergeOptions(this.constructor.options, options);
    console.log(vm.$options);
    // data未初始化前调用beforeCreate生命周期函数
    callHook(vm, "beforeCreate");

    // 开始初始化options中的各个状态 data - props - methods...
    initState(vm);

    // data初始化完成之后调用created生命周期函数
    callHook(vm, "created");

    // 将模板进行编译 - 生成虚拟DOM - 挂载到真实DOM上
    if (options.el) {
      // 未挂载到DOM上前调用beforeMount生命周期函数
			callHook(vm,'beforeMount');

      vm.$mount(options.el);

      // DOM挂载完成调用mounted生命周期函数
			callHook(vm,'mounted');
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
