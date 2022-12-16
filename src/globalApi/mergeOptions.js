import strats from "./strats.js";

/**
 * 将用户传入的options和Vue.options合并，并将合并的结果再次赋值给Vue.options
 * @param {*} oldOptions Vue.options全局配置或者Vue子类配置对象Sub.options
 * @param {*} newOptions 用户new类的时候传入的自定义options
 *
 * {} {created:fn1} => {created:[fn1]}
 *
 * {created :[fn1]}  {created:fn2} => {created:[fn1,fn2]}
 *
 */
export function mergeOptions(oldOptions, newOptions) {
  const options = {};

  /* 
		假设目前定义了a、b、c三种策略，属性d没有策略

		先以oldOptions也就是Vue.options上的key为基准，和当前的newOption进行合并
		Vue.options = {a:[1],b:[2]}
		newOptions = {a:3,c:4，d:5}
		这一轮过后由于以Vue.options上的key为基准，所以只会将属性a和b进行合并
		而newOptions中的属性c并不会合并，变为：
		Vue.options = {a:[1,3],b:[2]}
		这一轮过后所有Vue.options中的key都会被处理，要不创建新数组包裹要不数组合并
	*/
  for (const key in oldOptions) {
    mergeField(key);
  }

  /* 
		再以newOptions上的key为基准，和当前的Vue.options中的key进行合并
		Vue.options = {a:[1,3],b:[2]}
		newOptions = {a:3,c:4}
		在上一轮已经合并过的a属性不会再被合并了，只合并c属性，d属性没有策略直接取newOptions的
		合并结果为：
		Vue.options = {a:[1,3],b:[2]，c:[4],d:5}
	*/
  for (const key in newOptions) {
    if (!oldOptions.hasOwnProperty(key)) {
      mergeField(key);
    }
  }

  // 策略模式减少if - else 避免写很多if条件
  function mergeField(key) {
    // 有策略优先走策略 说明我定义好了如何处理的策略
    if (strats[key]) {
      options[key] = strats[key](oldOptions[key], newOptions[key]);
    } else {
      // 如果没有策略那么以传入的newOptions中的key的值为主
      options[key] = newOptions[key] || oldOptions[key];
    }
  }
  
  return options;
}
