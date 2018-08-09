export function getShallowValue(obj: any, key: string, fallback?: any): any {
	var idx1: number = key.indexOf('[');

	if (idx1 === -1) {
		return obj[key];
	}

	var idx2: number = key.indexOf(']');

	if (idx2 === -1 || idx2 !== key.length - 1 || idx2 <= idx1) {
		throw new Error('Malformatted key: ' + key);
	}

	var name: string = key.substring(0, idx1);

	var arr: string = obj[name];

	if (typeof arr === 'undefined') {
		return fallback;
	}

	if (!Array.isArray(arr)) {
		throw new Error('Cannot access array element of ' + (typeof arr));
	}

	var idx = parseInt(key.substring(idx1 + 1, idx2), 10);

	return arr[idx];
}

export function getDeepValue(obj: any, deepKey: string, fallback?: any): any {
	if (deepKey === '.') {
		return obj;
	}

	var keys: string[] = deepKey.split('.');

	if (keys.length === 1) {
		return getShallowValue(obj, keys[0]);
	}

	return keys.reduce((iter, key) => {
		if (iter != null) {
			return getShallowValue(iter, key);
		}

		return undefined;
	}, obj) || fallback;
}

export function extractValue(elem: any, extractor: Function | string | undefined, idx?: number): any {
	switch (typeof extractor) {
		case 'function':
			return (extractor as Function)(elem, idx);

		case 'string':
			return getDeepValue(elem, extractor as string);
	}

	return elem;
}

export function evalCondition(...args: any[]): (...args: any[]) => boolean {
	// 'key', function(val)
	// 'key', val
	// function(elem), function(val)
	// function(elem), val
	// ['key1', 'key2'], function(vals)
	if (args.length === 2) {
		var keys: any = args[0];
		var condition: any = args[1];

		// ['key1', 'key2'], function(vals)
		// ['key1', 'key2'], val
		if (Array.isArray(keys)) {
			// ['key1', 'key2'], function(vals)
			if (typeof condition === 'function') {
				return (elem: any, idx: number) =>
					condition(
						keys.map((key: string) => extractValue(elem, key, idx)),
						idx
					);
			}

			// ['key1', 'key2'], val
			return (elem, idx) => keys.every((key: string) => extractValue(elem, key, idx) === condition);
		}

		// 'key', function(val)
		// function(elem), function(val)
		if (typeof condition === 'function') {
			return (elem: any, idx: number) =>
				condition(
					extractValue(elem, keys),
					idx
				);
		}

		// 'key', val
		// function(elem), val
		return (elem: any) => extractValue(elem, keys) === condition;

	// function(val)
	// { 'key1': function(val), 'key2': const }
	} else {
		var condition = args[0];

		// typeof condition === 'function'
		if (typeof condition === 'function') {
			return (elem: any, idx: number) => condition(elem, idx);
		}

		// typeof condition === 'object'
		return (elem: any, idx: number) =>
			Object.keys(condition)
				.every((key: string) => {
					var cond = condition[key];

					// { 'key': function(val) }
					if (typeof cond === 'function') {
						return cond(getDeepValue(elem, key), idx);

						// { 'key': val }
					} else {
						return (getDeepValue(elem, key) === cond);
					}
				});
	}
}
