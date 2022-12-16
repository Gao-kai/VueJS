// 策略对象集 最后会得到key为各生命周期函数名 value为生命周期函数的对象
const strats = {};

/* 
  这里只是生命周期的策略，后续我们可以自定义任意策略：
  strats.data = function(){};
  strats.computed = function(){};
  strats.watch = function(){};
  strats.components = function(){};
  ....
*/
const LIFECYCLE = [
	"beforeCreate",
	"created",
	"beforeMount",
	"mounted",
	"beforeUpdate",
	"updated",
	"beforeDestroy",
	"destroyed",
];


/* 
	处理components属性的时候要处理一个全局和局部组件的原型链关系
	为了实现全局组件和局部组件的name一样的时候，可以先局部后全局
	而这个是基于原型链实现的 背后还是Object.create API

	子组件有compoents优先使用自己的
	如果找不到那么按照原型链查找父类的compoents 也就是全局的components
	parentValue就是Vue.options.components
	childValue就是Vue.extend时传入的options.components
*/
strats.components = function(parentValue,childValue){
	const res = Object.create(parentValue);
	for (const key in childValue) {
		// 首先拷贝childValue有的直接读取自己 没有沿着原型链找到parentValue上
		res[key] = childValue[key];
	}
	return res;
}

function makeStrats(stratsList){
	stratsList.forEach(hook => {
		strats[hook] = function(oldValue,newValue){
			if(newValue){
				if(oldValue){
					return oldValue.concat(newValue);
				}else{
					return [newValue];
				}
			}else{
				return oldValue;
			}
		}
	});
}
makeStrats(LIFECYCLE);

export default strats;