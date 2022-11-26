## 模板编译是什么

就是将 data 中的数据解析到 html 上，将 html 里面的变量用 data 中的数据进行替换。

```html
<div id="app">
  <p>{{name}}</p>
  <span>{{age}}</span>
</div>
```

```js
new Vue({
  el: "#app",
  data() {
    return {
      name: "lilei",
      age: 18,
    };
  },
});
```

经过模板编译之后模板应该变为，然后渲染在页面上。

```html
<div id="app">
  <p>lilei</p>
  <span>18</span>
</div>
```

Vue1.0：没有引入虚拟DOM，采用的是模板引擎，每次数据变化，都会重新编译模板，然后重新渲染页面，很明显这种性能差，而且需要正则匹配替换

Vue2.0：采用虚拟 DOM，每次数据变化，会先将更新后的虚拟 DOM 和更新前的虚拟 DOM 进行对比，然后找到差异的部分，只渲染这部分差异的部分。

模板编译的核心就是：将用户传入的 template 模板也就是 html 模板字符串，通过正则匹配等方法转化为 JS 对象，这是语法层面的转化，从html语法转化为JS语法表达的对象 。

比如常见的babel就是一个转译器：将es6语法转化为ES5语法



> 虚拟DOM一定比真实DOM快吗？
很明显，如果一个页面只渲染一次或者没有很多更新的操作的话，其实虚拟 DOM 不一定比直接渲染真实 DOM 更加快，因为无论如何需要消耗 CPU 和内存多一步将模板转化为虚拟 DOM 也就是 js 对象的过程。

如果一个页面更新频繁，那么虚拟 DOM 相比直接渲染真实 DOM 是更加有效的。


## mount
如果options中传递了el，可以在内部自动挂载 
如果没有传递，也可以在外部手动挂载 vm.$mount("#app");

## 运行时和编译时
运行时runtime不包含模板编译，整个编译是打包的时候通过loader来转译.vue文件的
用runtime的时候不能采用template选项，但是可以在.vue文件中写template模板来通过loader来进行编译。

编译时包含模板编译，runtimeWithCompiler







## 模板编译的流程

1. html 模板 编译成为 AST 抽象语法树
2. 遍历树节点进行替换更新值
3. 生成新的 DOM 结构

Vue 里三种声明模板的方案：

1. 直接在 html 中声明 div id=app，通过 el 属性去拿
2. 在 template 属性中声明
3. 在 render 函数中 return h(div,{}) createElement

render template el 属性的先后顺序

重点就是将 template 语法转换成为 render 函数。

## Vue.prototype.$mount 将 data 中的数据挂载到模板上

## compileToFunction 输入 template 输出 render 函数

new Vue
执行 this.\_init 方法
在.\_init 中执行 initState 对 data、props 等状态进行初始化 + 对对象属性进行劫持 + 对数组方法进行重写 + 递归劫持
在.\_init 中执行 vm.$mount方法实现将data中初始化好的数据挂载到传入的模板上
执行$mount 方法
执行 compileToFunction 方法 就是将 template 转化为 render 函数的方法 + 执行 parseHTML 方法，将 template 模板转化为 js 语法的抽象语法树 AST + 执行 codeGenerator 方法，将 data 中的 this.name = 'lilei'写入 DOM 结构中 + 执行 render = new Function(code);生成一个 render 函数并返回


## parseHTML
```html
拿到的模板是一个html文本： `
<div id="app">
  <div style="color:red">
    {{name}} hello
  </div>
  <span>{{age}}</span>
</div>
`
```

总体思路就是：
开启一个while循环，不停的去匹配，不停的解析，然后构建最终的root对象也就是AST语法树。
1. 使用到了栈结构
2. 解析一点构建一个，一直截取htmlstr，最终得到一个js对象 root

## codeGenerator


我们希望得到一个render函数，用法如下，调用这个render函数就可以返回虚拟DOM:
```js
function render(h){
  return _c('div',{id:'app'},h('div',{style:{color:"red"}},_v(_s(name) + 'hello')));
  我们常说的h方法就是源码里面的_c
}
```
代表要创建一个元素div，它的属性是id=app，并且div元素还有一个子元素div，它有一个属性style，值为color：red，还有一个文本 name hello，由于这个name是变量所以先JSON。stringify转义然后使用

我们的目的是在codeGenerator这一步基于上一步得到的ast，生成一个这样包含-c _v _s的字符串，然后将这个字符串使用eval或者new Function执行，由于提前准备好了c v s方法，所以字符串执行的时候就会生成虚拟DOM。

这边还需要使用with绑定里面的作用域是this
code = `with(this){
		return ${code};
	}`;

## render = new Function(code);
执行render的时候请务必render.call(vm),让Vue的实例this指向render函数中this
render函数体就是上一步生成的code长这样：
with(this){
  return ${code};
}

所有模板引擎的实现方式就是with + new Function

## 调用render 才能实现页面渲染 mountComponent(vm, element);
1. 先调用我们上一步生成的render方法产生虚拟DOM节点，源码里面是_render 也就是options.render
2. 再调用_update方法生成真实DOM节点
3. 将生成的真实DOM节点 全部替换 element的innerHTML，完成渲染

天大的好处：
只要生成了ast树，然后codeG生成了render函数，以后每一次渲染只需要执行update和render方法就可以完成渲染，无需再次走生成AST的过程。

传入的data不同，render函数就会返回不同的虚拟节点，这里就会用到响应式数据
后续只要响应式数据一变化就被劫持到，就执行一次render方法，页面不就渲染了吗？

执行render函数就会执行cvs方法，执行这些方法的时候就会去vm上取值，然后返回虚拟DOM渲染成为真实DOM，这不是就是把视图 和 数据绑定起来了吗