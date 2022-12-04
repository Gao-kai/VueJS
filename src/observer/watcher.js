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
import Dep, { pushTarget, popTarget } from "./dep";
import { nextTick } from "./nextTick.js";

let id = 0;
class Watcher {
  /* 
        1. vm：需要告诉我当前这个watcher实例是那个vm实例的
        2. fn：当实例上属性变化的时候要执行的渲染函数逻辑 
        3. options 值为true的时候表示要创建一个渲染watcher
        4. deps 存放当前watcher被哪些属性的dep所收集
        5. depsId 存放当前watcher对应的依赖收集器的id集合
        6. lazy 标识此watcher的fn是否为懒执行,也就是在new Watcher的时候先不执行
        7. dirty 标识计算属性的watcher是否为脏 如果是脏的才会在触发计算属性自己getter的时候执行get方法
        
    */
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options;
    this.getter = fn;

    this.deps = [];
    this.depsId = new Set();

    this.lazy = options.lazy;
    this.dirty = this.lazy;

    this.vm = vm;

    /* 控制在new Watcher的时候传入的fn是立即执行还是懒执行 */
    this.lazy ? null : this.get();
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
    //  Dep.target = this;
    pushTarget(this);

    /* 
       执行this.getter方法就会去vm实例上取值，触发属性的getter，进行依赖收集
       1. 如果执行渲染getter，那么getter中的this本来也就是vm实例（之前通过with绑定的）
       2. 如果执行计算属性的getter，那么getter中的this必须为vm实例才可以
    */
    let value = this.getter.call(this.vm);
    console.log(
      "this.getter执行一次，执行的watcher是",
      this,
      "\n执行的结果是",
      value
    );

    // 必须清空 否则会导致不被模板依赖的属性发生getter的时候也被收集
    // Dep.target = null;
    popTarget(this);

    // 如果是计算属性watcher 执行getter方法需要获取到计算后的返回值
    return value;
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
  addDep(dep) {
    const depId = dep.id;
    // 基于set去重：如果dep的id没有存在于depIds的set中，那么才进行记录
    if (!this.depsId.has(depId)) {
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
  update() {
    // 如果计算属性依赖的值发生变化了 就标识计算属性已经是脏值了,就不去走queneWatcher了
    if (this.lazy) {
      this.dirty = true;
    } else {
      // --- this.get(); 每次update更新会引起重复的更新 性能浪费 需要将更新操作先缓存
      queneWatcher(this);
    }
  }

  run() {
    this.get();
  }

  /* 
    计算属性依赖的属性的dep记录Dep.target指向的上一层watcher(渲染watcher)
    1. 如何通过watcher获取到关联的deps
    2. 如果让这些deps分别记录到Dep.target
  */
  depend() {
    // 获取有多少个属性的dep记录了此watcher 如果一个计算属性依赖了2个属性fName和lName
    // 那么fName和lName属性的dep依赖收集器中收集了此watcher
    for (let i = 0; i < this.deps.length; i++) {
      const dep = this.deps[i];
      // 让Dep.target指向的上一层watcher(渲染watcher)也被收集到属性的dep中
      dep.depend();
    }
  }

  /* 
    evaluate是计算的意思，是专门用来处理计算属性的，有三个作用：
    1. 执行计算属性watcher的get方法，这个get其实就是计算属性的getter
    2. 获取到上一步计算后的结果，也就是get方法的返回值，挂载到此watcher的value属性上
    3. 同时修改此计算顺序watcher的dirty属性
  */
  evaluate() {
    // 获取到用户传入函数的返回值
    this.value = this.get();
    this.dirty = false;
  }
}

/**
 * 将需要更新的watcher缓存到队列中
 * @param {*} watcher
 */
let quene = []; // 缓存即将要更新的watcher队列
let has = {}; // 基于对象去重
let pending = false; // 实现防抖
function queneWatcher(watcher) {
  console.log("queneWatcher执行");
  const id = watcher.id;
  if (!has[id]) {
    // 将需要更新视图的watcher先暂存到队列中
    quene.push(watcher);
    has[id] = true;
    console.log("当前保存watcher的队列为", quene);

    if (!pending) {
      // 同步任务结束之后 依次调用watcher的run方法 然后清空缓存的watcher

      // --- setTimeout(flushSchedulerQuene, 0);
      nextTick(flushSchedulerQuene);
      pending = true;
    }
  }
}

/* 
  刷新调度队列
 把缓存在队列中的watcher拿出来，依次执行每一个watcher的更新视图操作
*/
function flushSchedulerQuene() {
  let flushWatcherQuene = quene.slice(0);

  // 清空队列
  quene = [];
  // 清空缓存
  has = {};
  // 重置pending 防止在下面run的时候产生了新的watcher 可以保证继续放入到队列quene中
  pending = false;

  // 依次执行watcher的run方法更新视图
  flushWatcherQuene.forEach((watcher) => {
    watcher.run();
  });
}

export default Watcher;
