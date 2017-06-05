/* global
	Group
*/
describe('Group', function() {
	var obj = {
		'a': [1, 2, 3],
		'b': [4, 5, 6]
	};

	var group = new Group(obj);

	it('should be a group', function() {
		expect(group.constructor).toBe(Group);
	});

	describe('.keys()', function() {
		it('should return the keys', function() {
			expect(group.keys())
				.toEqual(['a', 'b']);
		});
	});

	describe('.values()', function() {
		it('should return the values', function() {
			expect(group.values())
				.toEqual([
					[1, 2, 3],
					[4, 5, 6]
				]);
		});
	});

	describe('.get()', function() {
		it('should add a key-value pair', function() {
			var group = new Group({});
			group.set('a', [1, 2, 3]);
		
			expect(group.get('a'))
				.toEqual([1, 2, 3]);
		});
	});

	describe('.set()', function() {
		it('should get a specific value', function() {
			expect(group.get('a'))
				.toEqual([1, 2, 3]);
		});
	});

	describe('.toArray()', function() {
		it('should turn the group into an array with key and items', function() {
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

	describe('.toMap()', function() {
		it('should turn the group into a map', function() {
			expect(group.toMap())
				.toEqual({
					'a': [1, 2, 3],
					'b': [4, 5, 6]
				});
		});

		it('should not return the origina data', function() {
			var obj = {
				'a': [1, 2, 3],
				'b': [4, 5, 6]
			};

			var group = new Group(obj);

			var map = group.toMap();

			expect(map).not.toBe(obj);

			obj['c'] = [7, 8, 9];

			expect(group.keys().length).toBe(3);
			expect(Object.keys(map).length).toBe(2);
		});
	});
});
