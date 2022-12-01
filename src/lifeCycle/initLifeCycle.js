import { createElementVNode, createTextVNode } from "../vNode/createNode.js";

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

export function initLifeCycle(Vue) {
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
    const vm = this;
    let vNode= vm.$options.render.call(vm);
    console.log("_render函数执行，生成的虚拟DOM节点为", vNode);
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
    const vm = this;
    const element = vm.$el;

    /**
     * 1. 获取基于vNode虚拟DOM生成的真实DOM节点
     * 2. 将真实DOM节点替换到旧的element元素节点上
     * 3. 将真实DOM节点赋值给实例的$el属性，方便在下一次更新的时候传递oldVNode的时候，参数就是上一次生成的$el属性
     *
     */

    let truthDom = patch(element, vNode);
    vm.$el = truthDom;
    console.log("_update函数执行，执行patch函数渲染虚拟DOM，生成真实DOM",truthDom);
  };

  /* 生成虚拟DOM元素节点 */
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };

  /* 生成虚拟DOM文本节点 */
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
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
  let isRealDomElement = oldVNode.nodeType;

  if (isRealDomElement) {
    // 初始化渲染流程

    const oldElement = oldVNode;
    const parentNode = oldElement.parentNode;
    const newElement = createElement(vNode);

    // 基于最新的vNode虚拟DOM生成的真实DOM节点先插入到旧节点的后面兄弟节点
    parentNode.insertBefore(newElement, oldElement.nextSibling);
    // 然后再将旧节点移除
    parentNode.removeChild(oldElement);
    // 最后返回新的真实DOM节点，挂载到vm.$el上，下次更新的时候直接去vm.$el上获取
    return newElement;
  } else {
    // 基于新旧DOM进行DIFF算法对比
  }
}

/**
 * 将虚拟DOM vNode转化为 真实DOM节点
 * JS对象 ==> HTML Element
 */
function createElement(vNode) {
  let { tag, props, children, text } = vNode;

  // 创建真实元素节点
  if (typeof tag === "string") {
    // 虚拟DOM和真实DOM连接起来,后续如果修改属性了，可以直接找到虚拟节点对应的真实节点修改
    vNode.el = document.createElement(tag);

    // 给节点属性赋值
    patchProps(props, vNode.el);

    // 给节点添加子节点
    children.forEach((childvNode) => {
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
  for (const key in props) {
    if (key === "style") {
      let styleObj = props.style;
      for (const key in styleObj) {
        element.style[key] = styleObj[key];
      }
    } else {
      element.setAttribute(key, props[key]);
    }
  }
}
