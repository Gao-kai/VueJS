export function initWatch(vm){
    // 获取用户传入的watch配置项对象
    let watchOptions = vm.$options.watch;

    // 遍历每一个watch属性
    for (let key in watchOptions) {
        // 获取到watch属性key对应的值，可能为数组、字符串和函数
        let handler = watchOptions[key];

        // 如果值为数组 那么数组中有多个回调函数 遍历数组中的每一项调用vm.$watch
        if(Array.isArray(handler)){
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm,key,handler[i]);
            }
        }else{
            createWatcher(vm,key,handler);
        }
    }
   
}

/**
 * 这一步的目的是将通过数组字符串以及函数写法的watch配置项转化成为统一的vm.$watch写法
 * 并且方法的第一个参数key一定为字符串
 * 
 * @param {*} vm 实例
 * @param {*} key watch配置项中要观察的实例上的属性名
 * @param {*} handler 属性名发生变化之后要执行的回调
 */
function createWatcher(vm,key,handler){
    // 如果值为字符串 说明这个handler是调用了methdos中的方法 而methods上的函数最终也会挂载到vm上
    if(typeof handler === "string"){
        // 直接通过vm实例去获取函数
        handler = vm[handler];
    }
    
    return vm.$watch(key,handler);

}