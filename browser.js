const { Aggregator } = require('./dist/Aggregator');
const { Group } = require('./dist/Group');
const { eq, neq, gt, lt, gte, lte, isNull, not, and, or, all, one } = require('./dist/matchers');

window.Aggregator = Aggregator;
window.Group = Group;
window.eq = eq;
window.neq = neq;
window.gt = gt;
window.lt = lt;
window.gte = gte;
window.lte = lte;
window.isNull = isNull;
window.not = not;
window.and = and;
window.or = or;
window.all = all;
window.one = one;
