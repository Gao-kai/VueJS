import Dep from "../observer/dep";
import Watcher  from "../observer/watcher";

export function initComputed(vm){
    let computed = vm.$options.computed;
    // 将计算属性关联的所有watcher保存到vm的_computedWatchers属性上便于后续从vm上取值
    let watchers = vm._computedWatchers = {};
    // 遍历用户传入的computed对象
    for (const key in computed) {
        if (Object.hasOwnProperty.call(computed, key)) {
            /* 
                获取对计算属性的值
                1. 值可能为对象 fullName:{get(){return xxx},set(){}}
                2. 值可能为函数 fullName(){return xxx};
            */
            let userDefine = computed[key];  

            /* 
                目的：将计算属性和watcher关联起来，并且保证这次new Watcher中的fn不执行
                      此watcher用于监控计算属性中get的变化
                    
                getter:当计算属性本身为函数时就是本身，为一个对象时就是计算属性的get方法
                lazy：默认当new Watcher的时候传入的第二个参数fn也就是getter会立即执行，但是我们希望
                      计算属性的getter不立即执行，而是真正取值的时候才执行，也就是懒执行
            */
            let getter = typeof userDefine === 'function' ? userDefine:userDefine.get;
            watchers[key] = new Watcher(vm,getter,{lazy:true})


            /* 
                目的：将用户传入的计算属性挂载到vm实例对象上，方便可以直接通过vm访问计算属性
            */
            defineComputed(vm,key,userDefine);
        }
    }
}

/**
 * 定义计算属性：因为计算属性自己就有setter和getter
 * @param {*} target 要给vm实例定义计算属性
 * @param {*} key 计算属性的key，比如fullName
 * @param {*} userDefine 计算属性的值，也就是用户自定义传入的计算属性的值
 */
function defineComputed(target,key,userDefine){

    /* 
        取出计算属性的getter和setter
    */
    let getter = typeof userDefine === 'function' ? userDefine:userDefine.get;
    let setter = userDefine.set || (()=>{});
    // console.log(`计算属性${key}的\ngetter是：${getter}\nsetter是：${setter}\n`);

    /* 
        定义响应式属性
    */
    Object.defineProperty(target,key,{
        get:createComputedGetter(key),
        set:setter
    })
}

/* 
    createComputedGetter:创建一个包装后的计算属性Getter，控制是否执行用户传入的getter

    1. createComputedGetter方法的返回值是一个getter函数，此函数在调用时的this是target也就是vm实例
    2. 当模板在第一次读取计算属性的值的时候就会触发其getter，此时就会执行此包装后的getter函数，如果和此计算属性关联的watcher是dirty也就是值为true，那么就执行getter返回值
    3. 当模板第二次读取计算属性的值的时候，此时dirty已经被修改为false，就不会多次的执行计算属性真正的那个getter了(比如return this.fName + this.lName)
*/
function createComputedGetter(key){
    return function(){
        // 获取到initComputed时定义的此计算属性key对应的watcher
        const watcher = this._computedWatchers[key];
        
        // 如果是脏的 就去执行watcher的evaluate方法 只要执行一次就将dirty变为false 下次再求值就不执行了
        if(watcher.dirty){
            console.log("计算属性watcher执行");
            watcher.evaluate();
        }

        /* 
            1. 如果watcher.evaluate()执行之后Dep.target还有值 那么说明计算属性出栈后还有渲染watcher在栈中
            2. 此时需要找到计算属性中的依赖的属性（如fName和lName），让这些属性的dep不仅要收集计算属性watcher，还需要收集上一层的watcher(渲染watcher)
            3.  这是修改计算属性依赖的属性而不修改计算属性引起视图渲染的核心所在
        */
        if(Dep.target){
            // 让watcher反过来收集属性
            watcher.depend();
        }
       
        return watcher.value;
    }
}