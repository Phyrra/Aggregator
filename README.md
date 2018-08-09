Installation
============

The module is registered on npm, to install run
```
yarn add sama-aggregator
```

Since the library is written in Typescript, it comes with its own types.

Usage
=====

For full documentation, please refer to https://aggregator.000webhostapp.com/

## Node

Once installed, you can pull components from the module and use them in your code.
```
const { Aggregator, eq } = require('masa-aggregator');

console.log(
	new Aggregator([
		{
			name: 'Adam',
			location: {
				city: 'Zurich',
				country: 'Switzerland'
			}
		}, {
			name: 'Beat',
			location: {
				city: 'Basel',
				country: 'Switzerland'
			}
		}, {
			name: 'Clair',
			location: {
				city: 'Bishkek',
				country: 'Kyrgyztan'
			}
		}
	])
		.where('location.country', eq('Switzerland'))
		.toArray()
);
```

## TypeScript

The module was written in TypeScript and comes with its own types.
```
import * from 'masa-aggregator';

const aggregator = new Aggregator([1, 2, 3]);

...
```

## Browser

The module is converted to a browser-library using [browserify](http://browserify.org/).

The dependencies are exported to the `window` global.

```
<html>
	<script src="node_modules/masa-aggregator/dist/masa-aggregator.browser.js">
	<script>
		const aggregator = new Aggregator([1, 2, 3]);
		
		// ...
	</script>
</html>
```

Examples
========

### Filtering Data

#### A flat list
```
new Aggregator([1, 2, 3, 4, 5])
	.where(function(item) {
		return item % 2 === 0;
	})
	.toArray();
```

#### A list of objects
```
new Aggregator([
	{
		name: 'Adam',
		location: {
			city: 'Zurich',
			country: 'Switzerland'
		}
	}, {
		name: 'Beat',
		location: {
			city: 'Basel',
			country: 'Switzerland'
		}
	}, {
		name: 'Clair',
		location: {
			city: 'Bishkek',
			country: 'Kyrgyztan'
		}
	}
])
	.where('location.country', eq('Switzerland'))
	.toArray();
```

### Grouping

```
new Aggregator([
	{ gender: 'M', name: 'Adam' },
	{ gender: 'M', name: 'Beat' },
	{ gender: 'F', name: 'Clair' },
	{ gender: 'F', name: 'Delilah' }
])
	.group('gender')
	.toMap();
```
