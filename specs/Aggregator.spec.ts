import { Aggregator, SortOrder } from '../src/Aggregator';
import { Group } from '../src/Group';

describe('Aggregator', () => {
	it('should be an aggregator', () => {
		const data: number[] = [1, 2, 3];
		const aggregator: Aggregator = new Aggregator(data);

		expect(aggregator instanceof Aggregator).toBe(true);
	});

	describe('accessing elements', () => {
		const data: any[] = [{
			base: {
				nested: 1,
				arr: [1, 2, 3]
			}
		}];

		const aggregator: Aggregator = new Aggregator(data);

		it('should find a single key', () => {
			const result: any = aggregator.map('base').toArray()[0];

			expect(result).toEqual({
				nested: 1,
				arr: [1, 2, 3]
			});
		});

		describe('nesting', () => {
			it('should find a nested key', () => {
				const result: any = aggregator.map('base.nested').toArray()[0];

				expect(result).toEqual(1);
			});

			it('should return undefined if the nested key does not exist', () => {
				const result: any = aggregator.map('base.none.none').toArray()[0];

				expect(result).toBeUndefined();
			});
		});

		describe('array accessor', () => {
			it('should find an array element', () => {
				const result: any = aggregator.map('base.arr[1]').toArray()[0];

				expect(result).toEqual(2);
			});

			it('should throw an error if the array accessor is not well formatted', () => {
				expect(() => {
					aggregator.map('base.arr[1]m');
				}).toThrow();
			});

			it('should throw an error if the array accessor tries to access a non array', () => {
				expect(() => {
					aggregator.map('base.nested[1]');
				}).toThrow();
			});

			it('should return undefined if the array accessor tries to access an undefined array', () => {
				const result: any = aggregator.map('base.none[1]').toArray()[0];

				expect(result).toBeUndefined();
			});
		});
	});

	describe('.forEach()', () => {
		const spy = jasmine.createSpy('spy');
		const action: Function = (value) => spy(value);

		beforeEach(() => {
			spy.calls.reset();
		});

		it('should execute the function', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			aggregator.forEach(action);

			expect(spy).toHaveBeenCalledWith(1);
			expect(spy).toHaveBeenCalledWith(2);
			expect(spy).toHaveBeenCalledWith(3);
		});

		it('should execute a function on a vaue in an object', () => {
			const data: any[] = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			aggregator.forEach('value', action);

			expect(spy).toHaveBeenCalledWith(1);
			expect(spy).toHaveBeenCalledWith(2);
			expect(spy).toHaveBeenCalledWith(3);
		});
	});

	describe('.find()', () => {
		const condition: Function = (value) => value === 2;

		it('should find a value', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.find(condition))
				.toEqual(2);
		});

		it('should find only one value if multiple match', () => {
			const data: number[] = [1, 2, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.find(condition))
				.toEqual(2);
		});

		it('should find a value in an object', () => {
			const data: any[] = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.find('value', condition))
				.toEqual({ value: 2 });
		});

		it('should find a matching value in an object', () => {
			const data: any[] = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.find('value', 2))
				.toEqual({ value: 2 });
		});

		it('should find an element where all values match', () => {
			const data: any[] = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			];

			const multiCond: Function = (values) =>
				values.every((value) => value === 2);

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.find(['a', 'b'], multiCond))
				.toEqual({ a: 2, b: 2 });
		});

		it('should find an element with a matching list of values', () => {
			const data: any[] = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.find(['a', 'b'], 2))
				.toEqual({ a: 2, b: 2 });
		});

		describe('matching with an object', () => {
			it('should find an element where a single key matches a value', () => {
				const data: any[] = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.find({ b: 2 }))
					.toEqual({ a: 2, b: 2 });
			});

			it('should find an element where a single key matches a function', () => {
				const data: any[] = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.find({ b: condition }))
					.toEqual({ a: 2, b: 2 });
			});

			it('should find an element where multiple keys match', () => {
				const data: any[] = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.find({ a: 2, b: condition }))
					.toEqual({ a: 2, b: 2 });
			});
		});

		it('should return null if no value is found', () => {
			const data: number[] = [1, 3, 5];
			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.find(condition))
				.toBe(null);
		});
	});

	describe('.findUnique()', () => {
		let aggregator: Aggregator;

		beforeEach(() => {
			const data: number[] = [1, 2, 3];
			aggregator = new Aggregator(data);
		});

		it('should find a value', () => {
			const condition: Function = (value) => value % 2 === 0;

			expect(aggregator.findUnique(condition))
				.toEqual(2);
		});

		it('should find nothing', () => {
			const condition: Function = (value) => value > 10;

			expect(aggregator.findUnique(condition))
				.toBeNull();
		});

		it('should throw an error if multiple matches are found', () => {
			const condition: Function = (value) => value > 1;

			expect(() => {
				aggregator.findUnique(condition);
			}).toThrow();
		});
	});

	describe('.where()', () => {
		const condition: Function = (value) => value % 2 === 0;

		it('should filter values', () => {
			const data: number[] = [1, 2, 3, 4];
			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.where(condition).toArray())
				.toEqual([2, 4]);
		});

		it('should filter values in an object', () => {
			const data: any[] = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 },
				{ value: 4 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.where('value', condition).toArray())
				.toEqual([
					{ value: 2 },
					{ value: 4 }
				]);
		});

		it('should filter matching values in an object', () => {
			const data: any[] = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.where('value', 2).toArray())
				.toEqual([
					{ value: 2 }
				]);
		});

		it('should filter elements where all values match', () => {
			const data: any[] = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			];

			const multiCond: Function = (values) =>
				values.every((value) => value === 2);

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.where(['a', 'b'], multiCond).toArray())
				.toEqual([
					{ a: 2, b: 2 }
				]);
		});

		it('should filter elements with a matching list of values', () => {
			const data: any[] = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.where(['a', 'b'], 2).toArray())
				.toEqual([
					{ a: 2, b: 2 }
				]);
		});

		describe('matching with an object', () => {
			it('should find an element where a single key matches a value', () => {
				const data: any[] = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.where({ b: 2 }).toArray())
					.toEqual([
						{ a: 2, b: 2 }
					]);
			});

			it('should find an element where a single key matches a function', () => {
				const data: any[] = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.where({ b: condition }).toArray())
					.toEqual([
						{ a: 2, b: 2 }
					]);
			});

			it('should find an element where multiple keys match', () => {
				const data: any[] = [
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.where({ a: 2, b: condition }).toArray())
					.toEqual([
						{ a: 2, b: 2 }
					]);
			});
		});
	});

	describe('.map()', () => {
		it('should map elements in a list', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			const map: Function = (value) => value * 2;

			expect(aggregator.map(map).toArray())
				.toEqual([2, 4, 6]);
		});

		it('should extract values from elements', () => {
			const data: any[] = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.map('value').toArray())
				.toEqual([1, 2, 3]);
		});
	});

	describe('.flatMap()', () => {
		it('should flatten a list of arrays', () => {
			const data: number[][] = [
				[1, 2, 3],
				[4, 5, 6]
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.flatMap().toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('should flatten a list of Aggregators', () => {
			const data: Aggregator[] = [
				new Aggregator([1, 2, 3]),
				new Aggregator([4, 5, 6])
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.flatMap().toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('should map elements in a list and flatten them', () => {
			const data: any[] = [
				{ value: [1, 2, 3] },
				{ value: new Aggregator([4, 5, 6]) }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.flatMap('value').toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('should extract values from elements and flatten them', () => {
			const data: any[] = [
				{ value: [1, 2, 3] },
				{ value: new Aggregator([4, 5, 6]) }
			];

			const aggregator: Aggregator = new Aggregator(data);

			const map: Function = (elem) => elem.value;

			expect(aggregator.flatMap(map).toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});
	});

	describe('.reduce()', () => {
		describe('with mapping', () => {
			it('should sum up mapped elements', () => {
				const data: any[] = [
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				const map: Function = (elem) => elem.value;

				const reducer: Function = (sum, elem) => sum + elem;

				expect(aggregator.reduce(map, reducer, 0))
					.toBe(6);
			});

			it('should sum up values from a list', () => {
				const data: any[] = [
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				const reducer: Function = (sum, elem) => sum + elem;

				expect(aggregator.reduce('value', reducer, 0))
					.toBe(6);
			});
		});

		describe('direct', () => {
			it('should sum up a list', () => {
				const data: number[] = [1, 2, 3];
				const aggregator: Aggregator = new Aggregator(data);

				const reducer: Function = (sum, elem) => sum + elem;

				expect(aggregator.reduce(reducer, 0))
					.toBe(6);
			});
		});
	});

	describe('.sort()', () => {
		it('should sort a list by a field', () => {
			const data: any[] = [
				{ value: 3 },
				{ value: 2 },
				{ value: 1 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.sort('value').toArray())
				.toEqual([
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				]);
		});

		it('should sort a list with a function', () => {
			const data: any[] = [
				{ value: 3 },
				{ value: 2 },
				{ value: 1 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			const value: Function = (element) => element.value;

			expect(aggregator.sort(value).toArray())
				.toEqual([
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				]);
		});

		it('should sort a list by multiple fields', () => {
			const data: any[] = [
				{ value1: 2, value2: 2 },
				{ value1: 2, value2: 1 },
				{ value1: 1, value2: 2 },
				{ value1: 1, value2: 1 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.sort('value1', 'value2').toArray())
				.toEqual([
					{ value1: 1, value2: 1 },
					{ value1: 1, value2: 2 },
					{ value1: 2, value2: 1 },
					{ value1: 2, value2: 2 }
				]);
		});

		it('should sort a flat map', () => {
			const data: number[] = [3, 2, 1];
			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.sort().toArray())
				.toEqual([1, 2, 3]);
		});

		it('should not manipulate the source', () => {
			const data: number[] = [3, 2, 1];
			const aggregator: Aggregator = new Aggregator(data).sort('.');

			expect(data)
				.toEqual([3, 2, 1]);
		});

		describe('with multiple sorting parameters', () => {
			const sorter: (a: any, b: any) => number = (a, b) => a - b;

			it('should use the sorting function', () => {
				const data: number[] = [3, 2, 1];
				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.sort([sorter]).toArray())
					.toEqual([1, 2, 3]);
			});

			it('should use the sorting function on extracted values', () => {
				const data: any[] = [
					{ value: 3 },
					{ value: 2 },
					{ value: 1 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.sort(['value', sorter]).toArray())
					.toEqual([
						{ value: 1 },
						{ value: 2 },
						{ value: 3 }
					]);
			});

			it('should consider the sorting order on extracted value', () => {
				const data: any[] = [
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.sort([(elem: any) => elem.value, SortOrder.DESC]).toArray())
					.toEqual([
						{ value: 3 },
						{ value: 2 },
						{ value: 1 }
					]);
			});

			it('should consider the sorting order on the sorting function on extracted values', () => {
				const data: any[] = [
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.sort(['value', sorter, SortOrder.DESC]).toArray())
					.toEqual([
						{ value: 3 },
						{ value: 2 },
						{ value: 1 }
					]);

				expect(aggregator.sort([(elem: any) => elem.value, sorter, SortOrder.DESC]).toArray())
					.toEqual([
						{ value: 3 },
						{ value: 2 },
						{ value: 1 }
					]);
			});
		});

		describe('multiple criteria', () => {
			const sorter: (a: any, b: any) => number = (a, b) => a - b;

			it('should allow to extractor with combine sorter', () => {
				const data: any[] = [
					{ value1: 2, value2: 2 },
					{ value1: 2, value2: 1 },
					{ value1: 1, value2: 2 },
					{ value1: 1, value2: 1 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.sort('value1', ['value2', sorter]).toArray())
					.toEqual([
						{ value1: 1, value2: 1 },
						{ value1: 1, value2: 2 },
						{ value1: 2, value2: 1 },
						{ value1: 2, value2: 2 }
					]);
			});
		});
	});

	describe('.reverse()', () => {
		it('should reverse the order', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.reverse().toArray())
				.toEqual([3, 2, 1]);
		});

		it('should not manipulate the source', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data).reverse();

			expect(data)
				.toEqual([1, 2, 3]);
		})
	});

	describe('.count()', () => {
		it('should return the length of the data', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.count())
				.toBe(3);
		});

		it('should only count elements that match the given condition', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			const match: Function = (value) => value % 2 !== 0;

			expect(aggregator.count(match))
				.toBe(2);
		});

		it('should only count elements where values match the given condition', () => {
			const data: any[] = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			const match: Function = (value) => value % 2 !== 0;

			expect(aggregator.count('value', match))
				.toBe(2);
		});
	});

	describe('.has()', () => {
		const match: Function = (value) => value % 2 === 0;

		describe('without key', () => {
			it('should yield true if there is one match', () => {
				const data: number[] = [1, 2, 3];
				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.has(match))
					.toBe(true);
			});

			it('should not yield true if there are no matches', () => {
				const data: any[] = [1, 3, 5];
				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.has(match))
					.toBe(false);
			});
		});

		describe('with key', () => {
			it('should yield true if one value matches', () => {
				const data: any[] = [
					{ value: 1 },
					{ value: 2 },
					{ value: 3 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.has('value', match))
					.toBe(true);
			});

			it('should not yield true if none of the values matches', () => {
				const data: any[] = [
					{ value: 1 },
					{ value: 3 },
					{ value: 5 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.has('value', match))
					.toBe(false);
			});
		});
	});

	describe('.all()', () => {
		const match: Function = (value) => value % 2 === 0;

		describe('without key', () => {
			it('should yield true if all elements match', () => {
				const data: number[] = [2, 4, 6];
				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.all(match))
					.toBe(true);
			});

			it('should not yield true if there is one mismatch', () => {
				const data: number[] = [1, 2, 4];
				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.all(match))
					.toBe(false);
			});
		});

		describe('with key', () => {
			it('should yield true if all values match', () => {
				const data: any[] = [
					{ value: 2 },
					{ value: 4 },
					{ value: 6 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.all('value', match))
					.toBe(true);
			});

			it('should not yield true if one value does not match', () => {
				const data: any[] = [
					{ value: 1 },
					{ value: 2 },
					{ value: 4 }
				];

				const aggregator: Aggregator = new Aggregator(data);

				expect(aggregator.all('value', match))
					.toBe(false);
			});
		});
	});

	describe('.append()', () => {
		it('should append an array', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			var append = [4, 5, 6];

			expect(aggregator.append(append).toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('should append another Aggregator', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			var append = new Aggregator([4, 5, 6]);

			expect(aggregator.append(append).toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('should append multiple elements', () => {
			const aggregator: Aggregator = new Aggregator([1, 2]);

			var result = aggregator
				.append(
					[3, 4],
					new Aggregator([5, 6])
				);

			expect(result.toArray())
				.toEqual([1, 2, 3, 4, 5, 6]);
		});
	});

	describe('.removeDuplicates()', () => {
		it('should remove duplicates from flat list', () => {
			const data: number[] = [1, 2, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.removeDuplicates().toArray())
				.toEqual([1, 2, 3]);
		});

		it('it should remove duplicate keys from a list', () => {
			const data: any[] = [
				{ id: 1, value: 'a' },
				{ id: 2, value: 'b' },
				{ id: 2, value: 'b' },
				{ id: 3, value: 'c' }
			];

			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.removeDuplicates('id').toArray())
				.toEqual([
					{ id: 1, value: 'a' },
					{ id: 2, value: 'b' },
					{ id: 3, value: 'c' }
				]);
		});

		it('it should remove duplicate combinations from a list', () => {
			const data: any[] = [
				{ a: 1, b: 5 },
				{ a: 2, b: 4 },
				{ a: 3, b: 3 }
			];

			const aggregator: Aggregator = new Aggregator(data);

			const combo: Function = (elem) => elem.a + elem.b;

			expect(aggregator.removeDuplicates(combo).toArray())
				.toEqual([
					{ a: 1, b: 5 }
				]);
		});
	});

	describe('.getCommonElements()', () => {
		describe('from object', () => {
			it('should get common elements from a flat list', () => {
				var aggregator1 = new Aggregator([1, 2, 3]);
				var aggregator2 = new Aggregator([2, 3, 4]);

				expect(aggregator1.getCommonElements(aggregator2).toArray())
					.toEqual([2, 3]);
			});

			it('should get common elements by a key', () => {
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

			it('should get common combination elements', () => {
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

				const combo: Function = (elem) => elem.a + elem.b;

				expect(aggregator1.getCommonElements(combo, aggregator2).toArray())
					.toEqual([
						{ a: 2, b: 2 },
						{ a: 3, b: 2 }
					]);
			});
		});
	});

	describe('.toArray()', () => {
		it('should return the data as an array', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.toArray())
				.toEqual([1, 2, 3]);
		});

		it('should not return the original array', () => {
			const data: number[] = [1, 2, 3];
			const aggregator: Aggregator = new Aggregator(data);

			const array: number[] = aggregator.toArray();

			expect(array).not.toBe(data);

			data.push(4);

			expect(aggregator.count()).toBe(4);
			expect(array.length).toBe(3);
		});
	});

	describe('.toMap()', () => {
		const data: any[] = [
			{ id: 1, value: 'a' },
			{ id: 2, value: 'b' },
			{ id: 3, value: 'c' }
		];

		it('should return a map from a string key', () => {
			const aggregator: Aggregator = new Aggregator(data);

			expect(aggregator.toMap('id'))
				.toEqual({
					'1': { id: 1, value: 'a' },
					'2': { id: 2, value: 'b' },
					'3': { id: 3, value: 'c' }
				});
		});

		it('sould return a map from a function key', () => {
			const aggregator: Aggregator = new Aggregator(data);

			const keyExtractor: Function = (elem) => elem.id;

			expect(aggregator.toMap(keyExtractor))
				.toEqual({
					'1': { id: 1, value: 'a' },
					'2': { id: 2, value: 'b' },
					'3': { id: 3, value: 'c' }
				});
		});

		it('should not overwrite an existing duplicate', () => {
			const data2: any[] = [
				{ name: 'A', age: 28 },
				{ name: 'B', age: 29 },
				{ name: 'A', age: 31 }
			];

			const aggregator: Aggregator = new Aggregator(data2);

			expect(aggregator.toMap('name'))
				.toEqual({
					'A': { name: 'A', age: 28 },
					'B': { name: 'B', age: 29 }
				});
		});
	});

	describe('.group()', () => {
		it('should group by a field', () => {
			const data: any[] = [
				{ gender: 'M', name: 'Adam' },
				{ gender: 'M', name: 'Beat' },
				{ gender: 'F', name: 'Clair' },
				{ gender: 'F', name: 'Delilah' }
			];

			var aggregator = new Aggregator(data);

			const group: Group = aggregator.group('gender');

			expect(group.keys().toArray())
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

		it('should group by a function', () => {
			var data = [
				{ gender: 'M', name: 'Adam' },
				{ gender: 'M', name: 'Beat' },
				{ gender: 'F', name: 'Clair' },
				{ gender: 'F', name: 'Delilah' }
			];

			const aggregator: Aggregator = new Aggregator(data);

			const group: Group = aggregator.group('gender');

			expect(group.keys().toArray())
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

		it('should produce deep groups for multiple keys', () => {
			const data: any[] = [
				{ gender: 'M', age: 17, name: 'Adam' },
				{ gender: 'M', age: 23, name: 'Beat' },
				{ gender: 'F', age: 29, name: 'Clair' },
				{ gender: 'F', age: 17, name: 'Delilah' },
				{ gender: 'F', age: 17, name: 'Esther' },
				{ gender: 'M', age: 23, name: 'Fabio' },
				{ gender: 'F', age: 29, name: 'Geraldine' },
				{ gender: 'M', age: 17, name: 'Harald' }
			];

			const aggregator: Aggregator = new Aggregator(data);

			const group: Group = aggregator.group('gender', 'age');

			expect(group.get('M').constructor).toBe(Group);
			expect(group.get('F').constructor).toBe(Group);

			expect(group.get('M').get('17').constructor).toBe(Aggregator);
			expect(group.get('M').get('23').constructor).toBe(Aggregator);
			expect(group.get('F').get('29').constructor).toBe(Aggregator);
			expect(group.get('F').get('17').constructor).toBe(Aggregator);

			expect(
				group
					.get('M')
					.get('17')
					.toArray()
			).toEqual([data[0], data[7]]);

			expect(
				group
					.get('M')
					.get('23')
					.toArray()
			).toEqual([data[1], data[5]]);

			expect(
				group
					.get('F')
					.get('29')
					.toArray()
			).toEqual([data[2], data[6]]);

			expect(
				group
					.get('F')
					.get('17')
					.toArray()
			).toEqual([data[3], data[4]]);
		});
	});
});
