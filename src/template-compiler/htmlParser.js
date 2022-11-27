import { startTagOpen, startTagClose, endTag, attribute } from "./tagReg.js";

/**
 * parseHTML方法 htmlparser2等于手写了
 *
 *
 * 1. 功能：将html语法表达的html模板字符串转化为JS语法表达的AST抽象语法树
 *
 * 2. 解析思路：
 * 不停基于正则对htmlStr进行解析，每次匹配到一部分内容就从原始htmlStr中将其删除
 * 最终等到htmlStr截取为空字符串的时候，标志着模板解析完成。
 * 在解析的过程中会逐渐将AST抽象语法树构建起来。
 */

const ELEMENT_TYPE = 1;
const TEXT_TYPE = 3;

export function parseHTML(htmlStr) {
  let root;
  let tagStack = [];
  let currentParent = null;

  const onParseStartTag = function (tagName, attrs) {
    const astNode = createASTElement(tagName, attrs);
    if (!root) {
      root = astNode;
    }

    // 如果指向栈顶指针有节点 要将当前解析后新建的astNode当做子节点加入到当前节点的children中
    if (currentParent) {
      // astNode的父节点引用指向栈顶
      astNode.parent = currentParent;
      // 父节点将astNode加入子节点数组中 是双向奔赴的行为
      currentParent.children.push(astNode);
    }

    tagStack.push(astNode);
    currentParent = astNode;
  };

  const onParseText = function (text) {
    text = text.replace(/\s/g, "");
    // 父节点将文本节点加入子节点数组中
    text &&
      currentParent.children.push({
        text,
        nodeType: TEXT_TYPE,
        parent: currentParent,
      });
  };

  const onParseEndTag = function (tagName) {
    let topNodeElement = tagStack.pop();
    if (topNodeElement.tag !== tagName) {
      console.error("输入的标签不合法!");
    }
    currentParent = tagStack[tagStack.length - 1];
  };

  /**
   * 将htmlStr字符串从索引为startIndex的地方截取至末尾，并给原始htmlStr字符串赋值
   */
  const advance = function (startIndex) {
    htmlStr = htmlStr.slice(startIndex);
  };

  /**
   *  解析开始标签，要求解析的产物是开始标签的名称tagName和开始标签的属性attrs数组
   */
  const parseStartTag = function () {
    const startTagOpenMatchResult = htmlStr.match(startTagOpen);
    if (startTagOpenMatchResult) {
      // console.log("startTagOpenMatchResult", startTagOpenMatchResult);

      // 解析的产物
      const parseResult = {
        tagName: startTagOpenMatchResult[1],
        attrs: [],
      };
      advance(startTagOpenMatchResult[0].length);

      // 解析开始标签中的属性和末尾的右尖角号,只要没有遇到结束的右尖角号就一直解析属性
      let attrMatchResult;
      let startTagCloseMatchResult;
      while (
        !(startTagCloseMatchResult = htmlStr.match(startTagClose)) &&
        (attrMatchResult = htmlStr.match(attribute))
      ) {
        // console.log("attrMatchResult", attrMatchResult);
        advance(attrMatchResult[0].length);
        parseResult.attrs.push({
          name: attrMatchResult[1],
          value:
            attrMatchResult[3] ||
            attrMatchResult[4] ||
            attrMatchResult[5] ||
            true,
        });
      }

      if (startTagCloseMatchResult) {
        advance(startTagCloseMatchResult[0].length);
      }
      return parseResult;
    }
    return false;
  };

  const createASTElement = function (tag, attrs) {
    return {
      tag,
      attrs,
      nodeType: ELEMENT_TYPE,
      parent: null,
      children: [],
    };
  };

  while (htmlStr !== "") {
    let textEndIndex = htmlStr.indexOf("<");

    // 开始标签<div> 或者 结束标签</div>
    if (textEndIndex === 0) {
      let startTagParseResult = parseStartTag();
      //  说明当前htmlStr的开头第一个字符是开始标签的<
      if (startTagParseResult) {
        let { tagName, attrs } = startTagParseResult;
        onParseStartTag(tagName, attrs);
        continue;
      }

      let endTagParseResult = htmlStr.match(endTag);
      //  说明当前htmlStr的开头第一个字符是结束标签的<
      if (endTagParseResult) {
        advance(endTagParseResult[0].length);
        onParseEndTag(endTagParseResult[1]);
        continue;
      }
    }

    // 说明textEndIndex就是标签内部文本结束位置
    if (textEndIndex > 0) {
      const text = htmlStr.slice(0, textEndIndex);
      if (text) {
        onParseText(text);
        advance(text.length);
      }
    }
  }

  // console.log("当前模板字符串 ====>\n", htmlStr === ""); // true 说明解析完成

  // console.log("解析模板的产物AST语法树是 === >\n", root);

  return root;
}

/* 
    总体解析思路：

    入口：从<字符的 indexOf返回值开始解析
        =0  解析到了一个开始标签<div>或者结束标签</div>
        >0 

    不能光删 需要边删除边构建AST抽象语法树
    root:{
        tag:"div",
        arrts:[],
        children:[
            {
                tag:"p",
                arrts:[],
                children："你好啊，李银河！"
                parent:div
            }，
             {
                tag:"div",
                arrts:[],
                children：[
                    {
                        tag:"span",
                        arrts:[],
                        children："span标签"
                        parent:div
                    }
                ]
                parent:div
            }
        ],
        parent:null
    }
*/

/* 
    父子关系的确定 基于栈 这是栈的应用

    当前解析的标签tagName的父亲就是栈顶元素的儿子
    遇到结束标签就出栈
    遇到开始标签就入栈，确定父子关系

    基于正则和while循环进行解析
    基于栈维护关系
    进栈就构建父子关系
    出栈就维护栈顶指针
    出来AST抽象语法树
*/
