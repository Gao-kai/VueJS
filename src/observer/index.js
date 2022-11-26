// 传递过来的是data引用空间
export function observe(data) {
	// 只有对象才可以劫持 如果不是对象 那么不用劫持
	if (typeof data !== 'object' || data === null) return;

	// 如果一个对象的__ob__属性存在并且是Observer的实例 那么说明这个对象已经被观测过了
	if (data.__ob__ instanceof Observer) {
		return data.__ob__;
	}
	// new Observer(data)函数调用的过程就是劫持data对象上属性的过程
	return new Observer(data);
}

// 观测数组和对象的类
class Observer {
	constructor(data) {
		// 让__ob__属性的可被遍历属性设置为false 避免被遍历到从而引起死循环
		Object.defineProperty(data, '__ob__', {
			value: this,
			enumrable: false,
			configurable: false
		})

		if (Array.isArray(data)) {
			// 会将数组的7个可修改自身的方法调用进行劫持
			let newArrayProto = createNewArrayProto();
			data.__proto__ = newArrayProto;
			
			// 会将数组中的对象的属性进行劫持
			this.observeArray(data);
		} else {
			this.walk(data);
		}
	}

	// 遍历对象 对属性依次进行劫持
	walk(data) {
		Object.keys(data).forEach(key => {
			// 单独定义  公共 方便导出 不放在类上 
			defineReactive(data, key, data[key]);
		})
	}

	// 对数组中每一项进行观测
	observeArray(data) {
		data.forEach(item => {
			observe(item);
		})
	}

}


/**
 * 把对象target上的所有属性重新定义成为响应式数据
 * 为什么不放在类Observer上，为的是将这个方法可以单独导出在其他地方使用
 */
function defineReactive(target, key, value) {
	// 递归劫持 如果对象的属性值还是一个对象
	observe(value);
	
	Object.defineProperty(target, key, {
		// 拦截取值操作
		get() {
			console.log('拦截取值操作', key, value);
			return value;
		},
		// 拦截赋值操作
		set(newValue) {
			console.log('拦截存值操作', key, value);
			if (newValue === value) return;

			// 如果新赋的值是一个新的对象 还需要递归劫持
			observe(newValue);
			value = newValue;
			
		}
	})
}


function createNewArrayProto() {
	let oldArrayProto = Array.prototype;
	// 创建一个原型指向数组原型的空对象
	let newArrayProto = Object.create(oldArrayProto);

	// 以下7个方法会改变原数组
	let methods = [
		'push',
		'pop',
		'shift',
		'unshift',
		'sort',
		'reverse',
		'splice'
	]

	methods.forEach(method => {
		newArrayProto[method] = function(...args) {
			// console.log('监听到调用了数组方法', method);
			let result = oldArrayProto[method].call(this, ...args);

			// 需要对操作数组方法的时候新增的数据 再次进行劫持
			let inserted;
			switch (method) {
				case 'push':
				case 'unshift':
					inserted = args;
					break;
				case 'splice':
					inserted = args.slice(2);
					break;
				default:
					break;
			}
			// console.log('inserted', inserted);

			if (inserted) {
				// 对新增的内容再次进行劫持
				this.__ob__.observeArray(inserted);
			}

			return result;
		}
	})

	return newArrayProto;
}
