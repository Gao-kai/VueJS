import {observe} from '../observer/index.js'
import {proxy} from '../observer/proxy.js'

/**
 * 1. 获取数据
 * 2. 对获取到的data进行响应式处理
 */
export function initData(vm) {

	let data = vm.$options.data;
	// data可能是函数可能是对象
	data = typeof data === 'function' ? data.call(vm) : data;

	// 将要劫持的对象放在实例上 便于观测效果
	vm._data = data;
	
	// 对data数据进行响应式处理
	observe(data);

	// 数据代理
	for (let key in data) {
		proxy(vm, '_data', key);
	}

}