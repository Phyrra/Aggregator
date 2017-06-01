describe('conditions', function() {
	describe('eq()', function() {
		it('should return results equal to the value', function() {
			var result = [1, 2, 3].filter(eq(2));
			
			expect(result)
				.toEqual([2]);
		});
	});
	
	describe('neq()', function() {
		it('should return results not equal to the value', function() {
			var result = [1, 2, 3].filter(neq(2));
			
			expect(result)
				.toEqual([1, 3]);
		});
	});
	
	describe('isNull()', function() {
		it('should return results that are defined as null', function() {
			var result = [1, undefined, null, '', 0].filter(isNull());
			
			expect(result)
				.toEqual([undefined, null]);
		});
	});
	
	describe('gt()', function() {
		it('should return results greater than the value', function() {
			var result = [1, 2, 3].filter(gt(2));
			
			expect(result)
				.toEqual([3]);
		});
	});
	
	describe('lt()', function() {
		it('should return results less than the value', function() {
			var result = [1, 2, 3].filter(lt(2));
			
			expect(result)
				.toEqual([1]);
		});
	});
	
	describe('gte()', function() {
		it('should return results greater than or equal to the value', function() {
			var result = [1, 2, 3].filter(gte(2));
			
			expect(result)
				.toEqual([2, 3]);
		});
	});
	
	describe('lte()', function() {
		it('should return results less than or equal to the value', function() {
			var result = [1, 2, 3].filter(lte(2));
			
			expect(result)
				.toEqual([1, 2]);
		});
	});
	
	describe('not()', function() {
		it('should return results that are not defined as null', function() {
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
	});
	
	describe('or()', function() {
		it('should return results matching either condition', function() {
			var result = [1, 2, 3].filter(or(lt(2), gt(2)));
			
			expect(result)
				.toEqual([1, 3]);
		});
	});
});