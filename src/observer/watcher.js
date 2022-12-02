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
class Watcher {
  /* 
        1. vm：需要告诉我当前这个watcher实例是那个vm实例的
        2. fn：当实例上属性变化的时候要执行的渲染函数逻辑 
        3. options 值为true的时候表示要创建一个渲染watcher
        4. deps 存放当前watcher被哪些属性的dep所收集
    */
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options;
    this.getter = fn;

    this.deps = [];
    this.depsId = new Set();

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
  get() {
    // 将watcher实例赋值给Dep.target静态属性
    Dep.target = this;

    // 执行this.getter方法就会读取vm.data上的属性，触发属性的getter，进行依赖收集
    this.getter();

    // 必须清空 否则会导致不被模板依赖的属性发生getter的时候也被收集
    Dep.target = null;
  }

  /**
   * watcher实例记录dep依赖收集器的方法
   * 
   * 1. 一个组件(视图)watcher可能对应多个属性，每个属性都有自己的dep
   * 2. 那么也就是说一个watcher应该记录自己被哪些dep所收集了
   * 3. 对于重复的属性，watcher也不用重复记录，比如一个watcher中读取了两次name值
   *    那么会触发两次name的getter
   *    就会触发两次name属性的dep.depend方法
   *    就会触发两次Dep.target.addDep(this);
   *    就等于执行了两次watcher实例的addDep方法；
   *    如果不去重，此watcher实例内部的deps就会记录到重复的name属性的dep
   */
  addDep(dep){
    const depId = dep.id;
    // 基于set去重：如果dep的id没有存在于depIds的set中，那么才进行记录
    if(!this.depsId.has(depId)){
        // 当前watcher实例对此属性依赖收集器dep 进行记录并且实现了dep的去重
        this.deps.push(dep);

        this.depsId.add(depId);

        // 传递进来的属性依赖收集器dep实例对此watcher也进行依赖收集，间接实现了watcher去重
        dep.addSub(this);
    }
  }

  /* 
    调用update就会执行get方法
    重新走执行get方法的流程如上所示
  */
  update(){
    this.get();
  }
}

export default Watcher;
