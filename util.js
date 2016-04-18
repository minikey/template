export default class Util {
    
    static trim(str) {
        let rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        return str ? (str + '').replace(rtrim, '') : '';
    }

    static each(arr, cb) {
        let i = 0,
            l = arr.length;
            
        arr = arr || [];
        if (Util.isArray(arr)) {
            for (; i < l; i++) {
                if (cb.call(arr, arr[i], i) === false) {
                    break;
                }
            }   
        } else {
            for (i in arr) {
                cb.call(arr, arr[i], i);
            }
        }
    }
    
    static isArray(arr) {
        return Array.isArray ? Array.isArray(arr) : Object.prototype.toString.call(arr) === '[object Array]';
    }

    static merge(defaults, opts) {
        for (let name in defaults) {
            if (opts[name] === undefined) {
                opts[name] = defaults[name];
            }
        }

        return opts;
    }
    
    static escapeHTML(html) {
        let escapeMap = {
            "<": "&#60;",
            ">": "&#62;",
            '"': "&#34;",
            "'": "&#39;",
            "&": "&#38;"
        };
        
        function replaceHandler(char) {
            return escapeMap[char];
        }
        
        return html ? (html + '').replace(/&(?![#\w]+;)|[<>'"]/g, replaceHandler) : '';
    }

    static substr(str, startIndex, len) {
        return str ? (str + '').slice.call(str, startIndex, len) : '';
    }
}