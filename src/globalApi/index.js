import {nextTick} from '../observer/nextTick.js';
import {mergeOptions} from "./mergeOptions.js";
import Watcher from "../observer/watcher.js"

export function initGlobalApi(Vue) {
    // 原型挂载核心API
	Vue.prototype.$nextTick = nextTick;

    /* Vue类的静态全局配置对象 */
	Vue.options = {};

    /**
	 * 调用 一次mixin，就把选项中的created取出来挂到Vue.options的created数组
	 * 
	 * 将全局的Vue.options对象和用户传入的mixinOptions进行合并
	 * 合并完成之后将结果赋值给全局Vue.options对象对应的key的数组上
	 * @param {Object} mixinOptions
	 */
    Vue.mixin = function(mixinOptions){
        // this就是Vue构造函数
        this.options = mergeOptions(this.options,mixinOptions);
        // 链式调用返回Vue构造函数
        return this;
    }

    /**
     * 监控某个属性的变化，然后调用回调函数
     * @param {*} exprOrFn 有可能是函数()=>{vm.xxx} 也有可能是字符串vm实例上的属性名'xxx'
     * @param {*} callback 回调函数
     */
    Vue.prototype.$watch = function(exprOrFn,callback,options = {}){
        console.log(`创建watch属性，要监控的属性名为${exprOrFn},回调函数为${callback}`);

        /* 
            调用$watch的核心就是调用new Watcher
            1. this就是vm实例
            2. exprOrFn就是需要观察的vm实例上的属性名字符串或者函数，我们会在Watcher中将字符串变为函数
            3. 配置项{user:true}告诉Watcher这是一个用户自定义的watcher
            4. callback 观察的属性发生变化的时候执行的回调函数
        */
        new Watcher(this,exprOrFn,{user:true},callback);
    }
}