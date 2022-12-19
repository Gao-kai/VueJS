## 说明
我们都知道，Vue.js最终打包之后会导出一个类Vue,用户通过new Vue然后传入options选项将数据加入到响应式系统，然后实现数据和视图的响应式更新。

一般情况下来说，导出的类应该是一个Class，因为这更符合面向对象的写法，但是Vue内部却没有导出一个类Class Vue,而是导出了一个构造函数function Vue,这样做有什么好处呢？

## 类实现拓展
首先我们说下类的特点，类的特点是高度耦合，也就是一个类上的所有方法和属性都会耦合到一起，当然这样更加方便管理，容易维护，但是缺不易拓展，尤其在模块化编程中，比如：
```js
class Vue(){
    constructor(){}

    initMixin(){}

    $mount(){}
}
```
如果我们想给这个Vue类继续拓展方法，假设方法很多，那么我们只能写在这一个文件里。比如：
```js
class Vue(){
    constructor(){}

    initMixin(){}

    $mount(){}
    // 后面拓展的方法
    a(){},
    b(){},
    c(){},
    ....
}
```
很明显，我们不可能把所有代码都写在一个文件里面，最好的方法是我们可以在其他模块中对Vue类进行拓展，这样既可以保证类是可拓展的，也保证了所有代码不耦合在一起。

## 构造函数实现拓展
如果我们使用构造函数来处理上诉需求就简单了很多，这是因为构造函数是函数，函数在js中是一等公民，它可以调用也可以被当做其他函数的参数而到处传递，并且由于函数是引用值传递的是引用地址，在其他函数中对于参数的修改会同步的反映到参数本身。
```js
// index.js
function Vue(options){
    this._init(options);
}

initMixin(Vue);
initXXX(Vue);


// 在init.js中进行拓展，参数Vue就是要拓展的类
function initMixin(Vue){
    // 对Vue类进行拓展
    Vue.prototype._init = function(options){
        // 函数中的this就Vue实例
        const vm = this;
        // 将用户传入的options挂载到实例的$options属性上，这样就可以在其他实例方法中获取
        vm.$options = options;
    },

    Vue.prototype.$mount = function(){
        // 直接获取用户传入的options对象
        let options = vm.$options;
    },
}

// 在xxx.js中进行拓展
function initXXX(Vue){
    // 对Vue类进行拓展
    Vue.prototype.a = function(){},

    Vue.prototype.b = function(){},

    Vue.prototype.c = function(){},
}
```

## 总结
1. 实现一个类的方式可以是class也可以是构造函数，使用构造函数更加便于在多模块中进行拓展。

2. 函数是一等公民，它可以当做参数到处传递给自身进行拓展。