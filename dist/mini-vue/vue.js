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
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  /* 
      dep：每一个属性都有的收集器，用来收集该属性对应的所有watcher
      由于1个dep可能对应多个watcher

      dependence是依赖的意思，也就是依赖收集器
      subscribe是订阅者的意思，代表订阅了当前这个属性变化的watcher

      dep实例属性：
      + id 
      1个watcher也可能对应多个dep，所以dep也得有id表示

      + subs
      存放着当前属性所对应的所有watcher

  */
  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++;
      this.subs = [];
    }

    /**
     * 属性getter时：属性的dep对其依赖的watcher进行依赖收集，收集时需要去重
     */
    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        /* 
            这一行代码的作用：
            1. Dep.target是唯一的，它的值是一个读取name属性的watcher
            2. this是当前属性关联的依赖收集器dep的实例
            3. addDep是watcher实例用来记录dep的方法
            4. addSub是dep实例用来进行依赖收集watcher的方法
            5. 会实现双向记录和双向去重的方法
        */
        Dep.target.addDep(this);

        // 无脑push 不会去重 --- this.subs.push(watcher); 
      }

      /**
      * @param {Object} watcher
      * 给属性的dep收集器记录收集了多少个watcher，并将watcher存放在subs数组中
      * 其实就是记录这个属性有多少个组件模板在引用
      */
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }

      /**
       * 属性setter时：属性的dep对其依赖的watcher进行通知，让watcher依次进行更新
       */
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          watcher.update();
        });
      }
    }]);
    return Dep;
  }();
  /* 
      1. 给Dep类添加一个静态属性target，表示依赖收集的目标，初始化为null
      2. 静态属性就代表Dep上只有一份
  */
  Dep.target = null;

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

    // 每一个属性key都有一个依赖收集器dep 闭包不销毁
    var dep = new Dep();
    // console.log('dep-key',key,dep);

    Object.defineProperty(target, key, {
      // 拦截取值操作
      get: function get() {
        // console.log(`拦截了属性 ${key} 读取操作，当前属性的值是${value}`);
        /* 
        	如果Dep.target有值,则进行依赖收集：
        	1. 说明有一个渲染watcher实例调用了get方法执行渲染
        	2. 并且将自身实例放在了Dep.target属性上
        	3. 那么我们需要让属性依赖收集器dep记住这个watcher
        	4. 让属性和watcher产生关联，执行dep.depend方法，属性dep收集到1个watcher
        */
        if (Dep.target) {
          dep.depend(Dep.target);
        }
        return value;
      },
      // 拦截赋值操作
      set: function set(newValue) {
        // console.log(`拦截了属性 ${key} 存值操作，新属性的值是${newValue}`);
        if (newValue === value) return;

        // 如果新赋的值是一个新的对象 还需要递归劫持
        observe(newValue);
        value = newValue;

        // 属性值被修改的时候，当前属性的依赖收集器dep通知其收集的依赖watcher进行更新渲染
        dep.notify();
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

  /* 
      由于Vue2.0中的HTML模板解析是基于正则表达式来实现的，
      所以这个模块专门用来存放所有模板解析过程中遇到的正则表达式。
      从Vue3.0开始摒弃了正则表达式解析模板的方法，而是采用了字符逐个判断的方法来实现的。

      对于任意正则表达式，只有两个功能：
      1. 对一段字符串进行匹配校验，看这个字符串是否符合正则，返回的是布尔值
      2. 找出一段字符串中符合正则校验的内容，也就是正则捕获

      这里面的大多数正则就是为了捕获模板字符串中的开始标签、结束标签、标签属性以及双大括号内部的表达式的。

  */

  /**
   * 1. ncname
   * ncname只是一个字符串，要将字符串转化为正则还需要使用new RegExp进行转换，字符串中的/必须用//表示
   *
   * 用于专门匹配标签名称的正则，注意不是标签全部而是标签名称
   * 比如标准标签：div,h1,p,span等
   * 还有自定义标签：table-el,cmdb-tree,hello.tree
   *
   * 1. 第一位必须以英文字母和下划线
   * 2. 开头后面可能有可能没有，比如b标签这种单字母标签
   * 3. 如果有那么可以是以数字、字母、下划线、中横线-和点.
   */
  var ncname = "[a-zA-Z_][\\-\\.0-9a-zA-Z_]*";

  /**
   * 2. qnameCapture：捕获开始标签和结束标签名称
   *
   * qnameCapture是一个字符串，用在正则中便具有了可以捕获的作用，因为其内部有小括号
   * 专门用来从一串html字符串中捕获匹配到的标签名称分组内容的
   * 这里还考虑到了命名空间的标签比如：<div:hello>
   * 对于这样一个标签<div:hello></div:hello> 这个正则可以捕获到div:hello这个名称
   * 对于这样一个标签<div></div> 这个正则可以捕获到div这个标签名称
   */
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");

  /**
   * 3. startTagOpen：可以匹配到字符串中的开始标签如<div，目的是捕获到开始标签名称div
   *
   * 比如字符串<div></div> 会匹配到<div,分组会捕获到字符串div,这个div就是组成AST抽象语法树的tag属性。
   *
   * 解析正则：
   * 1. 标签必须以<开头
   * 2. 标签名称不可以以数字开头，必须以数字字母瞎下划线开头
   * 3. 标签名称除了首字母之外，还可以是数字、字母、下划线、中横线-和点.
   *    比如自定义标签<_div> <table-el> <div.demo>
   * 4. HTML标签有两种，常见的比如<div>，还有不常见的带有命名空间的标签比如：<div:hello>
   *    在web component中定义的自定义标签会出现这种情况
   *
   */
  var startTagOpen = new RegExp("^<".concat(qnameCapture));

  /**
   * 4. endTag: 专门用来匹配html结束标签的正则，在匹配成功会捕获到结束标签的名称
   * 和开始标签一样，对于</div>这种普通标签，会匹配到</div>，捕获到div
   * 对于<br/>和<hr/>这种自己闭合的标签，会匹配为空，因为会被当做开始标签解析
   */
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));

  /**
   * 5. startTagClose： 专门用来匹配开始标签闭合的正则
   * 比如可以匹配成功 结束标签<div>，会匹配到>符号
   * 比如可以匹配成功 自闭合标签<br/>，会匹配到/>符号
   *
   *
   * \s* 可以有0个或多个空白字符开头
   * (\/?)>  匹配 />
   */
  var startTagClose = /^\s*(\/?)>/;

  /**
   * 6. attribute：专门用来匹配和捕获标签内的属性键值对的正则
   *     由于此正则存在多个分组，但是最终我们需要的是：
   * 第一个分组$1，存放的是属性的key
   * 第三、四、五分组，分别存放的是属性的值
   *
   * 1. ^\s* 可以以空白字符开始
   *
   * 2. ([^\s"'<>\/=]+) 后续不能存在这些特殊字符 可以是除了这些字符的一个或多个字符组成的属性key
   *
   * 3. (?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?
   *      ?: 整体分组是只匹配不捕获的
   *      ?  整体可以出现一次或多次
   *
   *  3.1  \s*(=)\s* 键值对以=号连接，前面左右两边可以有空白字符，比如: name =   job
   *  3.2  () ?:整体分组是只匹配不捕获的
   *      "([^"]*)"+ 左右边都是双引号，中间不是双引号的就可以匹配，比如color="red"
   *      |代表或者的意思
   *      '([^']*)'+ 左右边都是单引号，中间不是单引号的就可以匹配，比如fontSize='18px'
   *      |代表或者的意思
   *      ([^\s"'=<>`]+) 只要不是空白字符 " ' = < > `，其余的任意字符组成的一个或多个单词都可以匹配，比如data-src=demo
   *  3.3 还可以只有属性名没有属性值，比如<input disabled>这种也符合html语法
   */
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

  /**
   * 7. defaultTagReg ： 用来匹配双大括号语法的正则，可以捕获到内部的表达式，全局匹配
   *
   * ((?:.|\r?\n)+?)
   * 最后的?更在量词元字符后面，代表取消正则捕获的贪婪性，只捕获最短的符合条件的字符即可
   * (?:.|\r?\n)+
   * 开头的?:表示对该小分组只匹配不捕获
   * .表示除了\n换行符之外的任意字符
   * 或者
   * \r?\n 0个或一个回车符号后面跟这个换行符
   *
   * {{any char}} 表示可以匹配任意双大括号语法，并且会捕获到里面的表达式
   *
   */
  var defaultTagReg = /\{\{((?:.|\r?\n)+?)\}\}/g;

  /**
   * parseHTML方法 htmlparser2等于手写了
   *
   *
   * 1. 功能：将html语法表达的html模板字符串转化为JS语法表达的AST抽象语法树
   *
   * 2. 解析思路：
   * 不停基于正则对htmlStr进行解析，每次匹配到一部分内容就从原始htmlStr中将其删除
   * 最终等到htmlStr截取为空字符串的时候，标志着模板解析完成。
   * 在解析的过程中会逐渐将AST抽象语法树构建起来。
   */

  var ELEMENT_TYPE = 1;
  var TEXT_TYPE = 3;
  function parseHTML(htmlStr) {
    var root;
    var tagStack = [];
    var currentParent = null;
    var onParseStartTag = function onParseStartTag(tagName, attrs) {
      var astNode = createASTElement(tagName, attrs);
      if (!root) {
        root = astNode;
      }

      // 如果指向栈顶指针有节点 要将当前解析后新建的astNode当做子节点加入到当前节点的children中
      if (currentParent) {
        // astNode的父节点引用指向栈顶
        astNode.parent = currentParent;
        // 父节点将astNode加入子节点数组中 是双向奔赴的行为
        currentParent.children.push(astNode);
      }
      tagStack.push(astNode);
      currentParent = astNode;
    };
    var onParseText = function onParseText(text) {
      text = text.replace(/\s/g, "");
      // 父节点将文本节点加入子节点数组中
      text && currentParent.children.push({
        text: text,
        nodeType: TEXT_TYPE,
        parent: currentParent
      });
    };
    var onParseEndTag = function onParseEndTag(tagName) {
      var topNodeElement = tagStack.pop();
      if (topNodeElement.tag !== tagName) {
        console.error("输入的标签不合法!");
      }
      currentParent = tagStack[tagStack.length - 1];
    };

    /**
     * 将htmlStr字符串从索引为startIndex的地方截取至末尾，并给原始htmlStr字符串赋值
     */
    var advance = function advance(startIndex) {
      htmlStr = htmlStr.slice(startIndex);
    };

    /**
     *  解析开始标签，要求解析的产物是开始标签的名称tagName和开始标签的属性attrs数组
     */
    var parseStartTag = function parseStartTag() {
      var startTagOpenMatchResult = htmlStr.match(startTagOpen);
      if (startTagOpenMatchResult) {
        // console.log("startTagOpenMatchResult", startTagOpenMatchResult);

        // 解析的产物
        var parseResult = {
          tagName: startTagOpenMatchResult[1],
          attrs: []
        };
        advance(startTagOpenMatchResult[0].length);

        // 解析开始标签中的属性和末尾的右尖角号,只要没有遇到结束的右尖角号就一直解析属性
        var attrMatchResult;
        var startTagCloseMatchResult;
        while (!(startTagCloseMatchResult = htmlStr.match(startTagClose)) && (attrMatchResult = htmlStr.match(attribute))) {
          // console.log("attrMatchResult", attrMatchResult);
          advance(attrMatchResult[0].length);
          parseResult.attrs.push({
            name: attrMatchResult[1],
            value: attrMatchResult[3] || attrMatchResult[4] || attrMatchResult[5] || true
          });
        }
        if (startTagCloseMatchResult) {
          advance(startTagCloseMatchResult[0].length);
        }
        return parseResult;
      }
      return false;
    };
    var createASTElement = function createASTElement(tag, attrs) {
      return {
        tag: tag,
        attrs: attrs,
        nodeType: ELEMENT_TYPE,
        parent: null,
        children: []
      };
    };
    while (htmlStr !== "") {
      var textEndIndex = htmlStr.indexOf("<");

      // 开始标签<div> 或者 结束标签</div>
      if (textEndIndex === 0) {
        var startTagParseResult = parseStartTag();
        //  说明当前htmlStr的开头第一个字符是开始标签的<
        if (startTagParseResult) {
          var tagName = startTagParseResult.tagName,
            attrs = startTagParseResult.attrs;
          onParseStartTag(tagName, attrs);
          continue;
        }
        var endTagParseResult = htmlStr.match(endTag);
        //  说明当前htmlStr的开头第一个字符是结束标签的<
        if (endTagParseResult) {
          advance(endTagParseResult[0].length);
          onParseEndTag(endTagParseResult[1]);
          continue;
        }
      }

      // 说明textEndIndex就是标签内部文本结束位置
      if (textEndIndex > 0) {
        var text = htmlStr.slice(0, textEndIndex);
        if (text) {
          onParseText(text);
          advance(text.length);
        }
      }
    }

    // console.log("当前模板字符串 ====>\n", htmlStr === ""); // true 说明解析完成

    // console.log("解析模板的产物AST语法树是 === >\n", root);

    return root;
  }

  /* 
      总体解析思路：

      入口：从<字符的 indexOf返回值开始解析
          =0  解析到了一个开始标签<div>或者结束标签</div>
          >0 

      不能光删 需要边删除边构建AST抽象语法树
      root:{
          tag:"div",
          arrts:[],
          children:[
              {
                  tag:"p",
                  arrts:[],
                  children："你好啊，李银河！"
                  parent:div
              }，
               {
                  tag:"div",
                  arrts:[],
                  children：[
                      {
                          tag:"span",
                          arrts:[],
                          children："span标签"
                          parent:div
                      }
                  ]
                  parent:div
              }
          ],
          parent:null
      }
  */

  /* 
      父子关系的确定 基于栈 这是栈的应用

      当前解析的标签tagName的父亲就是栈顶元素的儿子
      遇到结束标签就出栈
      遇到开始标签就入栈，确定父子关系

      基于正则和while循环进行解析
      基于栈维护关系
      进栈就构建父子关系
      出栈就维护栈顶指针
      出来AST抽象语法树
  */

  /**
   *  generatorProps：专门用于生成属性字符串的方法
   *  输入节点的attrs，返回一个拼接好的属性值组成的字符串
   *  比如输入如下attrs属性数组：
   *  [
   *      {name: 'id', value: 'app'}, 
   *      {name: 'style', value: 'color: pink;font-size: 18px;'}
   *  ];
   *  
   *  返回一个拼接后的propsStr字符串：
   *  {id:"app",style:{"color":"pink","font-size":"18px"}}
   * 
   */
  function generatorProps(attrs) {
    var propsStr = "";
    var _iterator = _createForOfIteratorHelper(attrs),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var attr = _step.value;
        var name = attr.name,
          value = attr.value;
        if (name === 'style') {
          (function () {
            var styleObj = {};

            // 把诸如 value: 'color: pink;font-size: 18px;'中最后一个;切割掉 便于后续拆分字符串为数组
            if (value[value.length - 1] === ";") {
              value = value.slice(0, -1);
            }

            // 继续拆分
            value.split(";").forEach(function (item) {
              var _item$split = item.split(":"),
                _item$split2 = _slicedToArray(_item$split, 2),
                k = _item$split2[0],
                v = _item$split2[1];
              styleObj[k.trim()] = v.trim();
            });
            // console.log('styleObj',styleObj)
            value = styleObj;
          })();
        }
        propsStr += "".concat(name, ":").concat(JSON.stringify(value), ",");
      }

      // console.log("拼接的属性字符串为：",propsStr.slice(0,-1))
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return "{".concat(propsStr.slice(0, -1), "}");
  }
  function generatorChildren(children) {
    if (children.length > 0) {
      return children.map(function (astNode) {
        return generatorChild(astNode);
      }).join(",");
    }
  }
  function generatorChild(astNode) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    if (astNode.nodeType === ELEMENT_TYPE) {
      return codeGenerator(astNode);
    }
    if (astNode.nodeType === TEXT_TYPE) {
      var content = astNode.text;
      if (!defaultTagReg.test(content)) {
        return "_v(".concat(JSON.stringify(content), ")");
      } else {
        // {{name}} hahah
        // xixi {{name}} hahah {{age}} wuwu
        var tokens = [];
        var defaultTagMatchRes;
        var lastIndex = 0;
        defaultTagReg.lastIndex = 0; // 消除全局g正则捕获的懒惰性,避免由于test的判断导致lastIndex发生偏移

        while (defaultTagMatchRes = defaultTagReg.exec(content)) {
          // 获取匹配双大括号的开始索引
          var matchStartIndex = defaultTagMatchRes.index;

          // 说明双大括号前还有文本，那么要将这段文本截取到tokens中用于未来拼接，比如xixi、hahah
          if (matchStartIndex - lastIndex > 0) {
            tokens.push(JSON.stringify(content.slice(lastIndex, matchStartIndex)));
          }

          // 获取捕获结果也就是双大括号中的表达式，需要去除空格之后用_s包裹 name age
          var token = defaultTagMatchRes[1];
          tokens.push("_s(".concat(token.trim(), ")"));

          // 手动修正lastIndex的位置，便于下一次截取非{{}}的字符 
          lastIndex = matchStartIndex + defaultTagMatchRes[0].length;
        }

        // 说明还有文本没有处理完
        if (lastIndex < content.length) {
          tokens.push("".concat(JSON.stringify(content.slice(lastIndex))));
        }
        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }
  function codeGenerator(astTree) {
    // console.log("输入的是AST抽象语法树===>\n",astTree);
    var childrenCode = generatorChildren(astTree.children);
    var code = "_c(\"".concat(astTree.tag, "\",").concat(astTree.attrs.length > 0 ? generatorProps(astTree.attrs) : null).concat(astTree.children.length > 0 ? ",".concat(childrenCode) : "", ")");

    // console.log("返回的是render函数字符串",code);
    return code;
  }

  /* 
      最终生成一个render函数，接收一个函数h当做参数
      render(h){
          return h("div",{id:"app"},h('div',{style:{color:"red"}},_v(_s(name) + 'hello')));
      }

      h方法其实在源码里面就是_c,所以最终我们希望得到一个这样的render函数：
      render(){
          return _c("div",{id:"app"},
              _c('div',{style:{color:"pink"}},_v(_s(name) + 'hello')),
              _c('span',null,_v(_s(age))),
              _c('p',null,_v(_s(address.country)))
          );
      }

      _c("div",{id:"app"},_c("div",{style:{"color":"pink","font-size":"18px"}},_v(_s(name)+"hello")),_c("span",null,_v(_s(age))),_c("p",null,_v(_s(address.country))))

      _c就是createElement(el,attrs,...children)
          el是标签名称
          attrs是属性对象
          后面都是子节点

      _v就是专门渲染表达式的
      _s就是JSON.stringify 对表达式内的变量进行转义，避免出现对象和字符串相加变为[object Object]

      要想得到类似这样的render函数，份两步走：
      1. 先得到一个包含_c、_v和_s方法的字符串
      2. with绑定vm实例，将表达式中的变量进行读取替换，比如将name替换为实例上的'lilei'
      3. 通过new Function(fnString)的方式创建render函数

      创建出来render函数这一步就ok了，就完成任务了，后面就是执行render函数返回vNode虚拟DOM了

      所以我们codeGenerator的任务就是：
      输入astTree这样一个JS对象
      返回的产物是这样一个render函数字符串：其实就是字符串的拼接
      render(){
          return _c("div",{id:"app"},
              _c('div',{style:{color:"pink"}},_v(_s(name) + 'hello')),
              _c('span',null,_v(_s(age))),
              _c('p',null,_v(_s(address.country)))
          );
      }

  */

  /**
   * 
   * @param {String} templateString 模板字符串
   * @return {Function} render函数
   */
  function compileToFunction(templateString) {
    // console.log('原始模板字符串 =====>\n',templateString);

    /* 
        1. 模板编译第一步：解析HTML模板字符串templateString为AST抽象语法树
    */
    var astTree = parseHTML(templateString);

    /* 
        2. 模板编译第二步：将AST抽象语法树生成带有_c、_v、_s的字符串
    */
    var code = codeGenerator(astTree);

    /* 
        3. 模板编译第三步：将字符串通过new Function生成render函数
        如何将代码字符串运行，目前有两种方案：
        + eval()
        + new Function() 
          通过new Function生成函数之后，函数体里面的name、age等变量从this上取值，
        最后调用这个render函数的时候通过call绑定this即可：renderFn.call(vm)
        这样就实现了去vm上取变量name、age等变量了
        */
    var renderBody = "with(this){\n        return ".concat(code, ";\n    }");
    var renderFn = new Function(renderBody);
    return renderFn;
  }

  /* 
      nextTick并没有直接采用某一个API 
      而是采用了优雅降级的方式来实现
      并且这里采用了一个策略模式来实现给timerFunction的赋值

      原则为尽可能快的看到视图发生刷新：
      Promise.resolve()
      MutationObserver
      setImmediate
      setTimeout

  */
  var timerFunction = null;
  function getTimerFunction() {
    if (Promise && typeof Promise === 'function') {
      timerFunction = function timerFunction() {
        Promise.resolve().then(flashCallBacks);
      };
    } else if (MutationObserver) {
      var mutationOb = new MutationObserver(flashCallBacks);
      var textNode = document.createTextNode(1);
      mutationOb.observe(textNode, {
        characterData: true
      });
      timerFunction = function timerFunction() {
        textNode.textContent = 2;
      };
    } else if (setImmediate) {
      timerFunction = function timerFunction() {
        setImmediate(flashCallBacks);
      };
    } else {
      timerFunction = function timerFunction() {
        setTimeout(flashCallBacks, 0);
      };
    }
  }
  getTimerFunction();

  /**
   * 异步批处理
   */
  var callBacks = [];
  var waiting = false;
  function nextTick(callback) {
    console.log('nextTick执行，先缓存callback\n', callback);

    // 异步批处理：先在这里全部缓存起来
    callBacks.push(callback);
    if (!waiting) {
      /* 
          等到时间到了才依次将任务取出执行
          cb() => 
          flushSchedulerQuene() => 
          flushWatcherQuene.forEach(watcher=>{watcher.run();}) =>
          watcher.get() 视图更新
      */
      /*  
           setTimeout(()=>{
               flashCallBacks();
           },0) 
           waiting = true;
       */
      timerFunction();
      waiting = true;
    }
  }

  /* 
      将任务队列中任务取出依次执行
  */
  function flashCallBacks() {
    var cbs = callBacks.slice(0);
    callBacks = [];
    waiting = false;
    cbs.forEach(function (cb) {
      cb();
    });
  }

  var id = 0;
  var Watcher = /*#__PURE__*/function () {
    /* 
          1. vm：需要告诉我当前这个watcher实例是那个vm实例的
          2. fn：当实例上属性变化的时候要执行的渲染函数逻辑 
          3. options 值为true的时候表示要创建一个渲染watcher
          4. deps 存放当前watcher被哪些属性的dep所收集
      */
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      this.renderWatcher = options;
      this.getter = fn;
      this.deps = [];
      this.depsId = new Set();
      this.get();
    }

    /* 
          执行get方法的流程：
          0. 将当前watcher实例放到Dep.target属性上
          1. this.getter();
          2. 调用渲染逻辑updateComponent
          3. 调用_update和_render
          4. 调用_render的时候去vm上读取属性值
          5. 触发getter，判断是否Dep.target有值，如果有值，执行dep依赖收集方法depend
            name => dep.depned => [watcher]
          age => dep.depend => [watcher]
      */
    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // 将watcher实例赋值给Dep.target静态属性
        Dep.target = this;

        // 执行this.getter方法就会读取vm.data上的属性，触发属性的getter，进行依赖收集
        this.getter();

        // 必须清空 否则会导致不被模板依赖的属性发生getter的时候也被收集
        Dep.target = null;
      }

      /**
       * watcher实例记录dep依赖收集器的方法
       *
       * 1. 一个组件(视图)watcher可能对应多个属性，每个属性都有自己的dep
       * 2. 那么也就是说一个watcher应该记录自己被哪些dep所收集了
       * 3. 对于重复的属性，watcher也不用重复记录，比如一个watcher中读取了两次name值
       *    那么会触发两次name的getter
       *    就会触发两次name属性的dep.depend方法
       *    就会触发两次Dep.target.addDep(this);
       *    就等于执行了两次watcher实例的addDep方法；
       *    如果不去重，此watcher实例内部的deps就会记录到重复的name属性的dep
       */
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var depId = dep.id;
        // 基于set去重：如果dep的id没有存在于depIds的set中，那么才进行记录
        if (!this.depsId.has(depId)) {
          // 当前watcher实例对此属性依赖收集器dep 进行记录并且实现了dep的去重
          this.deps.push(dep);
          this.depsId.add(depId);

          // 传递进来的属性依赖收集器dep实例对此watcher也进行依赖收集，间接实现了watcher去重
          dep.addSub(this);
        }
      }

      /* 
        调用update就会执行get方法
        重新走执行get方法的流程如上所示
      */
    }, {
      key: "update",
      value: function update() {
        // --- this.get(); 每次update更新会引起重复的更新 性能浪费 需要将更新操作先缓存
        queneWatcher(this);
      }
    }, {
      key: "run",
      value: function run() {
        this.get();
      }
    }]);
    return Watcher;
  }();
  /**
   * 将需要更新的watcher缓存到队列中
   * @param {*} watcher
   */
  var quene = []; // 缓存即将要更新的watcher队列
  var has = {}; // 基于对象去重
  var pending = false; // 实现防抖
  function queneWatcher(watcher) {
    console.log("queneWatcher执行");
    var id = watcher.id;
    if (!has[id]) {
      // 将需要更新视图的watcher先暂存到队列中
      quene.push(watcher);
      has[id] = true;
      console.log("当前保存watcher的队列为", quene);
      if (!pending) {
        // 同步任务结束之后 依次调用watcher的run方法 然后清空缓存的watcher

        // --- setTimeout(flushSchedulerQuene, 0);
        nextTick(flushSchedulerQuene);
        pending = true;
      }
    }
  }

  /* 
    刷新调度队列
   把缓存在队列中的watcher拿出来，依次执行每一个watcher的更新视图操作
  */
  function flushSchedulerQuene() {
    var flushWatcherQuene = quene.slice(0);

    // 清空队列
    quene = [];
    // 清空缓存
    has = {};
    // 重置pending 防止在下面run的时候产生了新的watcher 可以保证继续放入到队列quene中
    pending = false;

    // 依次执行watcher的run方法更新视图
    flushWatcherQuene.forEach(function (watcher) {
      watcher.run();
    });
  }

  /**
   * 
   * @param {*} vm 实例
   * @param {*} element 根据用户传入的el生成的DOM元素
   */
  function mountComponent(vm, element) {
    // 将element节点挂在vm上 可以在任意vm方法中读取
    vm.$el = element;

    /* 
        1. 执行render函数生成虚拟DOM
        在源码里有一个vm._render方法，调用该方法其实就是调用vm.$options.render方法
        该方法的返回值是一个虚拟DOM对象
          2. 根据虚拟DOM产生真实DOM
        在源码里有一个vm._update方法，调用该方法会将上一步生成的虚拟DOM转化为真实DOM
          3. 将真实DOM插入到DOM节点中
    */

    // 只要一调用updateComponent 就会发生视图重新更新
    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };
    // 第三个参数true表示是一个渲染watcher
    new Watcher(vm, updateComponent, true);
  }

  // 策略对象集 最后会得到key为各生命周期函数名 value为生命周期函数的对象
  var strats = {};
  var LIFECYCLE = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "beforeDestroy", "destroyed"];

  /* 
    这里只是生命周期的策略，后续我们可以自定义任意策略：
    strats.data = function(){};
    strats.computed = function(){};
    strats.watch = function(){};
    ....
  */

  function makeStrats(stratsList) {
    stratsList.forEach(function (hook) {
      strats[hook] = function (oldValue, newValue) {
        if (newValue) {
          if (oldValue) {
            return oldValue.concat(newValue);
          } else {
            return [newValue];
          }
        } else {
          return oldValue;
        }
      };
    });
  }
  makeStrats(LIFECYCLE);

  /**
   * 将用户传入的options和Vue.options合并，并将合并的结果再次赋值给Vue.options
   * @param {*} oldOptions Vue.options全局配置
   * @param {*} newOptions 用户传入的options
   * 
   * {} {created:fn1} => {created:[fn1]}
   * 
   * {created :[fn1]}  {created:fn2} => {created:[fn1,fn2]}
   * 
   */
  function mergeOptions(oldOptions, newOptions) {
    var options = {};

    /* 
    	假设目前定义了a、b、c三种策略，属性d没有策略
    
    	先以oldOptions也就是Vue.options上的key为基准，和当前的newOption进行合并
    	Vue.options = {a:[1],b:[2]}
    	newOptions = {a:3,c:4，d:5}
    	这一轮过后由于以Vue.options上的key为基准，所以只会将属性a和b进行合并
    	而newOptions中的属性c并不会合并，变为：
    	Vue.options = {a:[1,3],b:[2]}
    	这一轮过后所有Vue.options中的key都会被处理，要不创建新数组包裹要不数组合并
    */
    for (var key in oldOptions) {
      mergeField(key);
    }

    /* 
    	再以newOptions上的key为基准，和当前的Vue.options中的key进行合并
    	Vue.options = {a:[1,3],b:[2]}
    	newOptions = {a:3,c:4}
    	在上一轮已经合并过的a属性不会再被合并了，只合并c属性，d属性没有策略直接取newOptions的
    	合并结果为：
    	Vue.options = {a:[1,3],b:[2]，c:[4],d:5}
    */
    for (var _key in newOptions) {
      if (!oldOptions.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    // 策略模式减少if - else 避免写很多if条件
    function mergeField(key) {
      // 有策略优先走策略 说明我定义好了如何处理的策略
      if (strats[key]) {
        options[key] = strats[key](oldOptions[key], newOptions[key]);
      } else {
        // 如果没有策略那么以传入的newOptions中的key的值为主
        options[key] = newOptions[key] || oldOptions[key];
      }
    }
    return options;
  }

  function callHook(vm, hook) {
    var hookList = vm.$options[hook];
    if (Array.isArray(hookList)) {
      // 所有生命周期函数的this都是实例本身
      hookList.forEach(function (hook) {
        return hook.call(vm);
      });
    }
  }

  function initMixin(Vue) {
    /* 在这里给Vue原型拓展两个方法 */
    Vue.prototype._init = function (options) {
      // 给生成的实例上挂载$options用于在其他地方获取用户传入的配置
      var vm = this;

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
        callHook(vm, 'beforeMount');
        vm.$mount(options.el);

        // DOM挂载完成调用mounted生命周期函数
        callHook(vm, 'mounted');
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
          // 核心1：基于确定的模板字符串 模板编译 得到render函数
          var render = compileToFunction(templateString);

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

  /**
   *
   * @param {*} vm 实例
   * @param {*} tag 元素名称
   * @param {*} data data代表元素属性对象
   * @param  {...any} children 元素子节点
   * @returns
   */
  function createElementVNode(vm, tag, data) {
    if (!data) {
      data = {};
    }
    // 这个key就是虚拟DOM diff时的那个key，存在于属性data中
    var key = data.key;

    // 创建元素虚拟节点
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return createVNode(vm, tag, key, data, children, null);
  }

  /**
   *
   * @param {*} vm 实例
   * @param {*} text 文本
   * @param {*} props 属性
   */
  function createTextVNode(vm, text) {
    // 创建元素虚拟节点
    return createVNode(vm, null, null, null, null, text);
  }

  /**
   *
   * @param {*} vm 实例对象
   * @param {*} tag 生成的元素节点名称
   * @param {*} key DOM diff时的ket
   * @param {*} props 生成的元素属性对象
   * @param {*} children 子元素组成的数组
   * @param {*} text 元素的文本
   */
  function createVNode(vm, tag, key, props, children, text) {
    /* 
            问题：虚拟DOM和AST抽象树的区别
    
            AST是语法层面的转换，将html模板语法转化为JS对象，描述的是语法本身，不能自定义的去放置一些自定义的属性。HTML模板是什么转化出来就是什么，AST不仅可以描述html、还可以描述css、es6语法等。
    
            虚拟DOM是用JS语法描述DOM元素对象的，可以使用自定义的属性，比如事件、指令、插槽都可以自定义的去描述。
        */
    return {
      vm: vm,
      tag: tag,
      key: key,
      props: props,
      children: children,
      text: text
    };
  }

  /**
   * Vue核心流程
   * 1. 基于vm.data初始化，创建响应式数据
   * 2. 基于模板编译，生成AST抽象语法树
   * 3. 基于ast语法树，通过代码生成原理生成render函数
   * 4. 执行render函数生成虚拟DOM，在执行的过程中会使用到响应式数据
   * 5. 根据生成虚拟DOM创建出真实DOM节点
   *
   * 之后每次数据更新，无需再进行模板编译到生成render函数的这个耗时过程，因为这个过程涉及到了正则匹配，而是直接执行render函数生成新的虚拟DOM，对比新旧虚拟DOM然后更新视图
   */

  function initLifeCycle(Vue) {
    /**
     *  1. _render方法的返回值：虚拟DOM
     *
     *  2.  _render方法运行时的this
     *  在通过模板AST语法树生成的render函数中,由于使用with绑定了this为目标作用域，而render函数体中的name、age等变量又需要去vm上取值，所以这里使用call绑定vm为render函数运行时的this对象。
     *
     *  3. 执行render函数的时候，里面的_c、_s、_v是没有定义的，所以需要定义这三个函数
     *
     *  4. 执行render函数的时候，会去vm上取属性的值，就会触发getter和setter
     *   触发之后就可以将视图和属性绑定在一起
     */
    Vue.prototype._render = function () {
      var vm = this;
      var vNode = vm.$options.render.call(vm);
      // console.log("_render函数执行，生成的虚拟DOM节点为", vNode);
      return vNode;
    };

    /**
     * _update方法的核心就是将上一步执行render函数生成的虚拟DOM vNode转化为真实DOM
     * 它的核心就是调用一个核心方法patch，通过递归调用createElement方法来生成
     * 真实的元素节点和文本节点
     */
    Vue.prototype._update = function (vNode) {
      /* 
        首次渲染，vm.$el的值是基于用户传入的el获取到的DOM元素对象
        用于将生成的真实DOM替换此DOM元素，同时会在patch完成之后给vm.$el赋值给新的真实DOM
          之后更新，vm.$el的值就变成了上一次生成的真实DOM
      */
      var vm = this;
      var element = vm.$el;

      /**
       * 1. 获取基于vNode虚拟DOM生成的真实DOM节点
       * 2. 将真实DOM节点替换到旧的element元素节点上
       * 3. 将真实DOM节点赋值给实例的$el属性，方便在下一次更新的时候传递oldVNode的时候，参数就是上一次生成的$el属性
       *
       */

      var truthDom = patch(element, vNode);
      vm.$el = truthDom;
      // console.log("_update函数执行，执行patch函数渲染虚拟DOM，生成真实DOM",truthDom);
    };

    /* 生成虚拟DOM元素节点 */
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    /* 生成虚拟DOM文本节点 */
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    /* 将参数进行字符串转义 */
    Vue.prototype._s = function (value) {
      if (!(value instanceof Object)) return value;
      return JSON.stringify(value);
    };
  }

  /**
   * patch方法是Vue中的更新视图的核心方法，Vue2.0、3.0都有
   *
   * patch方法可以用来将虚拟DOM转化为真实DOM
   * pathc方法也可以用来更新视图，DIff算法就走patch
   *
   *
   * @param {*} oldVNode 可能是初渲染的真实DOM，也可能是更新时传入的旧的虚拟DOM
   * @param {*} vNode 执行render函数生成的虚拟DOM对象
   */
  function patch(oldVNode, vNode) {
    // 如果oldVNode是一个真实的DOM元素 那么代表传递进来的是要挂载的DOM节点是初始化渲染
    var isRealDomElement = oldVNode.nodeType;
    if (isRealDomElement) {
      // 初始化渲染流程

      var oldElement = oldVNode;
      var parentNode = oldElement.parentNode;
      var newElement = createElement(vNode);

      // 基于最新的vNode虚拟DOM生成的真实DOM节点先插入到旧节点的后面兄弟节点
      parentNode.insertBefore(newElement, oldElement.nextSibling);
      // 然后再将旧节点移除
      parentNode.removeChild(oldElement);
      // 最后返回新的真实DOM节点，挂载到vm.$el上，下次更新的时候直接去vm.$el上获取
      return newElement;
    }
  }

  /**
   * 将虚拟DOM vNode转化为 真实DOM节点
   * JS对象 ==> HTML Element
   */
  function createElement(vNode) {
    var tag = vNode.tag,
      props = vNode.props,
      children = vNode.children,
      text = vNode.text;

    // 创建真实元素节点
    if (typeof tag === "string") {
      // 虚拟DOM和真实DOM连接起来,后续如果修改属性了，可以直接找到虚拟节点对应的真实节点修改
      vNode.el = document.createElement(tag);

      // 给节点属性赋值
      patchProps(props, vNode.el);

      // 给节点添加子节点
      children.forEach(function (childvNode) {
        vNode.el.appendChild(createElement(childvNode));
      });
    } else {
      // 创建真实文本节点
      vNode.el = document.createTextNode(text);
    }
    return vNode.el;
  }

  /**
   * @param {Object} props 属性组成的对象
   * @param {Object} element 当前属性要挂载的元素节点
   * props:{ id:'app',style:{ color:red}}
   */
  function patchProps(props, element) {
    for (var key in props) {
      if (key === "style") {
        var styleObj = props.style;
        for (var _key in styleObj) {
          element.style[_key] = styleObj[_key];
        }
      } else {
        element.setAttribute(key, props[key]);
      }
    }
  }

  function initGlobalApi(Vue) {
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
    Vue.mixin = function (mixinOptions) {
      this.options = mergeOptions(this.options, mixinOptions);
      // 链式调用
      return this;
    };
  }

  /* 打包入口文件 */

  // Vue构造函数
  function Vue(options) {
    this._init(options);
  }

  // 给Vue类拓展初始化options的方法
  initMixin(Vue);

  // 模板编译 组件挂载
  initLifeCycle(Vue);

  // 全局API
  initGlobalApi(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
