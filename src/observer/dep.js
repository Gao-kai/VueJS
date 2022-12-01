/* 
    dep：每一个属性都有的收集器，用来收集该属性对应的所有watcher
    由于1个dep可能对应多个watcher

    dependence是依赖的意思，也就是依赖收集器
    subscribe是订阅者的意思，代表订阅了当前这个属性变化的watcher

    dep实例属性：
    + id 
    1个watcher也可能对应多个dep，所以dep也得有id表示

    + subs
    存放着当前属性所对应的所有watcher

*/
let id = 0;
class Dep {
    constructor(){
        this.id = id++;
        this.subs = [];
    }

    // dep进行依赖收集
    depend(watcher){
        this.subs.push(watcher);
    }
}

// 给Dep类添加一个静态属性target，表示依赖收集的目标，初始化为null
// 静态属性就代表Dep上只有一份
Dep.target = null;

export default Dep;