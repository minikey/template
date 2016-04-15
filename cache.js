export default class Cache {

    constructor(limit) {
        this.limit = limit | 0; 
        this.size = 0;
        this.map = Object.create(null);
    }

    shift() {
        var entry = this.head;

        if (entry) {
            this.head = this.head.newer;
            this.head.order = void(0);
            entry.newer = entry.older = void(0);
            this.map[entry.key] = void(0);
            this.size--;
        }

        return entry;
    }

    get(key, returnEntry) {
        let entry = this.map[key];

        if (entry === void(0)) {
            return;
        }

        if (entry === this.tail) {
            return returnEntry ? entry : entry.value;
        }

        if (entry.newer) {
            if (this.head === entry.newer) {
                this.head = entry;
            }

            entry.newer.older = entry.older;
        }

        if (entry.older) {
            entry.older.newer = entry.newer;
        }

        entry.newer = void(0);
        entry.older = this.tail;

        if (this.tail) {
            this.tail.newer = entry;
        }

        this.tail = entry;

        return returnEntry ? entry : entry.value;
    }

    put(key, val) {
        let entry = this.get(key, true),
            removed;

        if (this.size === this.limit) {
            removed = this.shift();
        }

        if (!entry) {
            entry = {
                key: key
            };

            this.map[key] = entry;

            if (this.tail) {
                this.tail.newer = entry;
                entry.order = this.tail;
            } else {
                this.head = entry;
            }

            this.tail = entry;
            this.size++;
        }

        entry.value = val;

        return removed;
    }
}