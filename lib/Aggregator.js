(function(parent) {
	/*
	 * Common
	 */

	var getDeepValue = function(obj, deepKey) {
		if (deepKey === '.') {
			return obj;
		}
		
		var keys = deepKey.split('.');

		if (keys.length === 1) {
			return obj[keys[0]];
		}

		var iter = obj;
		keys.forEach(function(key) {
			if (typeof iter !== 'undefined') {
				iter = iter[key];
			}
		});

		return iter;
	};

	/*
	 * Aggregator
	 */

	parent.Aggregator = function(data) {
		if (!Array.isArray(data)) {
			throw new Error('expected array to be passed into constructor');
		}
		
		var prepareValues = function(obj, keys) {
			if (!keys) {
				return obj;
			}

			if (typeof keys === 'string') {
				return getDeepValue(obj, keys);
			}

			return keys.map(function(key) {
				if (typeof key === 'function') {
					return key(obj);
				} else {
					return getDeepValue(obj, key);
				}
			});
		};
		
		var self = this;
		
		self._data = data;
		
		self.find = function() {
			var key;
			var cond;

			if (arguments.length === 2) {
				key = arguments[0];
				cond = arguments[1];
			} else {
				cond = arguments[0];
			}

			for (var i = 0; i < self._data.length; ++i) {
				if (cond(prepareValues(self._data[i], key), i)) {
					return self._data[i];
				}
			}

			return null;
		};

		self.where = function() {
			var key;
			var cond;

			if (arguments.length === 2) {
				key = arguments[0];
				cond = arguments[1];
			} else {
				cond = arguments[0];
			}

			return new parent.Aggregator(
				self._data.filter(function(elem, i) {
					return cond(prepareValues(elem, key), i);
				})
			);
		};

		// TODO: How about .map(key, mapper)
		//	   it maps the property inside
		self.map = function(mapper) {
			return new parent.Aggregator(
				self._data.map(function(elem, i) {
					return mapper(elem, i);
				})
			);
		};

		self.sort = function() {
			var sorted = self._data.slice(); // copy for decoupling

			var comparators = arguments;

			sorted.sort(function(lhs, rhs) {
				for (var i = 0; i < comparators.length; ++i) {
					var lhv;
					var rhv;

					var comparator = comparators[i];

					if (typeof comparator === 'function') {
						lhv = comparator(lhs);
						rhv = comparator(rhs);
					} else {
						lhv = getDeepValue(lhs, comparator);
						rhv = getDeepValue(rhs, comparator);
					}

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
		
		self.reverse = function() {
			return new parent.Aggregator(
				self._data.reverse()
			);
		};
		
		self.count = function() {
			return self._data.length;
		};
		
		self.has = function() {
			var key;
			var cond;

			if (arguments.length === 2) {
				key = arguments[0];
				cond = arguments[1];
			} else {
				cond = arguments[0];
			}

			return self._data.some(function(elem, i) {
				return cond(prepareValues(elem, key), i);
			});
		};
		
		self.all = function() {
			var key;
			var cond;

			if (arguments.length === 2) {
				key = arguments[0];
				cond = arguments[1];
			} else {
				cond = arguments[0];
			}

			return !self._data.some(function(elem, i) {
				return !cond(prepareValues(elem, key), i);
			});
		};
		
		self.sum = function() {
			var key;
			if (arguments.length > 0) {
				key = arguments[0];
			}
			
			return self._data.reduce(function(sum, elem) {
				return sum + (key ? getDeepValue(elem, key) : elem);
			}, 0);
		};
		
		self.avg = function() {
			var sum = self.sum.apply(self, arguments);
			
			return sum / self._data.length;
		};
		
		var fromMap = function(map) {
			return new parent.Aggregator(
				Object.keys(map).map(function(key) {
					return map[key];
				})
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
				
				arguments[i]._data.forEach(function(elem, i) {
					var keyValue;
					if (typeof key === 'function') {
						keyValue = key(elem, i);
					} else {
						keyValue = getDeepValue(elem, key || '.');
					}
					
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
			
			aggregator._data.forEach(function(elem, i) {
				var value;
				
				if (typeof grouper === 'function') {
					value = grouper(elem, i);
				} else {
					value = getDeepValue(elem, grouper);
				}
				
				if (!grouped.hasOwnProperty(value)) {
					grouped[value] = [];
				}
				
				grouped[value].push(elem);
			});
			
			Object.keys(grouped).forEach(function(key) {
				grouped[key] = new parent.Aggregator(grouped[key]);
			});
			
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

					iter.forEach(function(group) {
						group.keys().forEach(function(key) {
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
			
			self._data.forEach(function(elem, i) {
				var keyValue;
				if (typeof key === 'function') {
					keyValue = key(elem, i);
				} else {
					keyValue = getDeepValue(elem, key || '.');
				}
				
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
			return Object.keys(self._data);
		};
		
		self.values = function() {
			return Object.keys(self._data).map(function(key) {
				return self._data[key];
			});
		};
		
		self.get = function(key) {
			return self._data[key];
		};

		self.set = function(key, value) {
			self._data[key] = value;

			return self;
		};
		
		self.toArray = function() {
			return Object.keys(self._data).map(function(key) {
				return {
					_key: key,
					_items: self._data[key]
				};
			});
		};
		
		self.toMap = function() {
			var copy = {}; // copy for decoupling
			
			Object.keys(self._data).forEach(function(key) {
				copy[key] = self._data[key];
			});
			
			return copy;
		};
		
		return self;
	};

	/*
	 * Condition Matchers
	 */

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
				key ? getDeepValue(value, key) : value,
				reference
			);
		};
	};

	var keyMatcher = function(inner, args) {
		var key;

		if (args.length > 0) {
			key = args[0];
		}

		return function(value) {
			return inner(key ? getDeepValue(value, key) : value);
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
				keys ? keys.map(function(key) {
					if (typeof key === 'function') {
						return key(value);
					} else {
						return getDeepValue(value, key);
					}
				}) : value,
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
	
	parent.and = function(lhs, rhs) {
		return function(value) {
			return lhs(value) && rhs(value);
		};
	};
	
	parent.or = function(lhs, rhs) {
		return function(value) {
			return lhs(value) || rhs(value);
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

	/*
	 * Fuzzy Matcher
	 */

	var fuzzySearch = (function() {
		var self = this;

		self._config = {
			ignoreCase: true,
			minLength: 3,
			fuzzyLimit: 0.75
		};

		self.configure = function() {
			if (arguments.length === 1) {
				var cfg = arguments[0];

				Object.keys(cfg).forEach(function(key) {
					if (self._config.hasOwnProperty(key)) {
						self._config[key] = cfg[key];
					}
				});
			} else {
				self._config[arguments[0]] = arguments[1];
			}
		};

		self.getConfig = function(key) {
			return self._config[key];
		};

		self.tokenize = function(term) {
			return term
				.split(' ')
				.map(function(word) {
					return word
						.replace(/\W/g, '')
						.trim();
				})
				.filter(function(word) {
					return word.length >= self._config.minLength;
				});
		};

		self.joinWithMatch = function(tokens, matchIdx) {
			return tokens
				.map(function(token, i) {
					if (i === matchIdx) {
						return '<b>' + token + '</b>';
					}

					return token;
				})
				.join(' ');
		};

		self.getSubstringMatch = function(needleTokens, haystack) {
			var directMatch = null;

			needleTokens.some(function(needle, i) {
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

		self.getFuzzyResult = this.getFuzzyResult = function(needle, haystack) {
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
			return value && fuzzySearch.getFuzzyResult(reference, value).match > fuzzyLimit;
		}, arguments);
	};

	parent.match.configure = function() {
		fuzzySearch.configure.apply(this, arguments);
	};

	parent.match.getConfig = function() {
		return fuzzySearch.getConfig.apply(this, arguments);
	};
})(window);
