import Dep from "./dep";

// 传递过来的是data引用空间
export function observe(data) {
  // 只有对象才可以劫持 如果不是对象 那么不用劫持
  if (typeof data !== "object" || data === null) return;

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
    /* 
			这里的data可能是一个数组 也可能是一个对象
			我们除了对数组和对象内部的每一项进行属性劫持
			还需要对数组和对象本身进行依赖收集 用来实现vm.arr.push(xxx)更新视图的效果
			给Observer的实例挂载一个dep属性用来进行依赖收集
		*/
    this.dep = new Dep();

    // 让__ob__属性的可被遍历属性设置为false 避免被遍历到从而引起死循环
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumrable: false,
      configurable: false,
    });

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
    Object.keys(data).forEach((key) => {
      // 单独定义  公共 方便导出 不放在类上
      defineReactive(data, key, data[key]);
    });
  }

  // 对数组中每一项进行观测
  observeArray(data) {
    data.forEach((item) => {
      observe(item);
    });
  }
}

/* 
	递归对数组中的数组本身进行依赖收集
	item.__ob__的值就是一个Observe对象
*/
function dependArray(value) {
  for (const item of value) {
    item.__ob__ && item.__ob__.dep.depend();
    if (Array.isArray(item)) {
      dependArray(item);
    }
  }
}

/**
 * 把对象target上的所有属性重新定义成为响应式数据
 * 为什么不放在类Observer上，为的是将这个方法可以单独导出在其他地方使用
 */
function defineReactive(target, key, value) {
  // 递归劫持 如果对象的属性值还是一个对象
  let childOb = observe(value);

  // 每一个属性key都有一个依赖收集器dep 闭包不销毁
  let dep = new Dep();
  // console.log('dep-key',key,dep);

  Object.defineProperty(target, key, {
    // 拦截取值操作
    get() {
      // console.log(`拦截了属性 ${key} 读取操作，当前属性的值是${value}`);
      /* 
				如果Dep.target有值,则进行依赖收集：
				1. 说明有一个渲染watcher实例调用了get方法执行渲染
				2. 并且将自身实例放在了Dep.target属性上
				3. 那么我们需要让属性依赖收集器dep记住这个watcher
				4. 让属性和watcher产生关联，执行dep.depend方法，属性dep收集到1个watcher
			*/
      if (Dep.target) {
        dep.depend();

        // 让数组和对象本身也实现依赖收集
        if (childOb) {
         childOb.dep.depend();

          //   如果值是数组 需要对数组中的每一个数组本身再执行Observe
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    // 拦截赋值操作
    set(newValue) {
      // console.log(`拦截了属性 ${key} 存值操作，新属性的值是${newValue}`);
      if (newValue === value) return;

      // 如果新赋的值是一个新的对象 还需要递归劫持
      observe(newValue);
      value = newValue;

      // 属性值被修改的时候，当前属性的依赖收集器dep通知其收集的依赖watcher进行更新渲染
      dep.notify();
    },
  });
}

function createNewArrayProto() {
  let oldArrayProto = Array.prototype;
  // 创建一个原型指向数组原型的空对象
  let newArrayProto = Object.create(oldArrayProto);

  // 以下7个方法会改变原数组
  let methods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "sort",
    "reverse",
    "splice",
  ];

  methods.forEach((method) => {
    newArrayProto[method] = function (...args) {
      // console.log('监听到调用了数组方法', method);
      let result = oldArrayProto[method].call(this, ...args);

      // 需要对操作数组方法的时候新增的数据 再次进行劫持
      let inserted;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;
        case "splice":
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

      // 监听到数组调用方法修改了原数组通知对应的watcher 执行视图更新
      this.__ob__.dep.notify();

      return result;
    };
  });

  return newArrayProto;
}
