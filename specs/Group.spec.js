/* global
	Group
*/
describe('Group', () => {
	var obj = {
		'a': [1, 2, 3],
		'b': [4, 5, 6]
	};

	var group = new Group(obj);

	it('should be a group', () => {
		expect(group.constructor).toBe(Group);
	});

	describe('.keys()', () => {
		it('should return the keys', () => {
			expect(group.keys().toArray())
				.toEqual(['a', 'b']);
		});
	});

	describe('.values()', () => {
		it('should return the values', () => {
			expect(group.values().toArray())
				.toEqual([
					[1, 2, 3],
					[4, 5, 6]
				]);
		});
	});

	describe('.get()', () => {
		it('should add a key-value pair', () => {
			var group = new Group({});
			group.set('a', [1, 2, 3]);

			expect(group.get('a'))
				.toEqual([1, 2, 3]);
		});
	});

	describe('.set()', () => {
		it('should get a specific value', () => {
			expect(group.get('a'))
				.toEqual([1, 2, 3]);
		});
	});

	describe('.toArray()', () => {
		it('should turn the group into an array with key and items', () => {
			expect(group.toArray())
				.toEqual([
					{
						_key: 'a',
						_items: [1, 2, 3]
					}, {
						_key: 'b',
						_items: [4, 5, 6]
					}
				]);
		});
	});

	describe('.toMap()', () => {
		it('should turn the group into a map', () => {
			expect(group.toMap())
				.toEqual({
					'a': [1, 2, 3],
					'b': [4, 5, 6]
				});
		});

		it('should not return the origina data', () => {
			var obj = {
				'a': [1, 2, 3],
				'b': [4, 5, 6]
			};

			var group = new Group(obj);

			var map = group.toMap();

			expect(map).not.toBe(obj);

			obj['c'] = [7, 8, 9];

			expect(group.keys().size()).toBe(3);
			expect(Object.keys(map).length).toBe(2);
		});
	});

	describe('.toAggregator()', () => {
		it('should turn the group into an Aggregator with key and items', () => {
			expect(group.toAggregator().toArray())
				.toEqual([
					{
						_key: 'a',
						_items: [1, 2, 3]
					}, {
						_key: 'b',
						_items: [4, 5, 6]
					}
				]);
		});
	});
});
