/* global
	Aggregator
	match
*/
describe('fuzzy matcher', function() {
	it('should not find a result if there is no match', function() {
		var result = new Aggregator(['this is a test case'])
			.where(match('foo'))
			.toArray();

		expect(result)
			.toEqual([]);
	});

	it('should find a complete substring in the term', function() {
		var result = new Aggregator(['this is a test case'])
			.where(match('est'))
			.toArray();

		expect(result)
			.toEqual([
				'this is a test case'
			]);
	});

	it('should find one of the words in the term', function() {
		var result = new Aggregator([
			'this is a test case',
			'this is another case'
		])
			.where(match('another test'))
			.toArray();

		expect(result)
			.toEqual([
				'this is a test case',
				'this is another case'
			]);
	});

	it('should find a fuzzy match in the term', function() {
		var result = new Aggregator(['this is a test case'])
			.where(match('rest'))
			.toArray();

		expect(result)
			.toEqual([
				'this is a test case'
			]);
	});

	it('should not consider matches that are too short', function() {
		var result = new Aggregator(['this is a test case'])
			.where(match('is a'))
			.toArray();

		expect(result)
			.toEqual([]);
	});
});