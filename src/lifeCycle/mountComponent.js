/**
 * 
 * @param {*} vm 实例
 * @param {*} element DOM元素
 */
export function mountComponent(vm, element) {
    // 将element节点挂在vm上 可以在任意vm方法中读取
    vm.$el = element;
    /* 
        1. 执行render函数生成虚拟DOM
        在源码里有一个vm._render方法，调用该方法其实就是调用vm.$options.render方法
        该方法的返回值是一个虚拟DOM对象
    */
    let vNode = vm._render();


    /* 
        2. 根据虚拟DOM产生真实DOM
        在源码里有一个vm._update方法，调用该方法会将上一步生成的虚拟DOM转化为真实DOM
    */
    vm._update(vNode);

    /* 
        3. 将真实DOM插入到DOM节点中
    */
}
