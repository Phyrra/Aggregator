Installation
============

The module is registered on bower, to install run
```
bower --save install sama-aggregator
```

Usage
=====

The `Aggregator` is registered on the `window` object for global access.

For full documentation, please refer to https://aggregator.000webhostapp.com/#/doc/aggregator-sort

Examples
========

### Fitering Data

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
