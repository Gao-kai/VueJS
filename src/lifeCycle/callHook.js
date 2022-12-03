export function callHook(vm,hook){
    let hookList=  vm.$options[hook];
    if(Array.isArray(hookList)){
        // 所有生命周期函数的this都是实例本身
        hookList.forEach(hook=>hook.call(vm));
    }
}