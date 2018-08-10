import { match } from '../src/matchers';
import { Aggregator } from '../src/Aggregator';
import { FuzzyMatcher } from '../src/fuzzy-matcher';

describe('FuzzyMatcher', () => {
	describe('match()', () => {
		it('should not find a result if there is no match', () => {
			const result: string[] = new Aggregator(['this is a test case'])
				.where(match('foo'))
				.toArray();

			expect(result)
				.toEqual([]);
		});

		it('should find a complete substring in the term', () => {
			const result: string[] = new Aggregator(['this is a test case'])
				.where(match('est'))
				.toArray();

			expect(result)
				.toEqual([
					'this is a test case'
				]);
		});

		it('should find one of the words in the term', () => {
			const result: string[] = new Aggregator([
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

		it('should find a fuzzy match in the term', () => {
			const result: string[] = new Aggregator(['this is a test case'])
				.where(match('rest'))
				.toArray();

			expect(result)
				.toEqual([
					'this is a test case'
				]);
		});

		it('should not consider matches that are too short', () => {
			const result: string[] = new Aggregator(['this is a test case'])
				.where(match('is a'))
				.toArray();

			expect(result)
				.toEqual([]);
		});
	});

	describe('configure()', () => {
		let fuzzyMatcher: FuzzyMatcher;

		beforeEach(() => {
			fuzzyMatcher = new FuzzyMatcher();
		});

		it('should allow to set a configuration', () => {
			expect(fuzzyMatcher.getConfig('ignoreCase')).toBe(true);

			fuzzyMatcher.configure({
				ignoreCase: false
			});

			expect(fuzzyMatcher.getConfig('ignoreCase')).toBe(false);
		});

		it('should not add unknown configuration elements', () => {
			fuzzyMatcher.configure({
				unknown: true
			});

			expect(fuzzyMatcher.getConfig('unknown')).toBeUndefined();
		});

		it('should allow to set a single configuration element', () => {
			expect(fuzzyMatcher.getConfig('ignoreCase')).toBe(true);

			fuzzyMatcher.configure('ignoreCase', false);

			expect(fuzzyMatcher.getConfig('ignoreCase')).toBe(false);
		});

		it('should not allow to add a new configuration element', () => {
			fuzzyMatcher.configure('unknown', true);

			expect(fuzzyMatcher.getConfig('unknown')).toBeUndefined();
		});
	});
});
