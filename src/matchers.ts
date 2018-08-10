import { extractValue, evalCondition, KeyExtractor } from './helpers';
import { FuzzyMatcher } from './fuzzy-matcher';

const keyMatcher: Function = (inner: Function, args: any[]) => {
	let keyExtractor: KeyExtractor | undefined;

	if (args.length > 0) {
		keyExtractor = args[0];
	}

	return (value: any) =>
		inner(extractValue(value, keyExtractor));
}

const keyValueMatcher: Function = (inner: Function, args: any) => {
	let key: KeyExtractor | undefined;
	let reference: any;

	if (args.length > 1) {
		key = args[0];
		reference = args[1];
	} else {
		reference = args[0];
	}

	return (value: any) =>
		inner(
			extractValue(value, key),
			reference
		);
}

const multiKeyValueMatcher: Function = (inner: Function, args: any) => {
	let keyExtractors: KeyExtractor[] | undefined;
	let reference: any;

	if (args.length > 1) {
		if (Array.isArray(args[0])) {
			keyExtractors = args[0];
		} else {
			keyExtractors = [ args[0] ];
		}

		reference = args[1];
	} else {
		reference = args[0];
	}

	return (value: any) =>
		inner(
			keyExtractors ? keyExtractors.map((keyExtractor: KeyExtractor) => extractValue(value, keyExtractor)) : value,
			reference
		);
}

export type MatcherFunction = (...args: any[]) => boolean;

export function eq(...args: any[]): MatcherFunction {
	return keyValueMatcher((value: any, reference: any) => value === reference, args);
}

export function neq(...args: any[]): MatcherFunction {
	return keyValueMatcher((value: any, reference: any) => value !== reference, args);
}

export function gt(...args: any[]): MatcherFunction {
	return keyValueMatcher((value: any, reference: any) => value > reference, args);
}

export function lt(...args: any[]): MatcherFunction {
	return keyValueMatcher((value: any, reference: any) => value < reference, args);
}

export function gte(...args: any[]): MatcherFunction {
	return keyValueMatcher((value: any, reference: any) => value >= reference, args);
}

export function lte(...args: any[]): MatcherFunction {
	return keyValueMatcher((value: any, reference: any) => value <= reference, args);
}

export function isNull(...args: any[]): MatcherFunction {
	return keyMatcher((value: any) => value == null, args);
}

export function not(cond: Function): MatcherFunction {
	return (value: any) => !cond(value);
}

export function and(...args: any[]): MatcherFunction {
	return (value: any) => args.every(arg => evalCondition(arg)(value));
}

export function or(...args: any[]): MatcherFunction {
	return (value: any) => args.some(arg => evalCondition(arg)(value));
}

export function all(...args: any[]): MatcherFunction {
	return multiKeyValueMatcher((values: any[], cond: Function) =>
		values
			.every((value: any, idx: number) => cond(value, idx)),
		args
	);
}

export function one(...args: any[]): MatcherFunction {
	return multiKeyValueMatcher((values: any[], cond: Function) =>
		values
			.some((value: any, idx: number) => cond(value, idx)),
		args
	);
}

export function match(...args: any[]): MatcherFunction {
	const fuzzyMatcher = new FuzzyMatcher();
	const fuzzyLimit = fuzzyMatcher.getConfig('fuzzyLimit');

	return keyValueMatcher((value: any, reference: any) => value && fuzzyMatcher.getFuzzyResult(reference, value).match >= fuzzyLimit, args);
}
