export default class Helper {
    constructor() {
        this.escapeMap = {
            'html': this.escapeHTML
        };
    }
    
    escape(text, type) {
        text = text || '';
        type = type || 'html';
        
        let handler = this.escapeMap[type];
        
        if (handler) {
            handler.call(this, text);
        } else {
            throw new Error('没有“' + type + '”这个处理器');
        }
    }
    
    escapeHTML(html) {
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

    substr(str, startIndex, len) {
        return str ? (str + '').slice.call(str, startIndex, len) : '';
    }
}