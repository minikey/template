import Util from './util';

export default class Base {
    
    constructor() {
        this.defaults = {
            openTag: '{%',
            endTag: '%}',
            compress: true
        };
        
        this._eachInfo = null; // 循环体信息
        this.init();
    }

    init() {
        this.GRAMMER_MAP = {
            'foreach': function (code) {
                var res = code.match(this.FOREACH_REG),
                    arr = Util.trim(res[1]),  // 遍历的数组名
                    key = Util.trim(res[2]),  // key
                    item = Util.trim(res[3]),
                    keyName;
                
                if (!res || !arr || !item || res[2] === '') {
                    throw new Error('foreach 表达式语法错误~');
                } else {
                    keyName = key || '__i';
                    
                    this._eachInfo = {
                        arr: arr,
                        item: item,
                        index: keyName,
                        atReg: new RegExp('\\' + item + '\\s*@\\s*(index|last)', 'g')
                    };
                    return 'each(' + arr + ', function (' + item + ', ' + keyName + '){\n';
                }
            },
            '/foreach': function () {
                this._eachInfo = null; // 销毁循环
                return '});\n';
            },
            'if': function (code) {
                var res = code.match(this.IF_REG),
                    exp = Util.trim(res[2]);
                    
                if (!res || !exp) {
                    throw new Error('if 表达式语法错误~');
                } else {
                    exp = exp.replace(this.IF_RL_REG, ($0, $1) => {
                        return this.IF_RL_MAP[$1];                        
                    });
                    return 'if (' + exp + ') {\n';
                }
            },
            '/if': function () {
                return '}\n';
            },
            'elseif': function (code) {
                return '} else ' + this['if'].call(this, code);
            },
            'else': function () {
                return '} else {\n';
            }
        };
    }
    
    /**
     * 默认处理器
     */
    defaultHandler(code) {
        var needFilter = true;
        
        if (this.NO_FILTER_REG.test(code)) {
            needFilter = false;
        }
        
        code = (needFilter ? 'escapeHTML' : '') + '((' + code + ') || "")';
        
        return code;
    }
    
    /**
     * 变量过滤器
     */
    paramsFilter(code, def) {
        Util.each(code.replace(this.REMOVE_REG, '')
        .replace(this.SPLIT_REG, ',')
        .replace(this.KEY_WORDS_REG, '')
        .match(this.EXP_REG) || [], (name) => {
            if (!def[name]) {
                if (name.indexOf('$') === 0) {
                    def[name] = '__data.' + name.slice(1);
                } else if (this.helper[name]) {
                    def[name] = '__helper.' + name;
                } else if (this.util[name]) {
                    def[name] = '__util.' + name;
                }
                
                if (def[name]) {
                    def.__list__.push({
                        'key': name,
                        'val': def[name]
                    });   
                }
            }
        });
        return code;
    }
    
    /**
     * 替换特殊字符
     */
    encode(code) {
        if (this.options.compress) {
            code = code.replace(/\s+/g, ' ').replace(/<!--[\w\W]*?-->/g, '');
        }
        return '\'' + code.replace(this.S_PART_1, '\\$1').replace(this.S_PART_2, '\\r').replace(this.S_PART_3, '\\n') + '\'';
    }
    
    GETWORDS_REG = /^[\w\$\/]+/;
    
    KEY_WORDS = ['foreach', '/foreach', 'if', 'elseif', 'else', '/if'];
    FOREACH_REG = /^foreach\b(.+)\bas\b(?:(.+?)=>)?(.+)/;
    IF_REG = /^(if|elseif)\b\s*(.+)\s*/;
    VAR_REG = /^\$/;
    QUOTE_REG = /'/g;
    KEY_WORDS_REG = new RegExp('(' + this.KEY_WORDS.join('|') + ')');
    NUM_REG = /^\d+/;
    
    REMOVE_REG = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
    SPLIT_REG = /[^\w\$]+/g;
    
    // 特殊字符替换正则系列
    S_PART_1 = /('|\\)/g;
    S_PART_2 = /\r/g;
    S_PART_3 = /\n/g;

    FILTER_REG = /\s*[$\w]+\s*\|\s*[$\w]+/;
    EXP_REG = /[\w\$]+/g; // 识别变量名
    
    IF_RL_REG = /\b(or|and)\b/g;
    IF_RL_MAP = {
      'or': '||',
      'and': '&&'
    };
    
    // 不走默认 HTML 标记
    NO_FILTER_REG = /\bno_filter\s*$/;
    
    // 变量输出表达式
    EXP_OUT_REG = /\s*\$[\$\w]+\s*(|\s*[\w\$]+)/;
}