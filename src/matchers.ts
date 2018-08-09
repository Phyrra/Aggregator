import { extractValue, evalCondition } from './helpers';
import { Aggregator } from './Aggregator';

const keyMatcher: Function = (inner: Function, args: any[]) => {
	let key: Function | string | undefined;

	if (args.length > 0) {
		key = args[0];
	}

	return (value: any) =>
		inner(
			key ? extractValue(value, key) : value
		);
}

const keyValueMatcher: Function = (inner: Function, args: any) => {
	let key: Function | string | undefined;
	let reference: any;

	if (args.length > 1) {
		key = args[0];
		reference = args[1];
	} else {
		reference = args[0];
	}

	return (value: any) =>
		inner(
			key ? extractValue(value, key) : value,
			reference
		);
}

const multiKeyValueMatcher: Function = (inner: Function, args: any) => {
	let keys: any;
	let reference: any;

	if (args.length > 1) {
		keys = args[0];
		reference = args[1];

		if (!Array.isArray(keys)) {
			keys = [keys];
		}
	} else {
		reference = args[0];
	}

	return (value: any) =>
		inner(
			keys ? keys.map((key: Function | string) => extractValue(value, key)) : value,
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
		new Aggregator(values)
			.all(cond),
		args
	);
}

export function one(...args: any[]): MatcherFunction {
	return multiKeyValueMatcher((values: any[], cond: Function) =>
		new Aggregator(values)
			.has(cond),
		args
	);
}
