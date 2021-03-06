'use strict';

(function() {
	var parent = this;

	/*
	 * Common
	 */

	var getShallowValue = function(obj, key) {
		var idx1 = key.indexOf('[');

		if (idx1 === -1) {
			return obj[key];
		}

		var idx2 = key.indexOf(']');

		if (idx2 === -1 || idx2 !== key.length - 1 || idx2 <= idx1) {
			throw new Error('Malformatted key: ' + key);
		}

		var name = key.substring(0, idx1);

		var arr = obj[name];

		if (typeof arr === 'undefined') {
			return undefined;
		}

		if (!Array.isArray(arr)) {
			throw new Error('Cannot access array element of ' + (typeof arr));
		}

		var idx = parseInt(key.substring(idx1 + 1, idx2), 10);

		return arr[idx];
	};

	var getDeepValue = function(obj, deepKey) {
		if (deepKey === '.') {
			return obj;
		}

		var keys = deepKey.split('.');

		if (keys.length === 1) {
			return getShallowValue(obj, keys[0]);
		}

		return keys.reduce((iter, key) => {
			if (typeof iter !== 'undefined') {
				return getShallowValue(iter, key);
			}
		}, obj);
	};

	var extractValue = function(elem, extractor, idx) {
		if (typeof extractor === 'function') {
			return extractor(elem, idx);
		} else if (typeof extractor === 'string') {
			return getDeepValue(elem, extractor);
		}

		return elem;
	};

	var evalCondition = function() {
		// 'key', function(val)
		// 'key', val
		// function(elem), function(val)
		// function(elem), val
		// ['key1', 'key2'], function(vals)
		if (arguments.length === 2) {
			var keys = arguments[0];
			var condition = arguments[1];

			// ['key1', 'key2'], function(vals)
			// ['key1', 'key2'], val
			if (Array.isArray(keys)) {
				// ['key1', 'key2'], function(vals)
				if (typeof condition === 'function') {
					return function(elem, idx) {
						return condition(
							keys.map(key => extractValue(elem, key, idx)),
							idx
						);
					};
				}

				// ['key1', 'key2'], val
				return function(elem, idx) {
					return keys.every(key => extractValue(elem, key, idx) === condition);
				};
			}

			// 'key', function(val)
			// function(elem), function(val)
			if (typeof condition === 'function') {
				return function(elem, idx) {
					return condition(
						extractValue(elem, keys),
						idx
					);
				};
			}

			// 'key', val
			// function(elem), val
			return function(elem) {
				return extractValue(elem, keys) === condition;
			};

		// function(val)
		// { 'key1': function(val), 'key2': const }
		} else {
			var condition = arguments[0];

			// typeof condition === 'function'
			if (typeof condition === 'function') {
				return function(elem, idx) {
					return condition(elem, idx);
				};
			}

			// typeof condition === 'object'
			return function(elem, idx) {
				return Object.keys(condition)
					.every(function(key) {
						var cond = condition[key];

						// { 'key': function(val) }
						if (typeof cond === 'function') {
							return cond(getDeepValue(elem, key), idx);

						// { 'key': val }
						} else {
							return (getDeepValue(elem, key) === cond);
						}
					});
			};
		}
	};

	/*
	 * Aggregator
	 */

	parent.Aggregator = function(data) {
		if (!Array.isArray(data)) {
			throw new Error('expected array to be passed into constructor');
		}

		var self = this;

		self._data = data;

		self.forEach = function() {
			var args = arguments;
			var action = evalCondition.apply(self, args);

			self._data.forEach((elem, i) => action(elem, i));

			return self;
		}

		self.find = function() {
			var args = arguments;
			var cond = evalCondition.apply(self, args);

			return self._data.find((elem, i) => cond(elem, i)) || null;
		};

		self.where = function() {
			var args = arguments;
			var cond = evalCondition.apply(self, args);

			return new parent.Aggregator(
				self._data.filter((elem, i) => cond(elem, i))
			);
		};

		var mapData = function(mapper) {
			return self._data
				.map((elem, i) => extractValue(elem, mapper, i));
		};

		self.map = function(mapper) {
			return new parent.Aggregator(
				mapData(mapper)
			);
		};

		self.flatMap = function(mapper) {
			return new parent.Aggregator(
				mapData(mapper)
					.reduce(
						(collector, partial) => collector.append(partial),
						new parent.Aggregator([])
					)
					.toArray()
			);
		};

		self.reduce = function() {
			var values;
			var reducer;
			var initial;

			if (arguments.length > 2) {
				values = mapData(arguments[0]);
				reducer = arguments[1];
				initial = arguments[2];
			} else {
				values = self._data;
				reducer = arguments[0];
				initial = arguments[1];
			}

			return values.reduce(reducer, initial);
		};

		self.sort = function() {
			var sorted = self._data.slice(); // copy for decoupling

			var comparators = arguments;

			sorted.sort((lhs, rhs) => {
				for (var i = 0; i < comparators.length; ++i) {
					var comparator = comparators[i];

					var lhv = extractValue(lhs, comparator);
					var rhv = extractValue(rhs, comparator);

					if (lhv > rhv) {
						return 1;
					} else if (lhv < rhv) {
						return -1;
					}
				}

				return 0;
			});

			return new parent.Aggregator(
				sorted
			);
		};

		self.sortWith = function(fn) {
			var sorted = self._data.slice(); // copy for decoupling

			sorted.sort(fn);

			return new parent.Aggregator(
				sorted
			);
		}

		self.reverse = function() {
			return new parent.Aggregator(
				self._data.reverse()
			);
		};

		self.count = function() {
			if (arguments.length === 0) {
				return self._data.length;
			}

			var args = arguments;
			var cond = evalCondition.apply(self, args);

			return self._data.reduce(
				(sum, elem, i) => sum + (cond(elem, i) ? 1 : 0),
				0
			);
		};

		self.has = function() {
			var args = arguments;
			var cond = evalCondition.apply(self, args);

			return self._data.some((elem, i) => cond(elem, i));
		};

		self.all = function() {
			var args = arguments;
			var cond = evalCondition.apply(self, args);

			return self._data.every((elem, i) => cond(elem, i));
		};

		self.size = function () {
			return self._data.length;
		};

		self.sum = function() {
			var key;
			if (arguments.length > 0) {
				key = arguments[0];
			}

			return self._data.reduce(
				(sum, elem) => sum + (key ? getDeepValue(elem, key) : elem),
				0
			);
		};

		self.avg = function() {
			var sum = self.sum.apply(self, arguments);

			return sum / self.size();
		};

		self.append = function() {
			var args = Array.prototype.slice.call(arguments);

			return new parent.Aggregator(
				args
					.reduce((collector, arg) => {
						if (arg.constructor === parent.Aggregator) {
							return collector.concat(arg.toArray());
						}

						// works for array and element
						return collector.concat(arg);
					}, self._data)
			);
		};

		var fromMap = function(map) {
			return new parent.Aggregator(
				Object.keys(map)
					.map(key => map[key])
			);
		};

		self.removeDuplicates = function(key) {
			return fromMap(self.toMap(key));
		};

		// TODO: How about identifying by multiple conditions?
		//	   it's already (semi) possible, by using a function..
		self.getCommonElements = function() {
			var key;
			var startIdx;

			if (arguments[0].constructor === parent.Aggregator) {
				startIdx = 0;
			} else {
				startIdx = 1;
				key = arguments[0];
			}

			var map = self.toMap(key);

			for (var i = startIdx; i < arguments.length; ++i) {
				var newMap = {};

				arguments[i]._data
					.forEach((elem, idx) => {
						var keyValue = extractValue(elem, key, idx);

						if (map.hasOwnProperty(keyValue)) {
							newMap[keyValue] = map[keyValue];
						}
					});

				map = newMap;
			}

			return fromMap(map);
		};

		var generateGroup = function(aggregator, grouper) {
			var grouped = {};

			aggregator._data.forEach((elem, i) => {
				var value = extractValue(elem, grouper, i);

				if (!grouped.hasOwnProperty(value)) {
					grouped[value] = [];
				}

				grouped[value].push(elem);
			});

			Object.keys(grouped).forEach(key => grouped[key] = new parent.Aggregator(grouped[key]));

			return new parent.Group(grouped);
		};

		self.group = function() {
			var base;
			var iter;

			for (var i = 0; i < arguments.length; ++i) {
				var grouper = arguments[i];

				if (i === 0) {
					base = generateGroup(this, grouper);
					iter = [base];
				} else {
					var newIter = [];

					iter.forEach(group => {
						group.keys().forEach(key => {
							var newGroup = generateGroup(group.get(key), grouper);

							group.set(key, newGroup);
							newIter.push(newGroup);
						});
					});

					iter = newIter;
				}
			}

			return base;
		};

		self.toArray = function() {
			return self._data.slice(); // copy for decoupling
		};

		self.toMap = function(key) {
			var map = {};

			self._data.forEach((elem, i) => {
				var keyValue = extractValue(elem, key, i);

				if (!map.hasOwnProperty(keyValue)) {
					map[keyValue] = elem;
				}
			});

			return map;
		};

		return self;
	};

	parent.Aggregator.getCommonElements = function() {
		var aggregator;
		var args;

		if (arguments[0].constructor === parent.Aggregator) {
			aggregator = arguments[0];
			args = Array.prototype.slice.call(arguments).slice(1);
		} else {
			aggregator = arguments[1];
			args = [arguments[0]].concat(Array.prototype.slice.call(arguments).slice(2));
		}

		return aggregator.getCommonElements.apply(this, args);
	};

	/*
	 * Group
	 */

	parent.Group = function(data) {
		if (typeof data !== 'object') {
			throw new Error('expected object to be passed into constructor');
		}

		var self = this;

		self._data = data;

		self.keys = function() {
			return new parent.Aggregator(Object.keys(self._data));
		};

		self.values = function() {
			return new parent.Aggregator(
				Object.keys(self._data)
					.map(key => self._data[key])
			);
		};

		self.get = function(key) {
			return self._data[key];
		};

		self.set = function(key, value) {
			self._data[key] = value;

			return self;
		};

		self.toArray = function() {
			return Object.keys(self._data).map(key => {
				return {
					_key: key,
					_items: self._data[key]
				};
			});
		};

		self.toMap = function() {
			var copy = {}; // copy for decoupling

			Object.keys(self._data).forEach(key => copy[key] = self._data[key]);

			return copy;
		};

		self.toAggregator = function() {
			return new parent.Aggregator(self.toArray());
		};

		return self;
	};

	/*
	 * Condition Matchers
	 */

	var keyMatcher = function(inner, args) {
		var key;

		if (args.length > 0) {
			key = args[0];
		}

		return function(value) {
			return inner(
				key ? extractValue(value, key) : value
			);
		};
	};

	var keyValueMatcher = function(inner, args) {
		var key;
		var reference;

		if (args.length > 1) {
			key = args[0];
			reference = args[1];
		} else {
			reference = args[0];
		}

		return function(value) {
			return inner(
				key ? extractValue(value, key) : value,
				reference
			);
		};
	};

	var multiKeyValueMatcher = function(inner, args) {
		var keys;
		var reference;

		if (args.length > 1) {
			keys = args[0];
			reference = args[1];

			if (!Array.isArray(keys)) {
				keys = [keys];
			}
		} else {
			reference = args[0];
		}

		return function(value) {
			return inner(
				keys ? keys.map(extractValue.bind(undefined, value)) : value,
				reference
			);
		};
	};

	parent.eq = function() {
		return keyValueMatcher.call(this, function(value, reference) {
			return value === reference;
		}, arguments);
	};

	parent.neq = function() {
		return keyValueMatcher.call(this, function(value, reference) {
			return value !== reference;
		}, arguments);
	};

	parent.gt = function() {
		return keyValueMatcher.call(this, function(value, reference) {
			return value > reference;
		}, arguments);
	};

	parent.lt = function() {
		return keyValueMatcher.call(this, function(value, reference) {
			return value < reference;
		}, arguments);
	};

	parent.gte = function() {
		return keyValueMatcher.call(this, function(value, reference) {
			return value >= reference;
		}, arguments);
	};

	parent.lte = function() {
		return keyValueMatcher.call(this, function(value, reference) {
			return value <= reference;
		}, arguments);
	};

	parent.isNull = function() {
		return keyMatcher.call(this, function(value) {
			return value === null || typeof value === 'undefined';
		}, arguments);
	};

	parent.not = function(cond) {
		return function(value) {
			return !cond(value);
		};
	};

	parent.and = function() {
		var args = Array.prototype.slice.call(arguments);

		return function(value) {
			return args.every(arg => evalCondition(arg)(value));
		};
	};

	parent.or = function() {
		var args = Array.prototype.slice.call(arguments);

		return function(value) {
			return args.some(arg => evalCondition(arg)(value));
		};
	};

	parent.all = function() {
		return multiKeyValueMatcher.call(this, function(values, cond) {
			return new parent.Aggregator(values)
				.all(cond);
		}, arguments);
	};

	parent.one = function() {
		return multiKeyValueMatcher.call(this, function(values, cond) {
			return new parent.Aggregator(values)
				.has(cond);
		}, arguments);
	};

	parent.test = function () {
		return true;
	};

	/*
	 * Fuzzy Matcher
	 */

	var fuzzySearch = (function() {
		var self = {};

		self._config = {
			ignoreCase: true,
			minLength: 3,
			fuzzyLimit: 0.75
		};

		self.configure = function() {
			if (arguments.length === 1) {
				var cfg = arguments[0];

				Object.keys(cfg).forEach(key => {
					if (self._config.hasOwnProperty(key)) {
						self._config[key] = cfg[key];
					}
				});
			} else {
				var key = arguments[0];
				var value = arguments[1];

				if (self._config.hasOwnProperty(key)) {
					self._config[key] = value;
				}
			}
		};

		self.getConfig = function(key) {
			return self._config[key];
		};

		self.tokenize = function(term) {
			return term
				.split(' ')
				.map(word =>
					word
						.replace(/\W/g, '')
						.trim()
				)
				.filter(word => word.length >= self._config.minLength);
		};

		self.joinWithMatch = function(tokens, matchIdx) {
			return tokens
				.map((token, i) => {
					if (i === matchIdx) {
						return `<b>${token}</b>`;
					}

					return token;
				})
				.join(' ');
		};

		self.getSubstringMatch = function(needleTokens, haystack) {
			var directMatch = null;

			needleTokens.some((needle, i) => {
				var idx = haystack.indexOf(needle);

				if (idx !== -1) {
					directMatch = {
						match: 1,
						matches: [
							self.joinWithMatch(needleTokens, i),
							haystack.substring(0, idx) + '<b>' + haystack.substring(idx, idx + needle.length) + '</b>' + haystack.substring(idx + needle.length)
						]
					};

					return true;
				}

				return false;
			});

			return directMatch;
		};

		self.getJaroMatch = function(lhs, rhs) {
			var m = 0;

			// Exit early if either are empty.
			if (lhs.length === 0 || rhs.length === 0) {
				return 0;
			}

			// Exit early if they're an exact match.
			if (lhs === rhs) {
				return 1;
			}

			var range = (Math.floor(Math.max(lhs.length, rhs.length) / 2)) - 1;
			var lhsMatches = [];
			var rhsMatches = [];

			for (var i = 0; i < lhs.length; i++) {
				var low = (i >= range) ? i - range : 0;
				var high = (i + range <= (rhs.length - 1)) ? (i + range) : (rhs.length - 1);

				for (var j = low; j <= high; j++) {
					if (lhsMatches[i] !== true && rhsMatches[j] !== true && lhs[i] === rhs[j]) {
						++m;
						lhsMatches[i] = rhsMatches[j] = true;
						break;
					}
				}
			}

			// Exit early if no matches were found.
			if (m === 0) {
				return 0;
			}

			// Count the transpositions.
			var k = 0;
			var numTrans = 0;

			for (var i = 0; i < lhs.length; i++) {
				if (lhsMatches[i] === true) {
					for (var j = k; j < rhs.length; j++) {
						if (rhsMatches[j] === true) {
							k = j + 1;
							break;
						}
					}

					if (lhs[i] !== rhs[j]) {
						++numTrans;
					}
				}
			}

			var weight = ((m / lhs.length) + (m / rhs.length) + ((m - (numTrans / 2)) / m)) / 3;
			var l = 0;
			var p = 0.1;

			if (weight > 0.7) {
				while (lhs[l] === rhs[l] && l < 4) {
					++l;
				}

				weight = weight + (l * p * (1 - weight));
			}

			return weight;
		};

		self.getClosestWordMatch = function(needleTokens, haystackTokens) {
			var maxMatch = 0;
			var maxMatchesIdx = [];

			for (var i = 0; i < needleTokens.length; ++i) {
				for (var j = 0; j < haystackTokens.length; ++j) {
					var a = needleTokens[i];
					var b = haystackTokens[j];

					var match = self.getJaroMatch(a, b);

					if (match > maxMatch) {
						maxMatch = match;
						maxMatchesIdx = [i, j];
					}
				}
			}

			return {
				match: maxMatch,
				matches: [
					self.joinWithMatch(needleTokens, maxMatchesIdx[0]),
					self.joinWithMatch(haystackTokens, maxMatchesIdx[1])
				]
			};
		};

		self.getFuzzyResult = function(needle, haystack) {
			if (self._config.ignoreCase) {
				needle = needle.toLowerCase();
				haystack = haystack.toLowerCase();
			}

			var needleTokens = self.tokenize(needle);

			var substringMatch = self.getSubstringMatch(needleTokens, haystack);
			if (substringMatch) {
				return substringMatch;
			}

			var haystackTokens = self.tokenize(haystack);

			return self.getClosestWordMatch(needleTokens, haystackTokens);
		};

		return self;
	})();

	parent.match = function() {
		var fuzzyLimit = fuzzySearch.getConfig('fuzzyLimit');

		return keyValueMatcher.call(this, function(value, reference) {
			return value && fuzzySearch.getFuzzyResult(reference, value).match >= fuzzyLimit;
		}, arguments);
	};

	parent.match.configure = function() {
		fuzzySearch.configure.apply(this, arguments);
	};

	parent.match.getConfig = function() {
		return fuzzySearch.getConfig.apply(this, arguments);
	};
}).call(this);
