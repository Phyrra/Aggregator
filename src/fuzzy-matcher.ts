export interface FuzzyMatcherConfig {
	ignoreCase: boolean;
	minLength: number;
	fuzzyLimit: number;
}

export interface FuzzyMatcherResult {
	match: number;
	matches: string[];
}

export class FuzzyMatcher {
	private _config: FuzzyMatcherConfig = {
		ignoreCase: true,
		minLength: 3,
		fuzzyLimit: 0.75
	};

	configure(...args: any[]): FuzzyMatcher {
		if (args.length === 1) {
			var cfg: any = args[0];

			Object.keys(cfg)
				.forEach(key => {
					if (this._config.hasOwnProperty(key)) {
						(this._config as any)[key] = cfg[key];
					}
				});
		} else {
			var key: string = arguments[0];
			var value: any = arguments[1];

			if (this._config.hasOwnProperty(key)) {
				(this._config as any)[key] = value;
			}
		}

		return this;
	}

	getConfig(key: string): any {
		return (this._config as any)[key];
	}

	private tokenize(term: string): string[] {
		return term
			.split(' ')
			.map(word =>
				word
					.replace(/\W/g, '')
					.trim()
			)
			.filter(word => word.length >= this._config.minLength);
	}

	private joinWithMatch(tokens: string[], matchIdx: number): string {
		return tokens
			.map((token: string, idx: number) => {
				if (idx === matchIdx) {
					return `<b>${token}</b>`;
				}

				return token;
			})
			.join(' ');
	}

	private getSubstringMatch(needleTokens: string[], haystack: string): FuzzyMatcherResult {
		var directMatch: any = null;

		needleTokens
			.some((needle, i) => {
				var idx = haystack.indexOf(needle);

				if (idx !== -1) {
					directMatch = {
						match: 1,
						matches: [
							this.joinWithMatch(needleTokens, i),
							haystack.substring(0, idx) + '<b>' + haystack.substring(idx, idx + needle.length) + '</b>' + haystack.substring(idx + needle.length)
						]
					};

					return true;
				}

				return false;
			});

		return directMatch;
	};

	private getJaroMatch(lhs: string, rhs: string): number {
		let m: number = 0;

		// Exit early if either are empty.
		if (lhs.length === 0 || rhs.length === 0) {
			return 0;
		}

		// Exit early if they're an exact match.
		if (lhs === rhs) {
			return 1;
		}

		let range: number = (Math.floor(Math.max(lhs.length, rhs.length) / 2)) - 1;
		const lhsMatches: boolean[] = [];
		const rhsMatches: boolean[] = [];

		for (let i = 0; i < lhs.length; i++) {
			var low = (i >= range) ? i - range : 0;
			var high = (i + range <= (rhs.length - 1)) ? (i + range) : (rhs.length - 1);

			for (let j = low; j <= high; j++) {
				if (lhsMatches[i] !== true && rhsMatches[j] !== true && lhs[i] === rhs[j]) {
					++m;
					lhsMatches[i] = rhsMatches[j] = true;
					break;
				}
			}
		}

		// Exit early if no matches were found.
		if (m === 0) {
			return 0;
		}

		// Count the transpositions.
		let k: number = 0;
		let numTrans: number = 0;

		for (let i = 0; i < lhs.length; i++) {
			if (lhsMatches[i] === true) {
				for (var j = k; j < rhs.length; j++) {
					if (rhsMatches[j] === true) {
						k = j + 1;
						break;
					}
				}

				if (lhs[i] !== rhs[j]) {
					++numTrans;
				}
			}
		}

		let weight: number = ((m / lhs.length) + (m / rhs.length) + ((m - (numTrans / 2)) / m)) / 3;
		let l: number = 0;
		const p = 0.1;

		if (weight > 0.7) {
			while (lhs[l] === rhs[l] && l < 4) {
				++l;
			}

			weight = weight + (l * p * (1 - weight));
		}

		return weight;
	}

	private getClosestWordMatch(needleTokens: string[], haystackTokens: string[]): FuzzyMatcherResult {
		var maxMatch: number = 0;
		var maxMatchesIdx: number[] = [];

		for (let i = 0; i < needleTokens.length; ++i) {
			for (let j = 0; j < haystackTokens.length; ++j) {
				let a: string = needleTokens[i];
				let b: string = haystackTokens[j];

				var match: number = this.getJaroMatch(a, b);

				if (match > maxMatch) {
					maxMatch = match;
					maxMatchesIdx = [i, j];
				}
			}
		}

		return {
			match: maxMatch,
			matches: [
				this.joinWithMatch(needleTokens, maxMatchesIdx[0]),
				this.joinWithMatch(haystackTokens, maxMatchesIdx[1])
			]
		};
	}

	getFuzzyResult(needle: string, haystack: string): FuzzyMatcherResult {
		if (this._config.ignoreCase) {
			needle = needle.toLowerCase();
			haystack = haystack.toLowerCase();
		}

		var needleTokens: string[] = this.tokenize(needle);

		var substringMatch = this.getSubstringMatch(needleTokens, haystack);
		if (substringMatch != null) {
			return substringMatch;
		}

		var haystackTokens = this.tokenize(haystack);

		return this.getClosestWordMatch(needleTokens, haystackTokens);
	}
}
