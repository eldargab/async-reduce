#async-reduce

`reduce` function for async reductions on arrays.

##Examples

```javascript
var reduce = require('async-reduce')

function sum(a, b, cb) {
  setTimeout(function() {
    cb(null, a + b)
  })
}

reduce([1, 2, 3], 1, sum, function(err, result) {
  result.should.equal(7)
})
```

Concurrent reductions are also supported

```javascript
var reduce = require('async-reduce').concurrent(2, 0, function(a, b) {
  return a + b
})

reduce([1, 2, 3], 1, sum, function(err, result) {
  result.should.equal(7) // still the same result
})
```

During such reduction the given array is split into several
chunks with the total number of chunks equal to the concurrency level (it is
the first arg to `.concurrent()`).
Those chunks are reduced in parallel. That means that we need a
`combine` function to assemble the results from those independent reductions
(third arg). We also need some sort of `unit` value to seed our
reductions (second arg). But we can omit `unit` and `combine`
if we are only interested in side effects:

```javascript
var reduce = require('async-reduce').concurrent(5)
var items = []

reduce([1, 2, 3], null, function(_, item, cb) {
  items.push(item)
  cb()
}, function(err) {
  items.should.include(1)
  items.should.include(2)
  items.should.include(3)
})
```

This lib takes care of sync callback calls. They do not cause stack overflows.

##Installation

via component

```
component install eldargab/async-reduce
```

via npm

```
npm install async-reduce
```

##License

MIT
