import { parseHTML } from "./htmlParser.js";
import {codeGenerator} from './codeGenerator.js';


/**
 * 
 * @param {String} templateString 模板字符串
 * @return {Function} render函数
 */
export function compileToFunction(templateString){
    console.log('原始模板字符串 =====>\n',templateString);
    
    /* 
        1. 模板编译第一步：解析HTML模板字符串templateString为AST抽象语法树
    */
    const astTree = parseHTML(templateString);

    /* 
        2. 模板编译第二步：将AST抽象语法树生成带有_c、_v、_s的字符串
    */
    const code = codeGenerator(astTree);


    /* 
        3. 模板编译第三步：将字符串通过new Function生成render函数
    */
    const renderBody = `with(this){
        return ${code};
    }`
    const render = new Function(renderBody);

    return render;
    
}
