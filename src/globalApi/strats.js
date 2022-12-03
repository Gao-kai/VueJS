// 策略对象集 最后会得到key为各生命周期函数名 value为生命周期函数的对象
const strats = {};
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
  这里只是生命周期的策略，后续我们可以自定义任意策略：
  strats.data = function(){};
  strats.computed = function(){};
  strats.watch = function(){};
  ....
*/


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