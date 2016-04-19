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
    }

    /**
     * [complie 编译模版]
     * @param  {[type]} tpl [description]
     * @return {[type]}     [description]
     */
    complie(tpl, returnBody) {
        var body = '"use strict";\nvar html = "";\nvar tmp;\n',
            code,
            keyword,
            parts,
            res;
        
        this._isInEach = false; // 重置循环体标记️
        
        Util.each(tpl.split(this.options.openTag), (text, index) => {
            parts = text.split(this.options.endTag) || [];
            
            if (index === 0) {
                parts.unshift('');
            }
            
            code = parts[0];
            
            if (code) {
                code = Util.trim(code);
                keyword = (code.match(Base.KEY_WORDS_REG) || '')[0];
                
                if (keyword) {
                    res = this.GRAMMER_MAP[keyword].call(this, code);
                    
                    body += (keyword === 'foreach' ? res.code : res) + '\n';
                } else {
                    body += 'html += (tmp = (' + this.filterRule(code) + ')) ? tmp : "";\n';
                }
            }
            
            if (parts[1]) {
                body += 'html += ' + this.getWrapper(parts[1]) + ';\n';
            }
        });
        body += 'return html;';
        
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
                body = '';
            }
        }
       
        try {
            html = hit.call(data, Util, data);
        } catch (e) {
            console.error(e);
        }
        
        return html;
    }
    
    /**
     * 替换特殊字符
     */
    getWrapper(code) {
        if (this.options.compress) {
            code = code.replace(/\s+/g, ' ').replace(/<!--[\w\W]*?-->/g, '');
        }
        return '\'' + code.replace(Base.S_PART_1, '\\$1').replace(Base.S_PART_2, '\\r').replace(Base.S_PART_3, '\\n') + '\'';
    }
}