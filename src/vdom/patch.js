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
export function patch(oldVNode, newVNode) {
  // 如果oldVNode是一个真实的DOM元素 那么代表传递进来的是要挂载的DOM节点是初始化渲染
  let isRealDomElement = oldVNode.nodeType;

  if (isRealDomElement) {
    // 初始化渲染流程

    const oldElement = oldVNode;
    const parentNode = oldElement.parentNode;
    const newElement = createElement(newVNode);

    // 基于最新的newVNode虚拟DOM生成的真实DOM节点先插入到旧节点的后面兄弟节点
    parentNode.insertBefore(newElement, oldElement.nextSibling);
    // 然后再将旧节点移除
    parentNode.removeChild(oldElement);
    // 最后返回新的真实DOM节点，挂载到vm.$el上，下次更新的时候直接去vm.$el上获取
    return newElement;
  } else {
    /* 
        基于新旧DOM进行DIFF算法对比
        1. 新节点和旧节点不是同一个节点，比如一个是div一个是p，那么直接删除旧节点替换新节点(不进行对比)
        2. 两个节点是同一个节点（如何确定：节点的tag和key一样）那么比较两个节点的属性是否有差异（复用老节点 将差异的属性更新）
        3. 节点比较完成之后就比较新旧节点的儿子节点
    */
    console.log("oldVNode", oldVNode);
    console.log("newVNode", newVNode);

    /* 1. 新节点和旧节点不是同一个节点，比如一个是div一个是p，那么直接删除旧节点替换新节点(不进行对比)  */
    if(!isSameVNode(oldVNode,newVNode)){
        // 基于旧的虚拟DOM节点的el属性获取到真实DOM节点，然后获取其父节点调用replaceChild完成直接替换
        const parentEl = oldVNode.el.parentNode;
        // 将新节点的虚拟DOM转化为真实元素
        const newEl = createElement(newVNode);
        // 完成替换
        parentEl.replaceChild(newVNode.el,oldVNode.el);
        // 为了让方法保持一致的返回值 统一返回更新后的新节点的真实DOM
        return newEl
    }


    let el = newVNode.el = oldVNode.el; // 因为新旧节点相同，那么进行复用
    /* 
        代码走到这里 说明新旧节点是一定相等的
        1. 如果新旧节点相等，并且节点的tag是undefiend 那么该新旧节点都是文本 我们期望对比文本的内容 
    */
    if(!oldVNode.tag){
        // 如果新旧节点文本不一致 那么用新节点文本替换旧节点的文本部分
        if(oldVNode.text !== newVNode.text){
            el.textContent = newVNode.text;
        }
    }

  }
}

/**
 * 
 * @param {*} oldVNode 旧的虚拟DOM节点
 * @param {*} newVNode 新的虚拟DOM节点
 */
function isSameVNode(oldVNode,newVNode){
    return oldVNode.tag === newVNode.tag && oldVNode.key === newVNode.key;
}


/**
 * 将虚拟DOM vNode转化为 真实DOM节点
 * JS对象 ==> HTML Element
 */
export function createElement(vNode) {
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
export function patchProps(props, element) {
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
