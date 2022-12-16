## 实现DIff算法
之前的更新中，每次更新都会产生新的虚拟DOM节点，然后通过新的虚拟节点生成真实DOM，最后替换掉老的节点，这种方式性能确实不好。

### 旧的更新性能低
1. 每次更新都执行updateComponent = ()=>{vm._update(vm._render());}
2. let vNode= vm.$options.render.call(vm); 生成虚拟DOM 节点
3. let truthDom = patch(element, vNode); 生成真实DOM节点的核心方法 patch方法
4. path方法中会判断isRealDomElement这次传入的旧节点是否为DOM Element，如果是那么不进行DOM diff直接进行挂载
5. parentNode.insertBefore(newElement, oldElement.nextSibling);将新的真实DOMN节点先放在旧节点的后面兄弟节点处
6. 然后将旧节点移除 完成挂载 parentNode.removeChild(oldElement);

可以看出以上这种方法很暴力，每次都需要重新全量的替换，只要执行一次updateComponent就会执行生成虚拟DOM-生成真实DOM-替换挂载这个过程。既然每次都会生成虚拟DOM节点，那么每次我是否可以先将新的虚拟DOM节点和旧的虚拟DOM节点进行对不，找出差异部分，在js中完成替换，然后更新局部。



### 为什么要用DOM DIFF？
如果旧节点是div，新节点还是div，变化的只是内部的文本，那么我们还需要全部替换吗？不需要
我们应该做的就是尽可能的减少DOM操作，比如删除和插入这些开销很大的操作。
该如何实现呢？答案就是先对比新旧DOM节点，然后只操作替换差异部分，对于相同的内容不进行替换。

1. 操作DOM本来就会有一个重新计算元素位置的过程，就会引起重排和重绘，对性能就有浪费，但是操作虚拟DOM就没有这个问题
2. 每个DOM元素上本来就有很多属性和方法，重新创建一个节点就会有很多的属性和方法，但是虚拟DOM就没有这么多属性



## DIFF算法的对比原则

### 比较方式：同级比较

1. 同级比较 比较的原则是一层一层的去比较，如果父节点不相等，那么后续的子节点就无需比较了,直接用新节点替换旧节点即可
```html
<div>
    <span>demo1</span>
</div>

<p>
    <span>demo2</span>
</p>
```
在比较span元素的父节点的时候，新旧节点的父节点一个是div一个是p，这种直接进行 替换即可。


2. 不进行跨级别比对
```html
<div>
    <p>demo1</p>
</div>

<p>
    <div>demo2</div>
</p>
```
新旧节点的父子关系进行了置换，此时也是同级比较不需要跨级比较

同级比较的原因是：DOM树是一颗树，如果不是平级比较，那么需要每个节点都和树上面的每一个节点进行比较性能很差

## DIFF 算法的几种情况
旧头新头
旧尾新尾
头尾
尾头
交叉比对

```js
/* 测试DOM DIff的代码 */
import { compileToFunction } from "./template-compiler/index.js";
import { createElement, patch } from "./vdom/patch.js";

let render1 = compileToFunction(`<ul id="1" style="color:red;font-size:16px">
	<li key="a">a</li>
	<li key="b">b</li>
	<li key="c">c</li>
	<li key="d">d</li>
</ul>`);
let vm1 = new Vue({ data: { name: "你好啊，李银河！" } });
let oldVNode = render1.call(vm1);
let oldEl = createElement(oldVNode);
document.body.appendChild(oldEl);

let render2 =
  compileToFunction(`<ul id="2" style="color:yellow;background:pink">
	<li key="d">d</li>
	<li key="c">c</li>
	<li key="b">b</li>
	<li key="a">a</li>
</ul>`);
let vm2 = new Vue({ data: { name: "你好啊，李银河！" } });
let newVNode = render2.call(vm2);
// let newEl = createElement(newVNode);

// 新DOM替换旧DOM
// let parentEl = oldEl.parentNode;

setTimeout(() => {
  /*  
	直接用新节点替换老节点
 	parentEl.insertBefore(newEl, oldEl);
  	parentEl.removeChild(oldEl); 
 */

  patch(oldVNode, newVNode);
}, 1000);
```

## 问：循环的时候为什么要加key
方便在新旧虚拟DOM对比的时候被判断为同一个虚拟节点，进行复用。

1. 为什么这个例子使用index作为key没用呢？

2. 为什么代码里面是unshift头部追加，但是dom更新却是从尾部追加的？

3. 为什么用id就可以了呢？也可以等于头部追加？复用了相同节点

重点是判断是否为同一个节点的判断 

给动态列表添加key的适合要尽量避免使用索引index，而应该使用唯一值，如果用索引的话更新前后的元素的key都是从0开始递增的
这就会导致前后节点的tag和key都相同被认为是同一个节点，而进行属性和文本以及子节点的patch
就不能对原来的旧的节点进行复用了

没有传递key就是undefiend，就代表要按照Vue的默认对比原则尽可能的复用
没有传递key那么如果tag也一样，并且大多数情况下tag是一样的，此时就会进去第一个isSameVNode中判定成功
首先更新新旧节点的文本 属性 以及子节点差异，这一部分节点虽然会被复用 但是文本和属性等还是会更新
就依次从头开始对比到结束了

比如 a b c d 之后更新是 a b e c d 如果没有key就是挨个对比：
a a 可以复用
b b 可以复用
c e 由于key都是undefiend 那么判断为相同VNode 更新文本和子节点等 无法复用
d c 更新无法复用
d追加到末尾

有key的话：
a a
b b
c e key不相等 那么从尾部开始比
d d
c c
e追加到c的前面 复用了4个 只更新了一个 大大提高了效率

## 浏览器的批量更新
我们不用担心这样批量向页面中修改出入内容会引起DOM的多次更新
浏览器已经帮助我们优化了
它自己会批量的进行更新