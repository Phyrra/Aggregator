import { Group } from '../src/Group';

describe('Group', () => {
	const obj: any = {
		'a': [1, 2, 3],
		'b': [4, 5, 6]
	};

	const group: Group = new Group(obj);

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
			const grp: Group = new Group({});
			grp.set('a', [1, 2, 3]);

			expect(grp.get('a'))
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
			const obj: any = {
				'a': [1, 2, 3],
				'b': [4, 5, 6]
			};

			const grp: Group = new Group(obj);

			const map: any = group.toMap();

			expect(map).not.toBe(obj);

			obj['c'] = [7, 8, 9];

			expect(grp.keys().count()).toBe(3);
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
