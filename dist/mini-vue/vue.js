(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  // 传递过来的是data引用空间
  function observe(data) {
    // 只有对象才可以劫持 如果不是对象 那么不用劫持
    if (_typeof(data) !== 'object' || data === null) return;

    // 如果一个对象的__ob__属性存在并且是Observer的实例 那么说明这个对象已经被观测过了
    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    }
    // new Observer(data)函数调用的过程就是劫持data对象上属性的过程
    return new Observer(data);
  }

  // 观测数组和对象的类
  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // 让__ob__属性的可被遍历属性设置为false 避免被遍历到从而引起死循环
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumrable: false,
        configurable: false
      });
      if (Array.isArray(data)) {
        // 会将数组的7个可修改自身的方法调用进行劫持
        var newArrayProto = createNewArrayProto();
        data.__proto__ = newArrayProto;

        // 会将数组中的对象的属性进行劫持
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    // 遍历对象 对属性依次进行劫持
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          // 单独定义  公共 方便导出 不放在类上 
          defineReactive(data, key, data[key]);
        });
      }

      // 对数组中每一项进行观测
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          observe(item);
        });
      }
    }]);
    return Observer;
  }();
  /**
   * 把对象target上的所有属性重新定义成为响应式数据
   * 为什么不放在类Observer上，为的是将这个方法可以单独导出在其他地方使用
   */
  function defineReactive(target, key, value) {
    // 递归劫持 如果对象的属性值还是一个对象
    observe(value);
    Object.defineProperty(target, key, {
      // 拦截取值操作
      get: function get() {
        console.log('拦截取值操作', key, value);
        return value;
      },
      // 拦截赋值操作
      set: function set(newValue) {
        console.log('拦截存值操作', key, value);
        if (newValue === value) return;

        // 如果新赋的值是一个新的对象 还需要递归劫持
        observe(newValue);
        value = newValue;
      }
    });
  }
  function createNewArrayProto() {
    var oldArrayProto = Array.prototype;
    // 创建一个原型指向数组原型的空对象
    var newArrayProto = Object.create(oldArrayProto);

    // 以下7个方法会改变原数组
    var methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
    methods.forEach(function (method) {
      newArrayProto[method] = function () {
        var _oldArrayProto$method;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        // console.log('监听到调用了数组方法', method);
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));

        // 需要对操作数组方法的时候新增的数据 再次进行劫持
        var inserted;
        switch (method) {
          case 'push':
          case 'unshift':
            inserted = args;
            break;
          case 'splice':
            inserted = args.slice(2);
            break;
        }
        // console.log('inserted', inserted);

        if (inserted) {
          // 对新增的内容再次进行劫持
          this.__ob__.observeArray(inserted);
        }
        return result;
      };
    });
    return newArrayProto;
  }

  /**
   * @param {Object} vm Vue实例对象
   * @param {Object} target 要代理的vm上的目标对象_data = {}
   * @param {Object} key 目标对象的属性 name
   * 实现访问vm.name = 访问vm._data.name
   */
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  /**
   * 1. 获取数据
   * 2. 对获取到的data进行响应式处理
   */
  function initData(vm) {
    var data = vm.$options.data;
    // data可能是函数可能是对象
    data = typeof data === 'function' ? data.call(vm) : data;

    // 将要劫持的对象放在实例上 便于观测效果
    vm._data = data;

    // 对data数据进行响应式处理
    observe(data);

    // 数据代理
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  function initState(vm) {
    var options = vm.$options; // 获取用户传入的选项

    // 初始化的顺序应该是固定的

    if (options.props) {
      initProps(vm);
    }
    if (options.data) {
      initData(vm);
    }
    if (options.methods) ;
    if (options.computed) {
      initComputed(vm);
    }
    if (options.watch) {
      initWatch(vm);
    }
  }

  /**
   * 
   * @param {String} templateString 模板字符串
   * @return {Function} render函数
   */
  function compileToFunction(templateString) {

    /* 
        1. 模板编译第一步：解析HTML模板字符串templateString为AST抽象语法树
    */

    /* 
        2. 模板编译第二步：将AST抽象语法树生成带有_c、_v、_s的字符串
    */

    /* 
        3. 模板编译第三步：将字符串通过new Function生成render函数
    */
  }

  function initMixin(Vue) {
    /* 在这里给Vue原型拓展两个方法 */
    Vue.prototype._init = function (options) {
      // 给生成的实例上挂载$options用于在其他地方获取用户传入的配置
      var vm = this;

      // 将用户传入的options挂载到实例对象上 方便其他地方拿到
      vm.$options = options;

      // 开始初始化options中的各个状态 data - props - methods...
      initState(vm);
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    Vue.prototype.$mount = function (elementSelector) {
      var vm = this;
      var options = vm.$options;
      // 获取挂载的DOM元素节点
      var element = document.querySelector(elementSelector);

      /* 
      编译模板优先级 render - template - el 
      */
      if (!options.render) {
        var templateString;

        // 如果没有传递template属性但是有element
        if (!options.template && element) {
          templateString = element.outerHTML;
        } else {
          templateString = options.template;
        }

        // 确定template模板字符串，进行模板编译得到render函数
        if (templateString) {
          // 核心1：基于确定的模板字符串得到一个render函数
          var render = compileToFunction();

          // 核心2：将render函数挂载到options对象上
          options.render = render;
        }
      }

      // 模板挂载：将data对象中的值挂载到DOM元素上
      // vm.$options中可以获取前面生成的render函数
      // mountComponent(vm, element);
    };
  }

  /* 打包入口文件 */

  // Vue构造函数
  function Vue(options) {
    this._init(options);
  }

  // 给Vue类拓展初始化options的方法
  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
