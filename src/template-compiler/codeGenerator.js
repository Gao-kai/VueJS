import { defaultTagReg } from "./tagReg.js";


/**
 *  generatorProps：专门用于生成属性字符串的方法
 *  输入节点的attrs，返回一个拼接好的属性值组成的字符串
 *  比如输入如下attrs属性数组：
 *  [
 *      {name: 'id', value: 'app'}, 
 *      {name: 'style', value: 'color: pink;font-size: 18px;'}
 *  ];
 *  
 *  返回一个拼接后的propsStr字符串：
 *  {id:"app",style:{"color":"pink","font-size":"18px"}}
 * 
 */
function generatorProps(attrs){
    let propsStr = "";
    for (const attr of attrs) {
        let {name,value} = attr;
        if(name === 'style'){
            let styleObj = {};

            // 把诸如 value: 'color: pink;font-size: 18px;'中最后一个;切割掉 便于后续拆分字符串为数组
            if(value[value.length-1] === ";"){
                value = value.slice(0,-1);
            }

            // 继续拆分
            value.split(";").forEach(item=>{
                let [k,v] = item.split(":");
                styleObj[k.trim()] = v.trim();
            })
            // console.log('styleObj',styleObj)
            value = styleObj;
        }
        propsStr += `${name}:${JSON.stringify(value)},`;
    }

    // console.log("拼接的属性字符串为：",propsStr.slice(0,-1))
    return `{${propsStr.slice(0,-1)}}`
}


function generatorChildren(children){
    if(children.length > 0){
        return children.map(astNode=>generatorChild(astNode)).join(",");
    }
}

function generatorChild(astNode){
    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;

    if(astNode.nodeType === ELEMENT_TYPE){
        return codeGenerator(astNode);
    }

    if(astNode.nodeType === TEXT_TYPE){
        let content = astNode.text;
        if(!defaultTagReg.test(content)){
            return `_v(${JSON.stringify(content)})`;
        }else{
            // {{name}} hahah
            // xixi {{name}} hahah {{age}} wuwu
            let tokens = [];
            let defaultTagMatchRes;
            let lastIndex = 0;

            defaultTagReg.lastIndex = 0; // 消除全局g正则捕获的懒惰性,避免由于test的判断导致lastIndex发生偏移

            while(defaultTagMatchRes = defaultTagReg.exec(content)){
                // 获取匹配双大括号的开始索引
                let matchStartIndex = defaultTagMatchRes.index;

                // 说明双大括号前还有文本，那么要将这段文本截取到tokens中用于未来拼接，比如xixi、hahah
                if(matchStartIndex - lastIndex > 0){
                    tokens.push(JSON.stringify(content.slice(lastIndex,matchStartIndex)));
                }

                // 获取捕获结果也就是双大括号中的表达式，需要去除空格之后用_s包裹 name age
                let token = defaultTagMatchRes[1];
                tokens.push(`_s(${token.trim()})`);

                // 手动修正lastIndex的位置，便于下一次截取非{{}}的字符 
                lastIndex = matchStartIndex + defaultTagMatchRes[0].length;
            }

            // 说明还有文本没有处理完
            if(lastIndex < content.length){
                tokens.push(`${JSON.stringify(content.slice(lastIndex))}`);
            }

            return `_v(${tokens.join("+")})`;

        }
    }

}



export function codeGenerator(astTree) {
    // console.log("输入的是AST抽象语法树===>\n",astTree);
    let childrenCode = generatorChildren(astTree.children);

    const code = `_c("${astTree.tag}",${astTree.attrs.length > 0 ? generatorProps(astTree.attrs): null}${astTree.children.length > 0 ? `,${childrenCode}`: ""})`

    // console.log("返回的是render函数字符串",code);
    return code;

}


/* 
    最终生成一个render函数，接收一个函数h当做参数
    render(h){
        return h("div",{id:"app"},h('div',{style:{color:"red"}},_v(_s(name) + 'hello')));
    }

    h方法其实在源码里面就是_c,所以最终我们希望得到一个这样的render函数：
    render(){
        return _c("div",{id:"app"},
            _c('div',{style:{color:"pink"}},_v(_s(name) + 'hello')),
            _c('span',null,_v(_s(age))),
            _c('p',null,_v(_s(address.country)))
        );
    }

    _c("div",{id:"app"},_c("div",{style:{"color":"pink","font-size":"18px"}},_v(_s(name)+"hello")),_c("span",null,_v(_s(age))),_c("p",null,_v(_s(address.country))))

    _c就是createElement(el,attrs,...children)
        el是标签名称
        attrs是属性对象
        后面都是子节点

    _v就是专门渲染表达式的
    _s就是JSON.stringify 对表达式内的变量进行转义，避免出现对象和字符串相加变为[object Object]

    要想得到类似这样的render函数，份两步走：
    1. 先得到一个包含_c、_v和_s方法的字符串
    2. with绑定vm实例，将表达式中的变量进行读取替换，比如将name替换为实例上的'lilei'
    3. 通过new Function(fnString)的方式创建render函数

    创建出来render函数这一步就ok了，就完成任务了，后面就是执行render函数返回vNode虚拟DOM了

    所以我们codeGenerator的任务就是：
    输入astTree这样一个JS对象
    返回的产物是这样一个render函数字符串：其实就是字符串的拼接
    render(){
        return _c("div",{id:"app"},
            _c('div',{style:{color:"pink"}},_v(_s(name) + 'hello')),
            _c('span',null,_v(_s(age))),
            _c('p',null,_v(_s(address.country)))
        );
    }

*/
