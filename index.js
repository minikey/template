import Util from './util';
import Base from './base';

export default class Template extends Base {

    constructor(opts) {
        super();
        this.options = Util.merge(this.defaults, opts || {});
    }

    /**
     * [complie 编译模版]
     * @param  {[type]} tpl [description]
     * @return {[type]}     [description]
     */
    complie(tpl) {
        var body = '"use strict";\nvar html = "";\nvar tmp;\n',
            code,
            keyword,
            parts;

        Util.each(tpl.split(this.options.openTag), (text, index) => {
            parts = text.split(this.options.endTag);
            
            if (index === 0 && text) {
                if (text.indexOf(this.options.endTag) !== -1) {
                    throw new Error('语法错误');
                }
                body += 'html += ' + this.getWrapper(text) + ';\n';
                return;
            }
            
            code = parts[0];
            
            if (code) {
                code = Util.trim(code);
                keyword = (code.match(this.KEY_WORDS_REG) || '')[0];
                
                if (keyword) {
                    body += this.GRAMMER_MAP[keyword].call(this, code) + '\n';
                } else {
                    body += 'html += (tmp = (' + code + ')) ? tmp : \'\';\n';
                }
            }
            
            if (parts[1]) {
                body += 'html += ' + this.getWrapper(parts[1]) + ';\n';
            }
        });
        body += 'return html;';
        
        return body;
    }
    
    /**
     * 过滤器解析
     */
    filterRule(code) {
        
    }

    /**
     * [render 渲染模版]
     * @param  {[type]} tpl  [description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    render(tpl, data) {
        
    }
    
    /**
     * 替换特殊字符
     */
    getWrapper(code) {
        if (this.options.compress) {
            code = code.replace(/\s+/g, ' ').replace(/<!--[\w\W]*?-->/g, '');
        }
        return '\'' + code.replace(this.S_PART_1, '\\$1').replace(this.S_PART_2, '\\r').replace(this.S_PART_3, '\\n') + '\'';
    }
}