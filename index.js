const { Aggregator } = require('./dist/Aggregator');
const { Group } = require('./dist/Group');
const { eq, neq, gt, lt, gte, lte, isNull, not, and, or, all, one, match } = require('./dist/matchers');

module.exports = {
	Aggregator,
	Group,
	eq,
	neq,
	gt,
	lt,
	gte,
	lte,
	isNull,
	not,
	and,
	or,
	all,
	one,
	match
};
