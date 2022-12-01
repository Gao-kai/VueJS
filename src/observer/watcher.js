/* 
    1. 将渲染逻辑封装到Watcher类中

    2. 每一个watcher都需要有id进行标记和其他watcher进行区分，因为Vue中的每一个组件都有一个watcher
        假设A组件中的watcher依赖了name属性和age属性
        假设B组件中的watcher依赖了age属性
        假设C组件中的watcher依赖了num属性

        如果现在只有name属性发生了变化，那么name属性的Dep收集器难道要通知所有watcher更新吗？很显然B组件和C组件是不需要更新的

        我们只需要更新A组件即可，那么如何区分呢?就需要对watcher进行唯一id标识。
        每次创建watcher实例都将id进行累加标记

    这也是我们组件化的目的：
        1. 复用
        2. 易维护
        3. 局部更新(如果一个页面就只有一个watcher，那么不管任意一个属性发生变化，都会导致watcher更新引起视图渲染，如果一个页面中有多个组件，每个组件都有自己的watcher，那么它只用更新自己的部分)

    3. watcher的作用就是封装渲染逻辑,它的实例属性有：

    + id 为了标识watcher，以便于区分不同的watcher
    + getter 
    为了保存vm的渲染逻辑函数，以后只要调用watcher上的getter，就等于执行渲染
    默认在new Wacther的时候需要做一次初渲染  也就是默认调用一次getter
    调用getter函数就等于调用渲染逻辑updateComponent
    就等于调用_update和_render
    那么_render在执行生成虚拟DOM的过程中就会去读取vm实例上的属性
    最后会触发属性的getter

*/
import Dep from "./dep";

let id = 0;
class Watcher{

    /* 
        1. vm：需要告诉我当前这个watcher实例是那个vm实例的
        2. fn：当实例上属性变化的时候要执行的渲染函数逻辑 
        3. options 值为true的时候表示要创建一个渲染watcher
    */
    constructor(vm,fn,options){
        this.id = id++;
        this.renderWatcher = options;
        this.getter = fn;

        this.get();
    }

    /* 
        执行get方法的流程：
        0. 将当前watcher实例放到Dep.target属性上
        1. this.getter();
        2. 调用渲染逻辑updateComponent
        3. 调用_update和_render
        4. 调用_render的时候去vm上读取属性值
        5. 触发getter，判断是否Dep.target有值，如果有值，执行dep依赖收集方法depend

        name => dep.depned => [watcher]
        age => dep.depend => [watcher]
    */
    get(){
        Dep.target = this;
        this.getter();
        Dep.target = null;
    }
}

export default Watcher;