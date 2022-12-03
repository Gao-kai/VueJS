/* 
    nextTick并没有直接采用某一个API 
    而是采用了优雅降级的方式来实现
    并且这里采用了一个策略模式来实现给timerFunction的赋值

    原则为尽可能快的看到视图发生刷新：
    Promise.resolve()
    MutationObserver
    setImmediate
    setTimeout

*/
let timerFunction = null;
function getTimerFunction(){
    if(Promise && typeof Promise === 'function'){
        timerFunction = ()=>{
            Promise.resolve().then(flashCallBacks);
        }
    }else if(MutationObserver){
        let mutationOb = new MutationObserver(flashCallBacks);
        let textNode = document.createTextNode(1);
        mutationOb.observe(textNode,{
			characterData:true
		})
        timerFunction = ()=>{
			textNode.textContent = 2;
		}
    }else if(setImmediate){
        timerFunction = ()=>{
			setImmediate(flashCallBacks);
		}
    }else{
        timerFunction = ()=>{
			setTimeout(flashCallBacks,0);
		}
    }
}
getTimerFunction();

/**
 * 异步批处理
 */
let callBacks = [];
let waiting = false;

export function nextTick(callback) {
    console.log('nextTick执行，先缓存callback\n',callback)

    // 异步批处理：先在这里全部缓存起来
    callBacks.push(callback);
    if(!waiting){
        /* 
            等到时间到了才依次将任务取出执行
            cb() => 
            flushSchedulerQuene() => 
            flushWatcherQuene.forEach(watcher=>{watcher.run();}) =>
            watcher.get() 视图更新
        */
       /*  
            setTimeout(()=>{
                flashCallBacks();
            },0) 
            waiting = true;
        */
        timerFunction();
        waiting = true;
    }
}

/* 
    将任务队列中任务取出依次执行
*/
function flashCallBacks(){
    let cbs = callBacks.slice(0);
    callBacks = [];
    waiting = false;
    cbs.forEach((cb)=>{
        cb();
    })
}


