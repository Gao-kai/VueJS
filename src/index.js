/* 打包入口文件 */
import {
	initMixin
} from './init/init.js';



// Vue构造函数
function Vue(options) {
	this._init(options);
}


// 给Vue类拓展初始化options的方法
initMixin(Vue);




export default Vue;
