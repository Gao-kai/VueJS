## 实现一个Vue.mixin（options）
基本表现：Vue.mixin会将每次传入的配置项options中的字段依次放到Vue.options对应的字段的队列上，比如：
```js
Vue.mixin({
    created(){
        console.log('全局混入created1')
    }
})

Vue.mixin({
    created(){
        console.log('全局混入created2')
    }
})

const vm = new Vue({
    el: "#app",
    data() {
        return {
        name: "GeoGusser",
        age: "18",
        address: {
            country: "China",
            provice: "甘肃",
        },
        hobby:['football','basketball']
        };
    },
    created(){
        console.log('vm实例自身created')
    }
});
```
打印的顺序是：
全局混入created1
全局混入created2
vm实例自身created

这是因为Vue.mixin内部会将多个created合并为一个队列，而且合并之后就放在Vue.options对应的字段上：
```js
// Vue.options
{
	"components": {},
	"directives": {},
	"filters": {},
	"created": [f,f] // 将混入的created维护成了一个数组
}
```
如果我们能实现这个，说明就实现了Vue.mixin


## mergeOptions(parent,child)
这个方法的作用就是将child对象上的属性合并到parent对象上，并将合并的结果赋值给parent对象

parent:其实就是Vue.options
child:就是用户每次调用的mixin方法时传入的options

一般来说分为三种情况：
1. 父子都没有key 那么肯定不合并

2. 子有key但是父没有
```js
parent:{} // 一开始Vue.options中created肯定为空的
child:{
    created:()=>{},
}

他们合并规则是：读取child的key的值，并用空数组包裹 也就是说parent中的值要不空要不是一个队列，不可能只有一个

parent = res：{
    created:[()=>{}]
}

```


3. 父有key但是子没有
```js
parent:{
    created:[()=>{}],
}

child:{}

他们合并规则是：直接将父的key对应的值返回，原来是数组就是数组
parent = res：{
    created:[()=>{}]
}
```


4. 父子都有key
```js
parent:{
    created:[()=>{}],
}

child:{
    created:()=>{}
}

他们合并规则是：用parent.key的值(一定为数组)concat合并child.key
parent = res：{
    created:[()=>{},()=>{}]
}
```


## 思路
为什么要连续两次遍历呢？
1. 情况1 
当前Vue.options为空 此时第一遍in循环不会进入
直接进入第二个循环child的
```js
Vue.mixin({
    created:fn1,
    mounted:fn2
})

for(let key in child){
    mergeField(key);
}


function mergeField(key){
    if(s[key]){
        options[key] = s[key](parent[key],child[key]);
    }else{
        options[key] = child[key] || parent[key];
    }
}


parent = res :{
    created:[fn1],
    mounted:[fn2]
}
```

2. 情况2
本次child的key为created和updated

<!-- child：-->
Vue.mixin({
    created:fn4,
    updated:fn3
})

<!-- parent -->
{
    created:[fn1],
    mounted:[fn2]
}

先执行parent的合并
{
    created:[fn1，fn4],
    mounted:[fn2]
}

再执行child的合并 父亲合过的key我没必要再合了
{
    created:[fn1，fn4],
    mounted:[fn2]
    updated:[fn3]
}

## new Vue的时候如何进行实例options和全局options的合并？
## 为什么Vue全局上options上的指令、组件、filter等可以在Vue实例中直接调用？
## 为什么全局的生命周期函数总是在实例自己的生命周期函数之前调用？

以上三个问题其实都是一个问题
那么就是实例的options是和全局的options做了一次合并，并将合并之后的结果赋值给了vm.$options,所以Vue.options全局的指令这些背合并到实例中可以直接调用

并且全局的生命周期函数总是在队列的前面，总是先于实例的执行
