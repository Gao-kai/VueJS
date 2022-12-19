# Vue响应式原理之数据劫持

在深入理解Vue2.0中其最核心的响应式原理实现之前，我们先来讨论下什么是响应式？我认为的响应式包含两个方面：
1. 数据层面的变化必须是可以监听的，这里的数据变化指的是存值操作和取值操作。
2. 监听到数据发生变化之后，触发页面渲染，并同时引起视图上数据的变化。

对于Vue来说，每当我们在new Vue的时候传入参数options对象，并且对象中包含data选项的时候，Vue就会在内部执行一系列操作来对data中的数据进行劫持，而这中间又要基于不同的情况进行不同的处理，比如：
1. 初始化时如果data的值是对象该如何处理?
2. 初始化时如果data的值是数组该如何处理?
3. 初始化时对象(数组)的嵌套该如何处理?
4. 初始化完成之后给data中的属性赋值的值又是一个对象该如何处理?

下面我们就来一一说明Vue是如何针对数组和对象进行数据劫持的。

## 一、对象属性劫持核心实现

### 1. 属性劫持的起点：observe
当我们new Vue并传入一个data选项，该选项的值是一个对象的时候，Vue内部会开始对于状态的初始化，尤其在initData的时候会调用一个observe方法：
```js
function observe(data){
    if(typeof data !== 'object' || data === null) return;
    // 如果一个对象的__ob__属性存在并且是Observer的实例 那么说明这个对象已经被观测过了
    if (data.__ob__ instanceof Observer) {
		return data.__ob__;
	}
    return new Observe(data);
}
```
可以看出这个observe方法做了两件事情：
1. 判断data是否为一个引用值，如果是基本值直接return
2. 如果data是一个对象类型，那么执行new Observe构造函数并将data作为参数传入
记住这个observe是一个很重要的方法，由于内部判断了如果要观察的data不是一个对象的话就返回，所以它具有递归调用的基本条件，那就是递归函数必须得有终止条件。再次说下，这个observe函数在后面会被多次用到，因为它是属性劫持的起点。


### 2. 属性劫持的核心类：Observe观察者
```js
class Observe(data){

    constructor(){
        if(Array.isArray(data)){
            // 如果是数组，进行方法重写

        }else{
            // 如果是对象，进行属性劫持
            this.walk(data);
        }
    }

    walk(data){
        Object.keys(data).forEach(key=>{
            // 对象属性响应式实现核心
            defineReactive(data,key,data[key]);
        })
    }
}
```
可以看到Observe类里面会进行一个判断，如果data是数组，那么会进行方法重写；如果data是对象，才会进行属性的getter和setter的劫持。


### 3. 对象属性劫持实现：defineReactive
```js
// 将obj对象上的属性key的存值和取值都进行劫持
function defineReactive(obj,key,value){
    // 如果属性key对应的value本身就是一个对象，那么先对其进行递归属性劫持
    observe(value);

    Object.defineProperty(obj,key,{
        get(){
            // 拦截对象取值，这里加入拦截取值之后的业务逻辑
        },
        set(newValue){
            // 拦截对象存值，这里加入拦截存值之后的业务逻辑
            if(newValue === value) return newValue;

            // 如果赋值的newValue可能还是一个对象 那么就递归的进行属性劫持
            observe(newValue);
        }
    })
}
```
可以看出defineReactive是一个独立于Observe类的核心函数，它的作用就是基于Object.defineProperty API对传入的对象obj上的属性key和value进行存值和取值的劫持，一旦监听到数据改变，就可以通知所有观察者执行更新，然后渲染页面。

defineReactive方法中有两个地方用到了递归劫持：
1. 如果一开始初始化进行劫持的value自身就是一个对象，那么需要先对其进行属性劫持，比如下面info对象的属性project还是一个对象，需要先实现project对象上各属性的劫持，然后再来实现info对象上的属性劫持。
```js
new Vue({
    data(){
        return {
            info:{
                project:{
                    id:01,
                    kind:"web"
                }
            }
        }
    }
})
```

2. 如果给实例的data上的属性进行赋值的时候，赋的值是一个新的对象，那么需要对新的对象进行属性劫持.比如初始化时info对象已经完成属性劫持，但是后来直接给info对象进行了重写赋值，值又是一个新对象，此时还需要递归劫持这个新对象上的所有属性，将其加入响应式系统。
```js
new Vue({
    data(){
        return {
            info:{
               name:'lilei'
            }
        }
    },
    created(){
        this.info = {
            age:18
        }
    }
})
```


## 二、数组方法劫持核心实现
对于对象，我们可以通过深度递归来劫持对象上所有属性的getter和setter，因为我们平时操作对象的属性无非就是obj.xxx读取，obj.xxx = newValue进行赋值。

但是对于数组中的每一项我们该如何劫持呢？难道也采用和对象一样的递归劫持吗？这里有两个很关键的问题：

1. 首先数组中每一项的下标是数字，如果数组长度过长的时候，我们还使用对象的递归深度劫持那么需要劫持的次数太多了，会造成性能上的浪费

2. 我们日常操作数组，绝大多数都不会直接通过arr[0]读取或者arr[0] = xxx进行赋值，而是会采用数组原型上的方法对数组进行操作,比如push pop unshfit shift sort splice reverse这七个可以改变原数组的方法。

所以，我们需要做两件事情：
1. 对于arr[0]读取或者arr[0] = xxx进行赋值的操作，我们需要在初始化的时候就数组中每一项都进行遍历，然后依次进行observe劫持操作。

2. 对于通过7个方法操作数组可以引起数组变化的方法，我们需要重写data也就是数组的原型__proto__,然后对这些方法进行重写，重写的时候不改变原有函数的行为，只是劫持到调用方法时新增到data数组上的数据，然后对这部分数据进行再次的属性劫持。

回到Observe类中：
```js
class Observe(data){

    constructor(){
        if(Array.isArray(data)){
            // 如果是数组，进行方法重写 将data的原型指向新的原型
            data.__proto__ = createNewArrayProto();
            // 遍历数组中每一个对象进行劫持
            this.observeArray(data);
        }else{
            // 如果是对象，进行属性劫持
            this.walk(data);
        }
    }

    walk(data){
        Object.keys(data).forEach(key=>{
            // 对象属性响应式实现核心
            defineReactive(data,key,data[key]);
        })
    }

    observeArray(data){
        data.forEach(item=>{
            observe(item);
        })
    }
}
```

### 1. 重写数组原型上若干方法
切片编程的思路，对于要劫持的方法保留函数原有的行为，但是劫持到方法的调用之后需要获取到新增的参数，将其添加到响应式系统中来。对于其他方法，还是走数组原型进行调用。
```js
// 监听调用7个方法的目的就是找到新增的元素，对其新增部分再次进行劫持
function createNewArrayProto(data){
    let oldArrayProto = Array.prototype;
    let newArrayProto = Object.create(oldArrayProto);

    let methods = [
        'push',
		'pop',
		'shift',
		'unshift',
		'sort',
		'reverse',
		'splice'
    ]

    // newArrayProto原型上添加对于这些方法的劫持
    methods.forEach(method=>{
        newArrayProto[method] = function(...args){
            let result = oldArrayProto[method].call(this,...args);

            // 调用这些方法的时候 要插入到原始数组中的新元素 需要记录 因为也有可能是对象
            let inserted;
            switch(method){
                case 'push':
                case 'unshift':
                    inserted = args;
                    break;
                case 'splice':
                    inserted = args.slice(2);
                    break;
                default:
                    break;
            }

            if(inserted){
                // 这里如何调用到observe方法呢 此方法的this就是data中的数组
                // 但是__ob__属性哪里来呢？答案就是Observe类的构造函数
                this.__ob__.observeArray(inserted);
            }

            return result;
        }
    })

    return newArrayProto;
}
```



### 2. 响应式对象标记：__ob__属性的定义
1. __ob__属性可以标志一个data对象是否被观测过
2. __ob__属性可以方便在其他方法中获取到Observe实例，目的就是可以在Observe类的外面也可以调用其内部方法，比如observeArray方法。
```js
class Observe(data){

    constructor(){
        // 给所有执行响应劫持的对象data设置一个不可枚举的__ob__属性 避免递归调用
        Object.defineProperty(data,'__ob__',{
            value:this,
            enumerable:false,
            configurable:false
        })
    }
}
```

## 三、Object.defineProperty 的缺点
1. 只能劫持 data 对象上当前存在的属性，不能劫持后来新增的或移除的 ，也就是 data.xxx = yy 或者 delete data.xxx 的方法，为此 Vue 官方提供了$set和$delete API
2. Object.defineProperty 只能兼容到 IE8
3. Object.defineProperty 对于对象的属性是重新定义，所以性能差。相当于把属性全部重写。

基于以上问题，Vue3.0开始摒弃了Object.defineProperty方法，采用了ES6新增的Proxy来实现对象属性的响应式劫持。


