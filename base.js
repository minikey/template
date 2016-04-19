import Util from './util';

export default class Base {
    
    constructor() {
        this.defaults = {
            openTag: '{%',
            endTag: '%}',
            compress: true
        };
        
        this._eachParam = {}, // 循环体关键参数
        this._isInEach; // 是否处于循环体
        
        this.init();
    }

    init() {
        this.GRAMMER_MAP = {
            'foreach': function (code) {
                var res = code.match(Base.FOREACH_REG),
                    arr = Util.trim(res[1]),  // 遍历的数组名
                    key = Util.trim(res[2]),  // key
                    item = Util.trim(res[3]),
                    keyName;
                
                if (!res || !arr || !item || res[2] === '') {
                    throw new Error('foreach 表达式语法错误~');
                } else {
                    this._isInEach = true; // 标记进入循环体解析
                    // 处理变量名
                    arr = arr.replace(Base.EXP_REG, (v) => {
                        return '__data.' + v.slice(1);
                    });
                    
                    key = key && key.replace(Base.EXP_REG, (v) => {
                        return v.slice(1);
                    });
                    
                    item = item.replace(Base.EXP_REG, (v) => {
                        return v.slice(1);
                    });
                    
                    keyName = key || '__i';
                    
                    this._eachParam = {
                        arrName: arr,
                        keyName: keyName,
                        itemName: item,
                        expReg: new RegExp('(?:^|\\s+)(\\$' + item + ')|(\\$' + keyName + ')\\b', 'g'),
                        atReg: new RegExp('\\b' + item + '\\s*@\\s*(index|last)\\b', 'g'),
                        code: '__util.each(' + arr + ', function (' + item + ', ' + keyName + '){'
                    };
                    
                    return this._eachParam;
                }
            },
            '/foreach': function () {
                this._isInEach = false; // 标记退出循环体
                
                return '});';
            },
            'if': function (code) {
                var res = code.match(Base.IF_REG),
                    exp = Util.trim(res[2]);
                    
                if (!res || !exp) {
                    throw new Error('if 表达式语法错误~');
                } else {
                    exp = exp.replace(Base.IF_RL_REG, (v) => {
                        return Base.IF_RL_MAP[v];
                    });
                    
                    if (this._isInEach) { // 如果在循环体中，处理循环特有语法
                        var expReg = this._eachParam.expReg,
                            atReg = this._eachParam.atReg,
                            tmp;

                        exp = exp.replace(expReg, (v, $1, $2) => {
                            tmp = $1 || $2;
                            return ' ' + tmp.slice(1);
                        }).replace(atReg, (v, $1) => {
                            return ' ' + ($1 === 'index' ? this._eachParam.keyName : '(' + this._eachParam.keyName + ' === ' + this._eachParam.arrName + '.length - 1)') + ' ';
                        });
                    }
                    
                    exp = exp.replace(Base.EXP_REG, (v) => {
                        return '__data.' + v.slice(1);
                    });
                    
                    return 'if (' + exp + ') {';
                }
            },
            '/if': function () {
                return '}';
            },
            'elseif': function (code) {
                this['if'].call(this, code);
            },
            'else': function () {
                return '} else {\n';
            }
        };
    }
    
    /**
     * 过滤器解析
     */
    filterRule(code) {
        if (this._isInEach) { // 替换循环变量名
            code = code.replace(this._eachParam.expReg, (v) => {
                return v.slice(1);
            });
        }
        
        code = code.replace(Base.EXP_REG, (v) => { // 给变量名加前缀
            return '__data.' + v.slice(1);
        });
        
        if (Base.FILTER_REG.test(code)) {
            debugger;
            var parts = code.split('|'),
                val,
                params,
                rcode = parts[0];
            
            Util.each(parts, (v, i) => { // params[0] 就是函数名 params[1]存在就是参数部分
                if (i > 0) {
                    params = v.split(':');
                    
                    if (params) {
                        Util.each(params, (vv, ii) => {
                            params[ii] = Util.trim(vv);
                        });
                    }
                    v = Util.trim(v);
                    
                    rcode += '__helper.' + params[0] + '(' + rcode + (params[1] ? ', ' + params[1] : '') + ')';
                }
            });
            return rcode;
        } else {
            return code;
        }
    }
    
    static KEY_WORDS = ['foreach', '/foreach', 'if', 'elseif', 'else', '/if'];
    static FOREACH_REG = /^foreach\b(.+)\bas\b(?:(.+?)=>)?(.+)/;
    static IF_REG = /^(if|elseif)\b\s*(.+)\s*/;
    static VAR_REG = /^\$/;
    static QUOTE_REG = /'/g;
    static KEY_WORDS_REG = new RegExp('^(' + Base.KEY_WORDS.join('|') + ')');

    // 特殊字符替换正则系列
    static S_PART_1 = /('|\\)/g;
    static S_PART_2 = /\r/g;
    static S_PART_3 = /\n/g;

    static FILTER_REG = /\s*[$\w]+\s*\|\s*[$\w]+/;
    static EXP_REG = /\$[\w\$]+/g;
    
    static IF_RL_REG = /\b(or|and)\b/g;
    static IF_RL_MAP = {
      'or': '||',
      'and': '&&'  
    };
}