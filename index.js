import Util from './util';
import Base from './base';
import Cache from './cache';
import Helper from './helper';

export default class Template extends Base {

    constructor(opts) {
        super();
        this.options = Util.merge(this.defaults, opts || {});
        this.cache = new Cache(20);
        this.helper = new Helper();
        this.util = Util;
    }

    /**
     * [complie 编译模版]
     * @param  {[type]} tpl [description]
     * @return {[type]}     [description]
     */
    complie(tpl, returnBody) {
        var header = '"use strict";\nvar __html = "";\nvar __tmp;\n',
            body = '',
            code,
            html,
            keyword,
            parts,
            parser,
            isOut = false,
            defStr = '', // 变量定义部分
            def = {
                '__list__': []
            };
        
        Util.each(tpl.split(this.options.openTag), (text) => {
            parts = text.split(this.options.endTag) || [];
            
            if (parts.length === 1) {
                code = null;
                html = parts[0];
            } else {
                code = parts[0];
                html = parts[1];
            }
            
            if (code) {
                code = Util.trim(code);
                keyword = (code.match(this.GETWORDS_REG) || '')[0];
                
                if (keyword && (parser = this.GRAMMER_MAP[keyword])) { // 如果存在解析器
                    code = parser.call(this, code);
                    isOut = false;
                } else {
                    code = this.defaultHandler(code); // 不存在解析器 现在的情况是要么是输出 要么是赋值
                    isOut = true;    
                }
                
                code = this.paramsFilter(code, def); // 处理变量（提取变量）
                
                if (this._eachInfo) {
                    // 暂时不考虑字符串中有表达式的问题
                    code = code.replace(this._eachInfo.atReg, ($0, $1) => {
                       if ($1 === 'index') {
                           return this._eachInfo.index;
                       } else if ($1 === 'last') {
                           return '(' + this._eachInfo.arr + '.length - 1 === ' + this._eachInfo.index + ')';
                       }
                    });
                }
                
                if (isOut) {
                    body += '__html +=' + code + ';\n';
                } else {
                    body += code;
                }
            }
            
            if (html) {
                body += '__html += ' + this.encode(html) + ';\n';
            }
        });
        body += 'return __html;\n';
        
        var l = def.__list__.length - 1;
        Util.each(def.__list__, (item, i) => {
            if (!defStr) {
                defStr = 'var ';
            }
            
            defStr += item.key + ' = ' + item.val;
            
            if (i < l) {
                defStr += ', ';
            } else {
                defStr += ';\n';
            }
        });
        
        body = header + defStr + body;
        
        return returnBody ? body : this.makeFun(body);
    }
    
    makeFun(body) {
        let fun = new Function('__util', '__helper', '__data', body);
        return (data) => {
            return fun.call(this, Util, this.helper, data);
        };
    }

    /**
     * [render 渲染模版]
     * @param  {[type]} tpl  [description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    render(id, data) {
        var hit = this.cache.get(id),
            tpl,
            dom,
            html = '';
        
        if (!hit) {
            dom = document.querySelector('#' + id);
            tpl = dom.innerHTML;
            
            try {
                hit = this.complie(tpl);
            } catch (e) {
                console.error(e);
            }
        }
       
        try {
            html = hit.call(data, Util, data);
        } catch (e) {
            console.error(e);
        }
        
        return html;
    }
}