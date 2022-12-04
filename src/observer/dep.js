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

    /**
     * 属性getter时：属性的dep对其依赖的watcher进行依赖收集，收集时需要去重
     */
    depend(){
        /* 
            这一行代码的作用：
            1. Dep.target是唯一的，它的值是一个读取name属性的watcher
            2. this是当前属性关联的依赖收集器dep的实例
            3. addDep是watcher实例用来记录dep的方法
            4. addSub是dep实例用来进行依赖收集watcher的方法
            5. 会实现双向记录和双向去重的方法
        */
        Dep.target.addDep(this);

         // 无脑push 不会去重 --- this.subs.push(watcher); 
    }

    /**
	 * @param {Object} watcher
	 * 给属性的dep收集器记录收集了多少个watcher，并将watcher存放在subs数组中
	 * 其实就是记录这个属性有多少个组件模板在引用
	 */
    addSub(watcher){
        this.subs.push(watcher);
    }

    /**
     * 属性setter时：属性的dep对其依赖的watcher进行通知，让watcher依次进行更新
     */
    notify(){
        this.subs.forEach(watcher=>{
            watcher.update();
        })
    }
}

/* 
    1. 给Dep类添加一个静态属性target，表示依赖收集的目标，初始化为null
    2. 静态属性就代表Dep上只有一份
*/
Dep.target = null;

/* 
    存放渲染watcher和计算属性watcher的栈
*/
let stack = [];

/* 
    将watcher入栈，同时将Dep.target指针指向最新放进来的那个watcher
*/
export function pushTarget(watcher){
    stack.push(watcher);
    Dep.target = watcher;
}

/* 
    将watcher出栈，同时将Dep.target指针指向当前栈顶的那个watcher
*/
export function popTarget(){
    stack.pop();
    Dep.target = stack[stack.length-1];
}

export default Dep;