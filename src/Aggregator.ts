import { evalCondition, extractValue } from './helpers';
import { Group } from './Group';

export class Aggregator {
	constructor(private _data: any[]) {
		if (!Array.isArray(_data)) {
			throw new Error('Expected array to be passed into constructor');
		}
	}

	forEach(...args: any[]): Aggregator {
		const action = evalCondition(...args);

		this._data
			.forEach((elem: any, idx: number) => action(elem, idx));

		return this;
	}

	find(...args: any[]): any | null {
		const cond = evalCondition(...args);

		/*
		// Compiles, but not for karma
		return this._data
			.find((elem: any, idx: number) => cond(elem, idx));
		*/

		for (let i = 0; i < this._data.length; ++i) {
			const elem: any = this._data[i];

			if (cond(elem, i)) {
				return elem;
			}
		}

		return null;
	}

	where(...args: any[]): Aggregator {
		const cond = evalCondition(...args);

		return new Aggregator(
			this._data
				.filter((elem: any, idx: number) => cond(elem, idx))
		);
	}

	private _mapData(mapper?: Function |  string): any[] {
		return this._data
			.map((elem: any, idx: number) => extractValue(elem, mapper, idx));
	}

	map(mapper?: Function |  string): Aggregator {
		return new Aggregator(
			this._mapData(mapper)
		);
	}

	flatMap(mapper?: Function |  string): Aggregator {
		return new Aggregator(
			this._mapData(mapper)
				.reduce(
					(collector: Aggregator, partial: any[]) => collector.append(partial),
					new Aggregator([])
				)
				.toArray()
		);
	}

	reduce(...args: any[]): any {
		let values: any[];
		let reducer: (collector: any, partial: any) => any;
		let initial: any;

		if (args.length > 2) {
			values = this._mapData(args[0]);
			reducer = args[1];
			initial = args[2];
		} else {
			values = this._data;
			reducer = args[0];
			initial = args[1];
		}

		return values.reduce(reducer, initial);
	}

	sort(...comparators: (Function | string)[]): Aggregator {
		return new Aggregator(
			this._data.slice() // copy for decoupling
				.sort((lhs: any, rhs: any) => {
					if (comparators.length === 0) {
						if (lhs > rhs) {
							return 1;
						} else if (lhs < rhs) {
							return -1;
						}

						return 0;
					}

					for (let i = 0; i < comparators.length; ++i) {
						const comparator: Function | string = comparators[i];

						var lhv: any = extractValue(lhs, comparator);
						var rhv: any = extractValue(rhs, comparator);

						if (lhv > rhv) {
							return 1;
						} else if (lhv < rhv) {
							return -1;
						}
					}

					return 0;
				})
		);
	}

	sortWith(fn: (a: any, b: any) => number): Aggregator {
		return new Aggregator(
			this._data.slice() // copy for decoupling
				.sort(fn)
		);
	}

	reverse(): Aggregator {
		return new Aggregator(
			this._data.slice() // copy for decoupling
				.reverse()
		);
	}

	count(...args: any[]): number {
		if (args.length === 0) {
			return this._data.length;
		}

		const cond = evalCondition(...args);

		return this._data
			.filter((elem: any, idx: number) => cond(elem, idx))
			.length;
	}

	has(...args: any[]): boolean {
		const cond = evalCondition(...args);

		return this._data
			.some((elem: any, idx: number) => cond(elem, idx));
	}

	all(...args: any[]): boolean {
		const cond = evalCondition(...args);

		return this._data
			.every((elem: any, idx: number) => cond(elem, idx));
	}

	append(...args: (Aggregator | any[] | any)[]): Aggregator {
		return new Aggregator(
			args
				.reduce((collector: any[], arg) => {
					if (arg instanceof Aggregator) {
						return collector.concat(arg.toArray());
					}

					// works for array and element
					return collector.concat(arg);
				}, this._data)
		);
	}

	private _fromMap(map: any): Aggregator {
		return new Aggregator(
			Object.keys(map)
				.map(key => map[key])
		);
	}

	toArray(): any[] {
		return this._data.slice();
	}

	toMap(keyExtractor?: Function | string): any {
		const map: any = {};

		this._data
			.forEach((elem: any, idx: number) => {
				const keyValue: any = extractValue(elem, keyExtractor, idx);

				if (!map.hasOwnProperty(keyValue)) {
					map[keyValue] = elem;
				}
			});

		return map;
	}

	removeDuplicates(keyExtractor?: Function | string): any {
		return this._fromMap(
			this.toMap(keyExtractor)
		);
	}

	// TODO: How about identifying by multiple conditions?
	// it's already (semi) possible by using a function..
	getCommonElements(...args: any[]): Aggregator {
		let keyExtractor: Function | string | undefined;
		let startIdx: number;

		if (args[0] instanceof Aggregator) {
			startIdx = 0;
			keyExtractor = undefined;
		} else {
			startIdx = 1;
			keyExtractor = args[0];
		}

		let map = this.toMap(keyExtractor);

		for (let i = startIdx; i < args.length; ++i) {
			const newMap: any = {};

			args[i]._data
				.forEach((elem: any, idx: number) => {
					const keyValue: any = extractValue(elem, keyExtractor, idx);

					if (map.hasOwnProperty(keyValue)) {
						newMap[keyValue] = map[keyValue];
					}
				});

			map = newMap;
		}

		return this._fromMap(map);
	}

	private _generateGroup(grouper: Function | string): Group {
		const grouped: any = {};

		this._data
			.forEach((elem: any, idx: number) => {
				const value: any = extractValue(elem, grouper, idx);

				if (!grouped.hasOwnProperty(value)) {
					grouped[value] = [];
				}

				grouped[value].push(elem);
			});

		Object.keys(grouped)
			.forEach((key: string) => grouped[key] = new Aggregator(grouped[key]));

		return new Group(grouped);
	};

	group(...args: any[]): Group {
		let base: Group = new Group({});
		let iter: any[] = [];

		for (let i = 0; i < args.length; ++i) {
			let grouper: Function | string = args[i];

			if (i === 0) {
				base = this._generateGroup(grouper);
				iter = [base];
			} else {
				const newIter: any[] = [];

				iter.forEach((group: Group) =>
					group.keys()
						.forEach((key: string) => {
							const newGroup: Group = group.get(key)._generateGroup(grouper);

							group.set(key, newGroup);
							newIter.push(newGroup);
						})
					);

				iter = newIter;
			}
		}

		return base;
	};
}
