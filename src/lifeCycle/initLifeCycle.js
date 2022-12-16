import { createElementVNode, createTextVNode } from "../vdom/createNode.js";
import { patch } from "../vdom/patch.js";

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
    const vm = this;
    const element = vm.$el;
    const prevVnode = vm._vNode;
    /* 
      把组件首次渲染产生的虚拟节点保存在vm._vNode上
      那么以后每次渲染就可以基于旧的虚拟DOM和当前新的虚拟DOM进行patch对比然后渲染
    */
    vm._vNode = vNode;

    /**
     * 1. 获取基于vNode虚拟DOM生成的真实DOM节点
     * 2. 将真实DOM节点替换到旧的element元素节点上
     * 3. 将真实DOM节点赋值给实例的$el属性，方便在下一次更新的时候传递oldVNode的时候，参数就是上一次生成的$el属性
     *  
     * 当prevVnode存在，说明不是第一次渲染，此时需要新旧节点的diff对比，然后在对比的过程中更新节点
     * 当prevVnode不存在，说明是首次渲染，此时只需要将虚拟DOM通过createElement方法转化为真实DOM之后然后进行挂载即可
     */
    if(prevVnode){
      vm.$el = patch(prevVnode,vNode);
    }else{
      let truthDom = patch(element, vNode);
      vm.$el = truthDom;
    }
    
    // console.log("_update函数执行，执行patch函数渲染虚拟DOM，生成真实DOM",truthDom);
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


