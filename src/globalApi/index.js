import { nextTick } from "../observer/nextTick.js";
import { mergeOptions } from "./mergeOptions.js";
import Watcher from "../observer/watcher.js";

export function initGlobalApi(Vue) {
  // 原型挂载核心API
  Vue.prototype.$nextTick = nextTick;

  /* Vue类的静态全局配置对象 方便在任何地方都可以通过 vm.$options._base 拿到Vue类 接着获取到Vue上的所有静态方法 */
  Vue.options = {
    _base:Vue,
  };

  /**
   * 调用 一次mixin，就把选项中的created取出来挂到Vue.options的created数组
   *
   * 将全局的Vue.options对象和用户传入的mixinOptions进行合并
   * 合并完成之后将结果赋值给全局Vue.options对象对应的key的数组上
   * @param {Object} mixinOptions
   */
  Vue.mixin = function (mixinOptions) {
    // this就是Vue构造函数
    this.options = mergeOptions(this.options, mixinOptions);
    // 链式调用返回Vue构造函数
    return this;
  };

  /**
   * 监控某个属性的变化，然后调用回调函数
   * @param {*} exprOrFn 有可能是函数()=>{vm.xxx} 也有可能是字符串vm实例上的属性名'xxx'
   * @param {*} callback 回调函数
   */
  Vue.prototype.$watch = function (exprOrFn, callback, options = {}) {
    console.log(
      `创建watch属性，要监控的属性名为${exprOrFn},回调函数为${callback}`
    );

    /* 
            调用$watch的核心就是调用new Watcher
            1. this就是vm实例
            2. exprOrFn就是需要观察的vm实例上的属性名字符串或者函数，我们会在Watcher中将字符串变为函数
            3. 配置项{user:true}告诉Watcher这是一个用户自定义的watcher
            4. callback 观察的属性发生变化的时候执行的回调函数
        */
    new Watcher(this, exprOrFn, { user: true }, callback);
  };

  /**
   * 根据用户传入的参数options，返回一个Vue的子类
   * 其实这个子类就是组件的构造函数
   * 通过new这个子类然后执行$mount方法就可以实现组件模板的手动挂载
   *
   * @param {*} options 配置项，其中data必须是一个函数
   * @returns Vue的子类
   */
  Vue.extend = function (options) {
    function Sub(options = {}) {
      /* 
                这里的this就是Sub类的实例，通过原型链可以找到Vue原型上的_init方法
                执行_init方法就会对当前实例进行一系列初始化操作，比如：
                1. 合并配置项mergeOptions
                2. 注入钩子函数
                3. initState初始化各类状态比如data、computed、watch等
            */
      this._init(options);
    }

    /* 
            实现继承：基于 Object.create API
            让子类的原型对象指向一个空对象，这个空对象的__proto__指向Vue.prototype
            注意需要在继承结束之后将子类的constructor属性指向子类本身，否则会自动指向父类
        */
    Sub.prototype = Object.create(Vue.prototype);
    Sub.prototype.constructor = Sub;
    
    /* 
            每次使用Vue.extend创建一个组件的构造函数时
            都会将全局的options和用户调用Vue.extend时传入的options进行合并

            1. Vue.options中包含了全局组件components、指令directives、filters等
            2. Vue.extend时传入的options中包含了局部组件components、指令directives、filters等

            将两者合并后的对象放在Sub.options上面
            便于用户在new这个Sub的时候，第二次通过mergeOptions合并其new的时候传入的自定义options
            保证之后new Sub得到的实例上一定可以访问到全局的组件 指令 过滤器等

            组件的合并策略：先查找自己的，后查找全局的
        */
    Sub.options = mergeOptions(Vue.options, options);

    return Sub;
  };




  /**
   * 保存全局组件的定义，将组件id和组件的定义definition关联起来
   * @param {*} id 全局组件的唯一名称name
   * @param {*} definition 全局组件的定义
   *
   * definition可以是Vue.extend()的返回值 ：Vue.extend({template: "<button>全局组件的按钮</button>"})
   * definition也可以是参数对象options: {template: "<button>全局组件的按钮</button>"}，此时会包装为构造函数
   */
  Vue.options.components = {};
  Vue.component = function (id, definition) {
    // 如果definition已经是一个类(函数) 那么说明用户已经调用了Vue.extend对其进行了包装
    definition =
      typeof definition === "function" ? definition : Vue.extend(definition);
    Vue.options.components[id] = definition;
  };
}
