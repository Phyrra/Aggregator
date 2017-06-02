(function(parent) {
	parent.Aggregator = function(data) {
		if (!Array.isArray(data)) {
			throw new Error('expected array to be passed into constructor');
		}
		
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
		}
		
		var self = this;
		
		self._data = data;
		
		self.find = function(cond) {
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

			return new Aggregator(
				self._data.filter(function(elem, i) {
					return cond(prepareValues(elem, key), i);
				})
			);
		};
		
		self.map = function(mapper) {
			return new Aggregator(
				self._data.map(function(elem, i) {
					return mapper(elem, i);
				})
			);
		};
		
		self.sort = function(comparator) {
			var sorted = self._data.slice(); // copy for decoupling
			
			if (typeof comparator === 'function') {
				sorted.sort(comparator);
			} else {
				// TODO: Array?

				sorted.sort(function(lhs, rhs) {
					var lhv = getDeepValue(lhs, comparator);
					var rhv = getDeepValue(rhs, comparator);
					
					if (lhv > rhv) {
						return 1;
					} else if (rhv > lhv) {
						return -1;
					}
					
					return 0;
				});
			}
			
			return new Aggregator(
				sorted
			);
		};
		
		self.reverse = function() {
			return new Aggregator(
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
			return new Aggregator(
				Object.keys(map).map(function(key) {
					return map[key];
				})
			);
		};
		
		self.removeDuplicates = function(key) {
			return fromMap(self.toMap(key));
		};
		
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
				grouped[key] = new Aggregator(grouped[key]);
			});
			
			return new Group(grouped);
		};
		
		self.group = function() {
			var base;
			var iter;

			for (var i = 0; i < arguments.length; ++i) {
				grouper = arguments[i];

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
	
	self.Aggregator.getCommonElements = function() {
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
	
	parent.eq = function(reference) {
		return function(value) {
			return value === reference;
		};
	};
	
	parent.neq = function(reference) {
		return function(value) {
			return value !== reference;
		};
	};
	
	parent.isNull = function() {
		return function(value) {
			return value === null || typeof value === 'undefined';
		};
	};
	
	parent.gt = function(reference) {
		return function(value) {
			return value > reference;
		};
	};
	
	parent.lt = function(reference) {
		return function(value) {
			return value < reference;
		};
	};
	
	parent.gte = function(reference) {
		return function(value) {
			return value >= reference;
		};
	};
	
	parent.lte = function(reference) {
		return function(value) {
			return value <= reference;
		};
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

	parent.all = function(cond) {
		return function(values) {
			if (!Array.isArray(values)) {
				values = [values];
			}

			return new Aggregator(values)
				.all(cond);
		}
	};

	parent.one = function(cond) {
		return function(values) {
			if (!Array.isArray(values)) {
				values = [values];
			}

			return new Aggregator(values)
				.has(cond);
		}
	};
	
	// eq(3).or.eq(4)
	// problem: eq(3) returns a boolean..
	// needs somehow to return an object?!
})(window);