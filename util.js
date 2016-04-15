export default class {

	static each(arr, cb) {
		let i = 0,
			l = arr.length;

		for (; i < l; i++) {
			if (cb.call(arr, arr[i], i) === false) {
				break;
			}
		}		
	}

	static merge(defaults, opts) {
		for (var name in defaults) {
			if (opts[name] === undefined) {
				opts[name] = defaults[name];
			}
   		}

   		return opts;
	}
}