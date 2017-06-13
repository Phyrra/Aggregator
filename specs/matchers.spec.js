/* global
	Aggregator
	eq
	neq
	gt
	lt
	gte
	lte
	isNull
	not
	and
	or
	all
	one
*/
describe('matchers', function() {
	describe('eq()', function() {
		it('should return elements equal to the reference', function() {
			var result = [1, 2, 3].filter(eq(2));
			
			expect(result)
				.toEqual([2]);
		});

		it('should return values equal to the reference', function() {
			var result = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			].filter(eq('value', 2));

			expect(result)
				.toEqual([{ value: 2 }]);
		});

		it('should return mapped values equal to the reference', function() {
			var map = function(elem) {
				return elem.a + elem.b;
			};

			var result = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			].filter(eq(map, 4));

			expect(result)
				.toEqual([
					{ a: 2, b: 2 }
				]);
		});
	});
	
	describe('neq()', function() {
		it('should return elements not equal to the reference', function() {
			var result = [1, 2, 3].filter(neq(2));
			
			expect(result)
				.toEqual([1, 3]);
		});

		it('should return values not equal to the reference', function() {
			var result = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			].filter(neq('value', 2));

			expect(result)
				.toEqual([
					{ value: 1 },
					{ value: 3 }
				]);
		});

		it('should return mapped values not equal to the reference', function() {
			var map = function(elem) {
				return elem.a + elem.b;
			};

			var result = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			].filter(neq(map, 4));

			expect(result)
				.toEqual([
					{ a: 1, b: 1 },
					{ a: 3, b: 3 }
				]);
		});
	});
	
	describe('gt()', function() {
		it('should return elements greater than the reference', function() {
			var result = [1, 2, 3].filter(gt(2));
			
			expect(result)
				.toEqual([3]);
		});

		it('should return values greater than the reference', function() {
			var result = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			].filter(gt('value', 2));

			expect(result)
				.toEqual([
					{ value: 3 }
				]);
		});

		it('should return mapped values greater than the reference', function() {
			var map = function(elem) {
				return elem.a + elem.b;
			};

			var result = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			].filter(gt(map, 4));

			expect(result)
				.toEqual([
					{ a: 3, b: 3 }
				]);
		});
	});
	
	describe('lt()', function() {
		it('should return elements less than the reference', function() {
			var result = [1, 2, 3].filter(lt(2));
			
			expect(result)
				.toEqual([1]);
		});

		it('should return values less than the reference', function() {
			var result = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			].filter(lt('value', 2));

			expect(result)
				.toEqual([
					{ value: 1 }
				]);
		});

		it('should return mapped values less than the reference', function() {
			var map = function(elem) {
				return elem.a + elem.b;
			};

			var result = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			].filter(lt(map, 4));

			expect(result)
				.toEqual([
					{ a: 1, b: 1 }
				]);
		});
	});
	
	describe('gte()', function() {
		it('should return elements greater than or equal to the reference', function() {
			var result = [1, 2, 3].filter(gte(2));
			
			expect(result)
				.toEqual([2, 3]);
		});

		it('should return values greater than or equal to the reference', function() {
			var result = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			].filter(gte('value', 2));

			expect(result)
				.toEqual([
					{ value: 2 },
					{ value: 3 }
				]);
		});

		it('should return mapped values greater than or equal to the reference', function() {
			var map = function(elem) {
				return elem.a + elem.b;
			};

			var result = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			].filter(gte(map, 4));

			expect(result)
				.toEqual([
					{ a: 2, b: 2 },
					{ a: 3, b: 3 }
				]);
		});
	});
	
	describe('lte()', function() {
		it('should return elements less than or equal to the reference', function() {
			var result = [1, 2, 3].filter(lte(2));
			
			expect(result)
				.toEqual([1, 2]);
		});

		it('should return values less than or equal to the reference', function() {
			var result = [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 }
			].filter(lte('value', 2));

			expect(result)
				.toEqual([
					{ value: 1 },
					{ value: 2 }
				]);
		});

		it('should return mapped values less than or equal to the reference', function() {
			var map = function(elem) {
				return elem.a + elem.b;
			};

			var result = [
				{ a: 1, b: 1 },
				{ a: 2, b: 2 },
				{ a: 3, b: 3 }
			].filter(lte(map, 4));

			expect(result)
				.toEqual([
					{ a: 1, b: 1 },
					{ a: 2, b: 2 }
				]);
		});
	});
	
	describe('isNull()', function() {
		it('should return elements that are defined as null', function() {
			var result = [1, undefined, null, '', 0].filter(isNull());
			
			expect(result)
				.toEqual([undefined, null]);
		});

		it('should return values that are defined as null', function() {
			var result = [
				{ value: 1 },
				{ value: undefined },
				{ value: null },
				{ value: '' },
				{ value: 0 }
			].filter(isNull('value'));

			expect(result)
				.toEqual([
					{ value: undefined },
					{ value: null }
				]);
		});

		it('should return elements where a mapped value is defined as null', function() {
			var map = function(elem) {
				return elem.value;
			};

			var result = [
				{ value: 1 },
				{ value: undefined },
				{ value: null },
				{ value: '' },
				{ value: 0 }
			].filter(isNull(map));

			expect(result)
				.toEqual([
					{ value: undefined },
					{ value: null }
				]);
		});
	});
	
	describe('not()', function() {
		it('should return elements that are not defined as null', function() {
			var result = [1, undefined, null, '', 0].filter(not(isNull()));
			
			expect(result)
				.toEqual([1, '', 0]);
		});
	});
	
	describe('and()', function() {
		it('should return results that match both conditions', function() {
			var result = [1, 2, 3].filter(and(gt(1), gt(2)));
			
			expect(result)
				.toEqual([3]);
		});

		it('should return results that match a set of conditions', function() {
			var match = function(value) {
				return value % 2 === 0;
			};

			var result = [
				{ a: 1, b: 2, c: 2 },
				{ a: 2, b: 1, c: 2 },
				{ a: 2, b: 2, c: 1 },
				{ a: 2, b: 2, c: 2 }
			].filter(and(
				{ a: 2, b: match },
				eq('c', 2)
			));

			expect(result)
				.toEqual([
					{ a: 2, b: 2, c: 2 }
				]);
		});
	});
	
	describe('or()', function() {
		it('should return results matching either condition', function() {
			var result = [1, 2, 3].filter(or(lt(2), gt(2)));
			
			expect(result)
				.toEqual([1, 3]);
		});

		it('should return results that match on of a set of conditions', function() {
			var match = function(value) {
				return value % 2 === 0;
			};

			var result = [
				{ a: 1, b: 1, c: 1 },
				{ a: 2, b: 2, c: 1 },
				{ a: 1, b: 1, c: 2 }
			].filter(or(
				{ a: 2, b: match },
				eq('c', 2)
			));

			expect(result)
				.toEqual([
					{ a: 2, b: 2, c: 1 },
					{ a: 1, b: 1, c: 2 }
				]);
		});
	});

	describe('all()', function() {
		var data = [
			{ a: 2, b: 4 },
			{ a: 1, b: 2 },
			{ a: 2, b: 1 },
			{ a: 1, b: 3 }
		];

		var match = function(value) {
			return value % 2 === 0;
		};

		var keys = [
			'a',
			function(elem) {
				return elem.b;
			}
		];

		it('should filter aggregator elements where all values match', function() {
			var aggregator = new Aggregator(data);

			expect(aggregator.where(keys, all(match)).toArray())
				.toEqual([
					{ a: 2, b: 4 }
				]);
		});

		it('should filter elements where all values match', function() {
			var result = data.filter(all(keys, match));

			expect(result)
				.toEqual([
					{ a: 2, b: 4 }
				]);
		});
	});

	describe('one()', function() {
		var data = [
			{ a: 2, b: 4 },
			{ a: 1, b: 2 },
			{ a: 2, b: 1 },
			{ a: 1, b: 3 }
		];

		var match = function(value) {
			return value % 2 === 0;
		};

		var keys = [
			'a',
			function(elem) {
				return elem.b;
			}
		];

		it('should filter aggregator elements where at least one value matches', function() {
			var aggregator = new Aggregator(data);

			expect(aggregator.where(keys, one(match)).toArray())
				.toEqual([
					{ a: 2, b: 4 },
					{ a: 1, b: 2 },
					{ a: 2, b: 1 }
				]);
		});

		it('should filter elements where at least one value matches', function() {
			var result = data.filter(one(keys, match));

			expect(result)
				.toEqual([
					{ a: 2, b: 4 },
					{ a: 1, b: 2 },
					{ a: 2, b: 1 }
				]);
		});
	});
});
