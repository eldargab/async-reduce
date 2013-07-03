var should = require('should')
var reduce = require('../index')

describe('Async reduce', function() {
  function sum(curr, val, cb) {
    process.nextTick(function() {
      cb(null, curr + val)
    })
  }

  function syncSum(curr, val, cb) {
    cb(null, curr + val)
  }

  function sumWithOverflow(curr, val, cb) {
    process.nextTick(function() {
      curr > 0 ? cb(new Error('Overflow')) : cb(null, curr + val)
    })
  }

  it('Should do async reductions', function(done) {
    reduce([1, 2, 3], 0, sum, function(err, val) {
      if (err) return done(err)
      val.should.equal(6)
      done()
    })
  })

  it('Should be ok with sync reductions', function(done) {
    var bigArray = new Array(10000)

    for (var i = 0; i < bigArray.length; i++) {
      bigArray[i] = 1
    }

    reduce(bigArray, 0, syncSum, function(err, val) {
      if (err) return done(err)
      val.should.equal(10000)
      done()
    })
  })

  it('Should stop on error', function(done) {
    reduce([1, 2, 3], 0, sumWithOverflow, function(err, val) {
      err.message.should.equal('Overflow')
      val.should.equal(1)
      done()
    })
  })

  describe('.concurrent(level, unit, combine)', function() {
    it('Should return a concurrent "reduce" function', function(done) {
      var r = reduce.concurrent(2, 0, function(a, b) {
        return a + b
      })

      r([1, 2, 3], 1, sum, function(err, val) {
        if (err) return done(err)
        val.should.equal(7)
        done()
      })
    })

    it('Should work when concurrency level is greater then an number of items', function(done) {
      var r = reduce.concurrent(10, 0, function(a, b) {
        return a + b
      })

      r([1, 2, 3], 1, sum, function(err, val) {
        if (err) return done(err)
        val.should.equal(7)
        done()
      })
    })

    it('Should allow to omit `unit` and `combine` for side effect only reductions', function(done) {
      var r = reduce.concurrent(2)
      var items = []

      r([1, 2, 3], null, function(_, item, cb) {
        items.push(item)
        process.nextTick(cb)
      }, function(err) {
        if (err) return done(err)
        items.should.include(1)
        items.should.include(2)
        items.should.include(3)
        done()
      })
    })

    it('Should stop reductions on any error', function(done) {
      var r = reduce.concurrent(2, 0, function(a, b) {
        return a + b
      })

      r([1, 2, 3], 0, sumWithOverflow, function(err, val) {
        err.message.should.equal('Overflow')
        done()
      })
    })
  })
})
