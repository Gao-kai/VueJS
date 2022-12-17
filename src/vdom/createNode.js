/**
 * 判断是否为H5原始标签
 * @param {*} tag 标签名称
 * @returns
 */
function isReservedTag(tag) {
  return ["div", "p", "span", "h1", "h2", "a", "ul", "li",'button'].includes(tag);
}

/**
 *
 * @param {*} vm 实例
 * @param {*} tag 元素名称或者组件名称
 * @param {*} data data代表元素属性对象
 * @param  {...any} children 元素子节点
 * @returns
 */
export function createElementVNode(vm, tag, data, ...children) {
  if (!data) {
    data = {};
  }
  // 这个key就是虚拟DOM diff时的那个key，存在于属性data中
  let key = data.key;

  /* 
    如果是H5原始标签 那么创建原始元素的虚拟节点
    如果是组件名称 比如是my-button这种自定义标签 那么创建组件的虚拟节点
  */
  if (isReservedTag(tag)) {
    return createVNode(vm, tag, key, data, children, null);
  } else {
    // 基于vm.$options.components和tag取出value
    let Ctor = vm.$options.components[tag];
    return createComponentVnode(vm, tag, key, data, children, Ctor);
  }
}

/**
 *
 * @param {*} vm 实例
 * @param {*} tag 组件名称 my-button
 * @param {*} key 组件的key属性 默认为null
 * @param {*} data 组件的属性
 * @param {*} children 组件的子节点数组 其实也就是插槽slot
 * @param {*} Ctor 组件的构造函数
 */
function createComponentVnode(vm, tag, key, data, children, Ctor) {
  /* 
     Ctor可能是一个组件的构造函数 
     也可能是一个包含template属性的对象 如果是对象 需要调用Vue.extend包装为组件的构造函数
     Vue.extend从哪里获取Vue? 通过vm.$options._base
  */
  let CpnConstructor = typeof Ctor === "function" ? Ctor : vm.$options._base.extend(Ctor);

  // 给组件的虚拟节点的data属性上挂载一个回调钩子，用于在创建组件真实DOM的时候回调
  data.hook = {
    // 稍后创建真实节点的时候  如果是组件 则调用此init方法
    init(cpnVNode){
      // 之前将组件的构造函数挂载到了虚拟节点的componentOptions上 方便init回调触发的时候获取构造函数
      let CpnConstructor = cpnVNode.componentOptions.CpnConstructor;

      // new 这个组件的构造函数 获取到组件的实例 并将实例挂载到组件的虚拟节点的componentInstance上
      let instance = cpnVNode.componentInstance = new CpnConstructor();

      /* 
        获取到组件实例接着调用$mount方法
        生成组件的真实DOM并挂载到当前组件实例的$el属性上
        便于后续在生成组件真实DOM时直接通过vNode.componentInstance.$el获取到组件真实DOM
      */
      instance.$mount();
    }
  }
  return createVNode(vm, tag, key, data, children, null,{CpnConstructor});
}

/**
 *
 * @param {*} vm 实例
 * @param {*} text 文本
 * @param {*} props 属性
 */
export function createTextVNode(vm, text) {
  // 创建元素虚拟节点
  return createVNode(vm, null, null, null, null, text);
}

/**
 *
 * @param {*} vm 实例对象
 * @param {*} tag 生成的元素节点名称
 * @param {*} key DOM diff时的key
 * @param {*} props 生成的元素属性对象
 * @param {*} children 子元素组成的数组
 * @param {*} text 元素的文本
 * @param {*} componentOptions 组件的配置对象 内置组件的构造函数
 */
function createVNode(vm, tag, key, props, children, text,componentOptions) {
  /* 
          问题：虚拟DOM和AST抽象树的区别
  
          AST是语法层面的转换，将html模板语法转化为JS对象，描述的是语法本身，不能自定义的去放置一些自定义的属性。HTML模板是什么转化出来就是什么，AST不仅可以描述html、还可以描述css、es6语法等。
  
          虚拟DOM是用JS语法描述DOM元素对象的，可以使用自定义的属性，比如事件、指令、插槽都可以自定义的去描述。
      */
  return {
    vm,
    tag,
    key,
    props,
    children,
    text,
    componentOptions
  };
}
