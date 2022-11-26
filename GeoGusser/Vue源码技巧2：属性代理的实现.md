## 问题
如下所示，当我们new一个类Person的时候传入一个参数配置对象options，如果是我们自己实现的Vue类，那么会有两个问题：
1. 在类的内部调用options上的created方法的时候，并不会想Vue.js那样，可以直接获取到data对象中的属性，但是原生的Vue实现确实是可以的。

2. 在类的外部，通过实例去获取data中的属性也获取不到，而对于原生的Vue来说这是可以的。
```js
function Vue(options){
    options.created();
}

const vm = new Vue({
    data:{
        name:'lilei',
    },
    created(){
        console.log(this.name); // undefined
    }
})
console.log(p.name); // undefined
```


## 属性代理proxy的实现
在Vue内部，是通过设置代理proxy来实现的：
```js
function initMixin(Vue){
    Vue.prototype._init = function(options){
        vm.$options = options;
        initState(vm);
    }
}

function initState(vm){
    let options = vm.$options; 
    initData();
}

function initData(vm){
    let data = vm.$options.data; 

    // data是函数就执行返回返回值
    data = typeof data !== 'function' ? data.call(vm):data;

    // 在实例上新增一个属性_data    
    vm._data = data;


    // 遍历data上每一个属性 依次将其进行属性代理
    for(let key in data){
        proxy(vm,'_data',key);
    }
}

/* 
    实现代理：将vm对象对于key的操作都代理到target对象对于key的操作
    也就是：vm.key ===> vm[target][key]
*/
function proxy(vm,target,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key];
        },
        set(newValue){
             vm[target][key] = newValue;
        }
    })
}
```
经过上诉proxy方法对每一个data上的key进行属性代理之后，我们就解决了之前提出的问题。在外部通过实例vm去访问data上的属性key，直接获取不到，但是可以通过触发代理的getter来代理到对于vm._data对象上的key访问。


## Vue 组件中的 data 为什么必须是一个函数？

函数是会被复用的，组件会创建多个实例，如果多个实例的 data 指向同一个对象，那么一个地方 UI 修改了 data 对象中的属性，其他所有实例都会变化，这些实例的 UI 如果绑定了属性，那么也会变化。

其实本质就是原型模式创建对象时，如果属性是一个引用值，那么改一个就会全部都改。

```js
function D() {}
D.prototype.data = {
  a: 100,
};

let d1 = new D();
let d2 = new D();

d1.data.a = 200;
console.log(d2.data.a); // 200
```

如果是一个函数的话：

```js
function D() {}
D.prototype.data = () => {
  return {
    a: 100,
  };
};

let d1 = new D();
let d2 = new D();

d1.data().a = 200;
console.log(d2.data().a); // 100 不会发生变化
```

其实如果你再组件中创建 data 的时候传入的是对象，那么 Vue 就会报错。

## 总结
Object.defineProperty方法不仅实现了属性劫持，还实现了vm实例对象对于vm._data对象的属性代理。这样一来，每当我们直接给实例上的属性赋值时，才会触发视图更新：
1. 内部执行this.name = 100;
2. 触发代理到this._data.name的setter上
3. this._data和data对象指向同一地址，所以也就等于data.name = 100
4. 触发name属性的属性劫持
5. 渲染视图