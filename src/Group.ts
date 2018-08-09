import { Aggregator } from './Aggregator';

export class Group {
	constructor(private _data: any) {
		if (typeof _data !== 'object') {
			throw new Error('expected object to be passed into constructor');
		}
	}

	keys(): Aggregator {
		return new Aggregator(Object.keys(this._data));
	}

	values(): Aggregator {
		return new Aggregator(
			Object.keys(this._data)
				.map((key: string) => this._data[key])
		);
	}

	get(key: string): any {
		return this._data[key];
	}

	set(key: string, value: any): Group {
		this._data[key] = value;

		return this;
	}

	toArray(): { _key: string, _items: any[] }[] {
		return Object.keys(this._data)
			.map((key: string) => {
				return {
					_key: key,
					_items: this._data[key]
				};
			});
	}

	toMap(): any {
		/*
		// Doesn't work in karma
		return Object.assign({}, this._data); // copy for decoupling
		*/

		const copy: any = {}; // copy for decoupling

		Object.keys(this._data)
			.forEach((key: string) => copy[key] = this._data[key]);

		return copy;
	}

	toAggregator(): Aggregator {
		return new Aggregator(
			this.toArray()
		);
	}
}
