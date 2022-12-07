## watch选项四种写法
1. 函数
2. 数组
3. methdos的函数名字符串
4. vm.$watch 参数为函数
5. vm.$watch 参数为字符串

无论是 那种写法最后都是调用的vm.$watch 方法

## watch实现原理
1. 将数组 字符串 函数配置项写法转化成为 vm.$watch("key",cb)的写法
2. 执行 vm.$watch方法
3. 调用new Watcher(this,exprOrFn,{user:true},callback);
4. 执行Watcher的构造函数，将字符串写法变为函数写法 return vm[exprOrFn];，方便后续触发属性key的getter实现依赖收集
5. 执行this.get();方法
6. pushTarget(this);将此watcher实例入栈
7. this.getter.call(this.vm);等于执行()=>this.xxx
8. this就是vm 触发依赖收集 属性xxx收集到此watcher，返回读取到的值当做oldValue
9. 下一次当vm上xxx观察的值发生变化，触发dep的notify
10. 触发每一个watcher的update方法
11. 进入queneWatcher方法中
12. 执行watcher的run方法
13. 再次执行一次get方法 重新读取新的vm.xxx的值
14. 执行watch观察属性key的callback

## 多次修改只触发一次
对于watch监听的属性，如果连续修改多次 只会渲染一次

这是因为最终都会走到qunwatcher先缓存起来 有去重的效果
下一次更新之前去取值然后更新渲染

## 计算属性和watch底层都是基于Watcher实现的 
只不过依赖收集不一样
触发条件不一样