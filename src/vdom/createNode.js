/**
 *
 * @param {*} vm 实例
 * @param {*} tag 元素名称
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

  // 创建元素虚拟节点
  return createVNode(vm, tag, key, data, children, null);
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
    vm,
    tag,
    key,
    props,
    children,
    text,
  };
}
