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
    return patchVNode(oldVNode, newVNode);
  }
}

/**
 * 检查新旧虚拟DOM节点是否相同 节点的tag和key一样
 * @param {*} oldVNode 旧的虚拟DOM节点
 * @param {*} newVNode 新的虚拟DOM节点
 */
function isSameVNode(oldVNode, newVNode) {
  return oldVNode.tag === newVNode.tag && oldVNode.key === newVNode.key;
}

/**
 * 对比新旧虚拟DOMnono并且返回更新后的新的DOM节点
 * @param {*} oldVNode 旧的虚拟DOM节点
 * @param {*} newVNode 新的虚拟DOM节点
 */
function patchVNode(oldVNode, newVNode) {
  /* 
      1：新节点和旧节点不是同一个节点
      比如一个是div一个是p，那么直接删除旧节点替换新节点(不进行对比)
   */
  if (!isSameVNode(oldVNode, newVNode)) {
    // 基于旧的虚拟DOM节点的el属性获取到真实DOM节点，然后获取其父节点调用replaceChild完成直接替换
    const parentEl = oldVNode.el.parentNode;
    // 将新节点的虚拟DOM转化为真实元素
    const newEl = createElement(newVNode);
    // 完成替换
    parentEl.replaceChild(newVNode.el, oldVNode.el);
    // 为了让方法保持一致的返回值 统一返回更新后的新节点的真实DOM
    return newEl;
  }

  /* 
    代码走到这里说明新旧节点的tag和key是一定相等的，剩下的就应该对比三个地方：
    1. 文本
    2. 属性
    3. 子节点
  */

  // 因为新旧节点相同，那么可以进行复用
  let el = (newVNode.el = oldVNode.el);

  /* 
      2：新节点和旧节点是同一个节点并且他们都是文本节点
      也就是tag都是undefiend 符合节点相等的特点
      此时我们要对比文本的内容然后只更旧节点的文本内容
   */
  if (!oldVNode.tag) {
    // 如果新旧节点文本不一致 那么用新节点文本替换旧节点的文本部分
    if (oldVNode.text !== newVNode.text) {
      el.textContent = newVNode.text;
    }
  }

  /* 
    3. 如果不是文本节点并且节点相同 那么应该对比节点的属性
  */
  patchProps(el, oldVNode.props, newVNode.props);

  /* 
    4. 对比两个节点的儿子节点，对比策略是：
    一个有子节点一个没有子节点
    两个都有子节点
  */
  let oldChildren = oldVNode.children || [];
  let newChildren = newVNode.children || [];

  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 实现完整的DIff算法 需要对比两个节点的子节点
    updateChildren(el, oldChildren, newChildren);
  } else if (newChildren.length > 0 && oldChildren.length == 0) {
    // 新节点有子节点 老节点没有子节点 那么直接将新节点的子节点挂载到le上
    mountChildren(el, newChildren);
  } else if (oldChildren.length > 0 && newChildren.length == 0) {
    // 旧节点有子节点 新节点没有子节点 那么直接将旧节点的所有子节点从el上移除即可
    unMountChildren(el, oldChildren);
  }

  // 返回更新后的真实DOM节点
  return el;
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
    patchProps(vNode.el, {}, props);

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
 * 更新节点的属性，并且对相同属性名的更新进行复用，比如color:red和color:blue只更新属性值，而不是先将
 * 属性color删除，然后再新建属性color赋值给blue
 *
 * @param {Object} element 当前属性要挂载的元素节点
 * @param {Object} oldProps 旧的虚拟DOM节点的props对象 初始化时为空{}
 * @param {Object} newProps 新的虚拟DOM节点的props对象
 *
 * 一个vNode的props中的属性来源两个部分：props:{ id:'app',style:{ color:red}}
 * 1. 节点的style属性，多和样式有关
 * 2. 节点的attribute属性，比如id、key、disbaled等
 *
 * 所以属性对比更新规则为：
 * 1. 如果某个属性旧节点中有，新节点中却没有了，此时需要删除这个旧的属性
 * 2. 删除之后用新节点的属性值覆盖旧节点的属性值即可
 *
 *
 */
export function patchProps(element, oldProps, newProps) {
  let oldStyle = oldProps?.style || {};
  let newStyle = newProps?.style || {};

  // 旧的style中有的属性 新的sytle没有 则从DOM节点上的style表中将属性删除
  for (const key in oldStyle) {
    if (!newStyle[key]) {
      element.style[key] = "";
    }
  }

  // 旧的props中有的属性 新的props没有 则从DOM节点上将属性移除
  for (const key in oldProps) {
    if (!newProps[key]) {
      element.removeAttribute(key);
    }
  }

  // 经过上诉删除之后剩下的都是新属性或者相同key的属性，此时直接用新的替换旧的即可
  for (const key in newProps) {
    if (key === "style") {
      for (const key in newStyle) {
        element.style[key] = newStyle[key];
      }
    } else {
      element.setAttribute(key, newProps[key]);
    }
  }
}

/**
 * 将newChildren的所有节点挂载到el元素上
 */
function mountChildren(el, newChildren) {
  for (const childVNode of newChildren) {
    // 将子节点的虚拟节点变为真实节点
    let childEl = createElement(childVNode);
    // 将新节点挂载到el元素上
    el.appendChild(childEl);
  }
}

/**
 * 将oldChildren的所有节点从el元素上移除
 */
function unMountChildren(el, oldChildren) {
  for (const childVNode of oldChildren) {
    //  旧的虚拟DOM节点上都有el属性 代表其真实DOM节点
    el.removeChild(childVNode.el);
  }
}

/**
 * 虚拟DOM DIFF算法核心方法
 *
 * 特殊情况：四指针法
 * oldChildren：A B C D
 * newChildren: A B C
 *
 * oldChildren和newChildren一开始的头尾都各有一个left和right指针，一开始两个left指针指向的节点进行对比，如果节点对比相同那么left指针前进+1，直到有任意一个left指针的值大于right指针了，那么终止循环对比。此时要不是从尾部将新的节点插入，或者从尾部将多余的节点删除。
 *
 */
function updateChildren(el, oldChildren, newChildren) {
  // 四个指针
  let oldStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newStartIndex = 0;
  let newEndIndex = newChildren.length - 1;

  // 四个指针初始指向的节点
  let oldStartVNode = oldChildren[0];
  let oldEndVNode = oldChildren[oldEndIndex];
  let newStartVNode = newChildren[0];
  let newEndVNode = newChildren[newEndIndex];

  /* 
    对比的条件：如果有任意一方的头指针大于尾指针 那么对比结束停止循环
  */
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    /* 
      1. 如果两个初始头指针指向的节点相同，则从头开始比
        abc => abcde  abcde=>abc
    */
    if (isSameVNode(oldStartVNode, newStartVNode)) {
      // 递归比较子节点
      patchVNode(oldStartVNode, newStartVNode);
      // 双指针向前进并且更新指向的节点
      oldStartIndex++;
      newStartIndex++;
      oldStartVNode = oldChildren[oldStartIndex];
      newStartVNode = newChildren[newStartIndex];
      // 加continue的原因就为了控制头尾指针都一直 进入到两个if语句中造成指针的混乱 比如abc和abc
      continue;
    }
    /* 
      2. 如果两个初始尾指针指向的节点相同，则从尾开始比
        abc => dabc  dabc => abc 
    */
    if (isSameVNode(oldEndVNode, newEndVNode)) {
      // 递归比较子节点
      patchVNode(oldEndVNode, newEndVNode);
      // 双指针向后退更新指向的节点
      oldEndIndex--;
      newEndIndex--;
      oldEndVNode = oldChildren[oldEndIndex];
      newEndVNode = newChildren[newEndIndex];
      continue;
    }

    /* 
      3. 如果旧的尾巴节点和新的头节点相同，那么进行交叉对比
      abcd => dabc ：d和d对比相同，此时将旧的d移动到旧的a前面，复用了abc三个节点的相对位置
    */
    if (isSameVNode(oldEndVNode, newStartVNode)) {
      // 递归比较子节点
      patchVNode(oldEndVNode, newStartVNode);
      // 先将旧的oldEndVNode移动到oldStartVNode前面去
      el.insertBefore(oldEndVNode.el, oldStartVNode.el);
      //  旧的尾指针--，新的头指针++
      oldEndIndex--;
      newStartIndex++;
      oldEndVNode = oldChildren[oldEndIndex];
      newStartVNode = newChildren[newStartIndex];
      continue;
    }

    /* 
      4. 如果旧的头节点和新的尾节点相同，那么进行交叉对比
      abcd => bcda ：a和a对比相同，此时将旧的a移动到旧的d后面，复用了bcd三个节点的相对位置
    */
      if (isSameVNode(oldStartVNode, newEndVNode)) {
        // 递归比较子节点
        patchVNode(oldStartVNode, newEndVNode);
        // 先将旧的oldStartVNode移动到oldEndVNode前面去
        el.insertBefore(oldStartVNode.el, null);
        //  旧的头指针++，新的尾指针--
        oldStartIndex++;
        newEndIndex--;
        oldStartVNode = oldChildren[oldStartIndex];
        newEndVNode = newChildren[newEndIndex];
        continue;
      }
  }

  /* 
    特殊情况1：新的子节点多余旧的子节点，此时需要尽可能复用重复的，只将多出来的差异部分从头部或者尾部插入
    这种情况下一定当旧的头指针大于尾指针时退出循环，此时新的头指针一定小于尾指针，举例：
    old：a b c   =>   new：a b c d e 新的头指针指向d，尾指针指向e，将这两个元素取出来从尾部插入
    old：a b c   =>   new：d e a b c  新的头指针指向d，尾指针指向e，将这两个元素取出来以a为参数物依次插入到a的前面
   
    那么如何用代码判断是从头部插入还是尾部插入呢？
    判断newEndIndex的下一个节点指向的是null还是节点；如果是null代表是尾部插入的情况；如果是节点代表是头部插入的情况。

    如果是头部插入以那个节点为参照物呢？
    如果是头部插入，那么以newEndIndex的下一个节点也就是上面的a节点为参照物anchor，然后将多余的节点依次插入到a的前面

    API:parentNode.insertBefore(newNode, referenceNode);
    当referenceNode为节点时，代表将新节点插入到referenceNode节点的前面，它们同属parentNode的子节点
    当referenceNode为null时，代表将新节点直接插入到父节点的尾部

    所以我们只需要以anchor作为第二个参数，当anchor为null那就是尾部插入；否则就是头部依次插入。

    其实以上情况就是模拟了我们最常见的操作数组的尾部push和头部unshift的特殊情况。

  */
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      const childVNode = newChildren[i];
      const childEl = createElement(childVNode);

      // 找到参照物节点
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null;
      el.insertBefore(childEl, anchor);
    }
  }

  /* 
    特殊情况2：新子节点比旧子节点少，需要尽可能复用重复的，只将差异部分从尾部移除或者头部移除
    这种情况下一定是新的指针先遍历完，那么一定是新的头指针大于尾指针时退出循环，此时旧的头指针一定小于尾指针，举例：
    old：a b c d e  =>  new：a b c 旧的头指针此时指向d，尾指针指向e，将这两个节点从原来的节点上移除即可
    old：d e a b c  =>  new：a b c 旧的头指针此时指向d，尾指针指向e，将这两个节点从原来的节点上移除即可

    和新增不同，不管是尾部移除还是头部移除，直接移除即可，不用区分头部还是尾部的情况。
    其实这就模拟了我们最常见的操作数组的头部移除shift和尾部移除pop的特殊情况。
  */
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      const childVNode = oldChildren[i];
      const childEl = childVNode.el;
      el.removeChild(childEl);
    }
  }
}
