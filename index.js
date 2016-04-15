import Util from './util';

export default class Template {
    defaults: {
        openTag: '{{',
        endTag: '}}',
        compress: true
    }

    const KEY_WORDS = ['foreach', '/foreach', 'if', 'elseif', '/if'];
    const FOREACH_REG = /^foreach\b(.+)\bas\b(?:(.+?)=>)?(.+)/;
    const IF_REG = /^(if|elseif)\b\s*(.+)\s*/;
    const VAR_REG = /^$/;
    const KEY_WORDS_REG = new RegExp('^\\b' + KEY_WORDS.join('\\b|\\b') + '\\b');
    
    const GRAMMER_MAP = {
        'foreach': function (code) {
            var res = code.match(FOREACH_REG),
                arr = Util.trim(res[1]).replace(VAR_REG, ''),  // 遍历的数组名
                key = Util.trim(res[2]).replace(VAR_REG, ''),  // key
                item = Util.trim(res[3]).replave(VAR_REG, '');

            if (!res || !arr || !item || key === '') {
                throw new Error('foreach 表达式语法错误~');
            } else {
                return '$util.each($data.' + arr + ', function (' + item + ', ' + key ? key : 'i' + '){';
            }
        },
        '/foreach': function () {
            return '});';
        },
        'if': function (code) {
            var res = code.match(IF_REG),
                exp = Util.trim(res[2]);

            if (!res || !exp) {
                throw new Error('if 表达式语法错误~');
            } else {

            }
        },
        '/if': function () {
            return '}';
        },
        'elseif': function (code) {
            
        }
    };

    constructor (opts) {
        this.options = Util.merge(this.defaults, opts);
    }

    /**
     * [complie 编译模版]
     * @param  {[type]} tpl [description]
     * @return {[type]}     [description]
     */
    complie(tpl) {
        var body = 'var html = "";',
            sub,
            ls,
            parts;

        Util.each(tpl.split(this.options.openTag), (text) => {
            text = Util.trim(text);

            parts = text.split(this.options.endTag);

            sub = Util.trim(parts[0]);
            ls  = Util.trim(parts[1]);

            body += 'html += "';
            html += this.getHtml(sub);
        });
    }

    /**
     * [render 渲染模版]
     * @param  {[type]} tpl  [description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    render(tpl, data) {
        
    }

    private express(code) {

    }
}