/* global
	Aggregator
	Group
*/
describe('Aggregator', function() {
	it('should be an aggregator', function() {
		var data = [1, 2, 3];
		var aggregator = new Aggregator(data);

		expect(aggregator.constructor).toBe(Aggregator);
	});

	describe('.find()', function() {
		var condition = function(value) {
			return value === 2;
		};

		it('should find a value', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			expect(aggregator.find(condition))
				.toEqual(2);
		});

		it('should find only one value if multiple match', function() {
			var data = [1, 2, 2, 3];
			var aggregator = new Aggregator(data);

			expect(aggregator.find(condition))
				.toEqual(2);
		});

		it('should find a value in an object', function() {
			var data = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.find('value', condition))
				.toEqual({ value: 2 });
		});

		it('should find a matching value in an object', function() {
			var data = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.find('value', 2))
				.toEqual({ value: 2 });
		});

		it('should find an element where all values match', function() {
			var data = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			];

			var multiCond = function(values) {
				return values.every(function(value) {
					return value === 2;
				});
			};

			var aggregator = new Aggregator(data);

			expect(aggregator.find(['a', 'b'], multiCond))
				.toEqual({ a: 2, b: 2 });
		});

		it('should find an element with a matching list of values', function() {
			var data = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.find(['a', 'b'], 2))
				.toEqual({ a: 2, b: 2 });
		});

		describe('matching with an object', function() {
			it('should find an element where a single key matches a value', function() {
				var data = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				var aggregator = new Aggregator(data);

				expect(aggregator.find({ b: 2 }))
					.toEqual({ a: 2, b: 2 });
			});

			it('should find an element where a single key matches a function', function() {
				var data = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				var aggregator = new Aggregator(data);

				expect(aggregator.find({ b: condition }))
					.toEqual({ a: 2, b: 2 });
			});

			it('should find an element where multiple keys match', function() {
				var data = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				var aggregator = new Aggregator(data);

				expect(aggregator.find({ a: 2, b: condition }))
					.toEqual({ a: 2, b: 2 });
			});
		});

		it('should return null if no value is found', function() {
			var data = [1, 3, 5];
			var aggregator = new Aggregator(data);

			expect(aggregator.find(condition))
				.toBe(null);
		});
	});

	describe('.where()', function() {
		var condition = function(value) {
			return value % 2 === 0;
		};

		it('should filter values', function() {
			var data = [1, 2, 3, 4];
			var aggregator = new Aggregator(data);

			expect(aggregator.where(condition).toArray())
				.toEqual([2, 4]);
		});

		it('should filter values in an object', function() {
			var data = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 },
				{ value: 4 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.where('value', condition).toArray())
				.toEqual([
					{ value: 2 },
					{ value: 4 }
				]);
		});

		it('should filter matching values in an object', function() {
			var data = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.where('value', 2).toArray())
				.toEqual([
					{ value: 2 }
				]);
		});

		it('should filter elements where all values match', function() {
			var data = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			];

			var multiCond = function(values) {
				return values.every(function(value) {
					return value === 2;
				});
			};

			var aggregator = new Aggregator(data);

			expect(aggregator.where(['a', 'b'], multiCond).toArray())
				.toEqual([
					{ a: 2, b: 2 }
				]);
		});

		it('should filter elements with a matching list of values', function() {
			var data = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.where(['a', 'b'], 2).toArray())
				.toEqual([
					{ a: 2, b: 2 }
				]);
		});

		describe('matching with an object', function() {
			it('should find an element where a single key matches a value', function() {
				var data = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				var aggregator = new Aggregator(data);

				expect(aggregator.where({ b: 2 }).toArray())
					.toEqual([
						{ a: 2, b: 2 }
					]);
			});

			it('should find an element where a single key matches a function', function() {
				var data = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				var aggregator = new Aggregator(data);

				expect(aggregator.where({ b: condition }).toArray())
					.toEqual([
						{ a: 2, b: 2 }
					]);
			});

			it('should find an element where multiple keys match', function() {
				var data = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				var aggregator = new Aggregator(data);

				expect(aggregator.where({ a: 2, b: condition }).toArray())
					.toEqual([
						{ a: 2, b: 2 }
					]);
			});
		});
	});

	describe('.map()', function() {
		it('should map elements in a list', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			var map = function(value) {
				return value * 2;
			};

			expect(aggregator.map(map).toArray())
				.toEqual([2, 4, 6]);
		});

		it('should extract values from elements', function() {
			var data = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.map('value').toArray())
				.toEqual([1, 2, 3]);
		});
	});

	describe('.flatMap()', function() {
		it('should flatten a list of arrays', function() {
			var data = [
				[1, 2, 3],
				[4, 5, 6]
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.flatMap().toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('should flatten a list of Aggregators', function() {
			var data = [
				new Aggregator([1, 2, 3]),
				new Aggregator([4, 5, 6])
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.flatMap().toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('should map elements in a list and flatten them', function() {
			var data = [
				{ value: [1, 2, 3] },
				{ value: new Aggregator([4, 5, 6]) }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.flatMap('value').toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('should extract values from elements and flatten them', function() {
			var data = [
				{ value: [1, 2, 3] },
				{ value: new Aggregator([4, 5, 6]) }
			];

			var aggregator = new Aggregator(data);

			var map = function(elem) {
				return elem.value;
			};

			expect(aggregator.flatMap(map).toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});
	});

	describe('.reduce()', function() {
		describe('with mapping', function() {
			it('should sum up mapped elements', function() {
				var data = [
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				];

				var aggregator = new Aggregator(data);

				var map = function(elem) {
					return elem.value;
				};

				var reducer = function(sum, elem) {
					return sum + elem;
				};

				expect(aggregator.reduce(map, reducer, 0))
					.toBe(6);
			});

			it('should sum up values from a list', function() {
				var data = [
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				];

				var aggregator = new Aggregator(data);

				var reducer = function(sum, elem) {
					return sum + elem;
				};

				expect(aggregator.reduce('value', reducer, 0))
					.toBe(6);
			});
		});

		describe('direct', function() {
			it('should sum up a list', function() {
				var data = [1, 2, 3];
				var aggregator = new Aggregator(data);

				var reducer = function(sum, elem) {
					return sum + elem;
				};

				expect(aggregator.reduce(reducer, 0))
					.toBe(6);
			});
		});
	});
	describe('.sort()', function() {
		it('should sort a list by a field', function() {
			var data = [
				{ value: 3 },
				{ value: 2 },
				{ value: 1 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.sort('value').toArray())
				.toEqual([
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				]);
		});

		it('should sort a list with a function', function() {
			var data = [
				{ value: 3 },
				{ value: 2 },
				{ value: 1 }
			];

			var aggregator = new Aggregator(data);

			var value = function(element) {
				return element.value;
			};

			expect(aggregator.sort(value).toArray())
				.toEqual([
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				]);
		});

		it('shourt sort a list by multiple fields', function() {
			var data = [
				{ value1: 2, value2: 2 },
				{ value1: 2, value2: 1 },
				{ value1: 1, value2: 2 },
				{ value1: 1, value2: 1 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.sort('value1', 'value2').toArray())
				.toEqual([
					{ value1: 1, value2: 1 },
					{ value1: 1, value2: 2 },
					{ value1: 2, value2: 1 },
					{ value1: 2, value2: 2 }
				]);
		});
	});

	describe('.reverse()', function() {
		it('should reverse the order', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			expect(aggregator.reverse().toArray())
				.toEqual([3, 2, 1]);
		});
	});

	describe('.count()', function() {
		it('should return the length of the data', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			expect(aggregator.count())
				.toBe(3);
		});

		it('should only count elements that match the given condition', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			var match = function(value) {
				return value % 2 !== 0;
			};

			expect(aggregator.count(match))
				.toBe(2);
		});

		it('should only count elements where values match the given condition', function() {
			var data = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			var aggregator = new Aggregator(data);

			var match = function(value) {
				return value % 2 !== 0;
			};

			expect(aggregator.count('value', match))
				.toBe(2);
		});
	});

	describe('.has()', function() {
		var match = function(value) {
			return value % 2 === 0;
		};

		describe('without key', function() {
			it('should yield true if there is one match', function() {
				var data = [1, 2, 3];
				var aggregator = new Aggregator(data);

				expect(aggregator.has(match))
					.toBe(true);
			});

			it('should not yield true if there are no matches', function() {
				var data = [1, 3, 5];
				var aggregator = new Aggregator(data);

				expect(aggregator.has(match))
					.toBe(false);
			});
		});

		describe('with key', function() {
			it('should yield true if one value matches', function() {
				var data = [
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				];

				var aggregator = new Aggregator(data);

				expect(aggregator.has('value', match))
					.toBe(true);
			});

			it('should not yield true if none of the values matches', function() {
				var data = [
					{ value: 1 },
					{ value: 3 },
					{ value: 5 }
				];

				var aggregator = new Aggregator(data);

				expect(aggregator.has('value', match))
					.toBe(false);
			});
		});
	});

	describe('.all()', function() {
		var match = function(value) {
			return value % 2 === 0;
		};

		describe('without key', function() {
			it('should yield true if all elements match', function() {
				var data = [2, 4, 6];
				var aggregator = new Aggregator(data);

				expect(aggregator.all(match))
					.toBe(true);
			});

			it('should not yield true if there is one mismatch', function() {
				var data = [1, 2, 4];
				var aggregator = new Aggregator(data);

				expect(aggregator.all(match))
					.toBe(false);
			});
		});

		describe('with key', function() {
			it('should yield true if all values match', function() {
				var data = [
					{ value: 2 },
					{ value: 4 },
					{ value: 6 }
				];

				var aggregator = new Aggregator(data);

				expect(aggregator.all('value', match))
					.toBe(true);
			});

			it('should not yield true if one value does not match', function() {
				var data = [
					{ value: 1 },
					{ value: 2 },
					{ value: 4 }
				];

				var aggregator = new Aggregator(data);

				expect(aggregator.all('value', match))
					.toBe(false);
			});
		});
	});

	describe('.sum()', function() {
		it('should sum up flat list', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			expect(aggregator.sum())
				.toBe(6);
		});

		it('should sum up a value from an object', function() {
			var data = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.sum('value'))
				.toBe(6);
		});
	});

	describe('.avg()', function() {
		it('should average a flat list', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			expect(aggregator.avg())
				.toBe(2);
		});

		it('should average a value from an object', function() {
			var data = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.avg('value'))
				.toBe(2);
		});
	});

	describe('.append()', function() {
		it('should append an array', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			var append = [4, 5, 6];

			expect(aggregator.append(append).toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('should append another Aggregator', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			var append = new Aggregator([4, 5, 6]);

			expect(aggregator.append(append).toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('should append multiple elements', function() {
			var aggregator = new Aggregator([1, 2]);

			var result = aggregator
				.append(
					[3, 4],
					new Aggregator([5, 6])
				);

			expect(result.toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});
	});

	describe('.removeDuplicates()', function() {
		it('should remove duplicates from flat list', function() {
			var data = [1, 2, 2, 3];
			var aggregator = new Aggregator(data);

			expect(aggregator.removeDuplicates().toArray())
				.toEqual([1, 2, 3]);
		});

		it('it should remove duplicate keys from a list', function() {
			var data = [
				{ id: 1, value: 'a' },
				{ id: 2, value: 'b' },
				{ id: 2, value: 'b' },
				{ id: 3, value: 'c' }
			];

			var aggregator = new Aggregator(data);

			expect(aggregator.removeDuplicates('id').toArray())
				.toEqual([
					{ id: 1, value: 'a' },
					{ id: 2, value: 'b' },
					{ id: 3, value: 'c' }
				]);
		});

		it('it should remove duplicate combinations from a list', function() {
			var data = [
				{ a: 1, b: 5 },
				{ a: 2, b: 4 },
				{ a: 3, b: 3 }
			];

			var aggregator = new Aggregator(data);

			var combo = function(elem) {
				return elem.a + elem.b;
			};

			expect(aggregator.removeDuplicates(combo).toArray())
				.toEqual([
					{ a: 1, b: 5 }
				]);
		});
	});

	describe('.getCommonElements()', function() {
		describe('from object', function() {
			it('should get common elements from a flat list', function() {
				var aggregator1 = new Aggregator([1, 2, 3]);
				var aggregator2 = new Aggregator([2, 3, 4]);

				expect(aggregator1.getCommonElements(aggregator2).toArray())
					.toEqual([2, 3]);
			});

			it('should get common elements by a key', function() {
				var aggregator1 = new Aggregator([
					{ id: 1, value: 'a' },
					{ id: 2, value: 'b' },
					{ id: 3, value: 'c' }
				]);

				var aggregator2 = new Aggregator([
					{ id: 2, value: 'b' },
					{ id: 3, value: 'c' },
					{ id: 4, value: 'd' }
				]);

				expect(aggregator1.getCommonElements('id', aggregator2).toArray())
					.toEqual([
						{ id: 2, value: 'b' },
						{ id: 3, value: 'c' }
					]);
			});

			it('should get common combination elements', function() {
				var aggregator1 = new Aggregator([
					{ a: 1, b: 2 },
					{ a: 2, b: 2 },
					{ a: 3, b: 2 }
				]);

				var aggregator2 = new Aggregator([
					{ a: 1, b: 3 },
					{ a: 2, b: 3 },
					{ a: 3, b: 3 }
				]);

				var combo = function(elem) {
					return elem.a + elem.b;
				};

				expect(aggregator1.getCommonElements(combo, aggregator2).toArray())
					.toEqual([
						{ a: 2, b: 2 },
						{ a: 3, b: 2 }
					]);
			});
		});

		describe('from constructor', function() {
			it('should get common elements from flat lists', function() {
				var aggregator1 = new Aggregator([1, 2, 3]);
				var aggregator2 = new Aggregator([2, 3, 4]);

				expect(Aggregator.getCommonElements(aggregator1, aggregator2).toArray())
					.toEqual([2, 3]);
			});

			it('should get common keys from lists', function() {
				var aggregator1 = new Aggregator([
					{ id: 1, value: 'a' },
					{ id: 2, value: 'b' },
					{ id: 3, value: 'c' }
				]);

				var aggregator2 = new Aggregator([
					{ id: 2, value: 'b' },
					{ id: 3, value: 'c' },
					{ id: 4, value: 'd' }
				]);

				expect(Aggregator.getCommonElements('id', aggregator1, aggregator2).toArray())
					.toEqual([
						{ id: 2, value: 'b' },
						{ id: 3, value: 'c' }
					]);
			});
		});
	});

	describe('.group()', function() {
		it('should group by a field', function() {
			var data = [
				{ gender: 'M', name: 'Adam' },
				{ gender: 'M', name: 'Beat' },
				{ gender: 'F', name: 'Clair' },
				{ gender: 'F', name: 'Delilah' }
			];

			var aggregator = new Aggregator(data);

			var group = aggregator.group('gender');

			expect(group.keys())
				.toEqual(['M', 'F']);

			expect(group.get('F').toArray())
				.toEqual([
					{ gender: 'F', name: 'Clair' },
					{ gender: 'F', name: 'Delilah' }
				]);

			expect(group.get('M').toArray())
				.toEqual([
					{ gender: 'M', name: 'Adam' },
					{ gender: 'M', name: 'Beat' }
				]);
		});

		it('should group by a function', function() {
			var data = [
				{ gender: 'M', name: 'Adam' },
				{ gender: 'M', name: 'Beat' },
				{ gender: 'F', name: 'Clair' },
				{ gender: 'F', name: 'Delilah' }
			];

			var aggregator = new Aggregator(data);

			var group = aggregator.group('gender');

			expect(group.keys())
				.toEqual(['M', 'F']);

			expect(group.get('F').toArray())
				.toEqual([
					{ gender: 'F', name: 'Clair' },
					{ gender: 'F', name: 'Delilah' }
				]);

			expect(group.get('M').toArray())
				.toEqual([
					{ gender: 'M', name: 'Adam' },
					{ gender: 'M', name: 'Beat' }
				]);
		});

		it('should produce deep groups for multiple keys', function() {
			var data = [
				{ gender: 'M', age: 17, name: 'Adam' },
				{ gender: 'M', age: 23, name: 'Beat' },
				{ gender: 'F', age: 29, name: 'Clair' },
				{ gender: 'F', age: 17, name: 'Delilah' },
				{ gender: 'F', age: 17, name: 'Esther' },
				{ gender: 'M', age: 23, name: 'Fabio' },
				{ gender: 'F', age: 29, name: 'Geraldine' },
				{ gender: 'M', age: 17, name: 'Harald' }
			];

			var aggregator = new Aggregator(data);

			var result = aggregator.group('gender', 'age');

			expect(result.constructor).toBe(Group);

			expect(result.get('M').constructor).toBe(Group);
			expect(result.get('F').constructor).toBe(Group);

			expect(result.get('M').get('17').constructor).toBe(Aggregator);
			expect(result.get('M').get('23').constructor).toBe(Aggregator);
			expect(result.get('F').get('29').constructor).toBe(Aggregator);
			expect(result.get('F').get('17').constructor).toBe(Aggregator);

			expect(
				result
					.get('M')
					.get('17')
					.toArray()
			).toEqual([data[0], data[7]]);

			expect(
				result
					.get('M')
					.get('23')
					.toArray()
			).toEqual([data[1], data[5]]);

			expect(
				result
					.get('F')
					.get('29')
					.toArray()
			).toEqual([data[2], data[6]]);

			expect(
				result
					.get('F')
					.get('17')
					.toArray()
			).toEqual([data[3], data[4]]);
		});
	});

	describe('.toArray()', function() {
		it('should return the data as an array', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			expect(aggregator.toArray())
				.toEqual([1, 2, 3]);
		});

		it('should not return the original array', function() {
			var data = [1, 2, 3];
			var aggregator = new Aggregator(data);

			var array = aggregator.toArray();

			expect(array).not.toBe(data);

			data.push(4);

			expect(aggregator.count()).toBe(4);
			expect(array.length).toBe(3);
		});
	});

	describe('.toMap()', function() {
		var data = [
			{ id: 1, value: 'a' },
			{ id: 2, value: 'b' },
			{ id: 3, value: 'c' }
		];

		it('should return a map from a string key', function() {
			var aggregator = new Aggregator(data);

			expect(aggregator.toMap('id'))
				.toEqual({
					'1': { id: 1, value: 'a' },
					'2': { id: 2, value: 'b' },
					'3': { id: 3, value: 'c' }
				});
		});

		it('sould return a map from a function key', function() {
			var aggregator = new Aggregator(data);

			var key = function(elem) {
				return elem.id;
			};

			expect(aggregator.toMap(key))
				.toEqual({
					'1': { id: 1, value: 'a' },
					'2': { id: 2, value: 'b' },
					'3': { id: 3, value: 'c' }
				});
		});

		it('should not overwrite an existing duplicate', function() {
			var data2 = [
				{ name: 'A', age: 28 },
				{ name: 'B', age: 29 },
				{ name: 'A', age: 31 }
			];

			var aggregator = new Aggregator(data2);

			expect(aggregator.toMap('name'))
				.toEqual({
					'A': { name: 'A', age: 28 },
					'B': { name: 'B', age: 29 }
				});
		});
	});
});
