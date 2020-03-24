import * as _ from 'lodash'

const Matrix = function (a, b, c, d, e, f) {
  this.a = _.isUndefined(a) || _.isNull(a) ? 1 : a
  this.b = _.isUndefined(b) || _.isNull(b) ? 0 : b
  this.c = _.isUndefined(c) || _.isNull(c) ? 0 : c
  this.d = _.isUndefined(d) || _.isNull(d) ? 1 : d
  this.e = _.isUndefined(e) || _.isNull(e) ? 0 : e
  this.f = _.isUndefined(f) || _.isNull(f) ? 0 : f
}

_.extend(Matrix, {
  identity () {
    return new Matrix(1, 0, 0, 1, 0, 0)
  },

  create () {
    let args = Array.prototype.slice.call(arguments)
    args = Array.prototype.concat.call([null], args)
    return new (Function.prototype.bind.apply(Matrix, args))()
  }
})

_.extend(Matrix.prototype, {
  assign (other) {
    this.a = other.a
    this.b = other.b
    this.c = other.c
    this.d = other.d
    this.e = other.e
    this.f = other.f

    return this
  },

  toString () {
    return 'matrix(' +
      this.a +
      ' ' + this.b +
      ' ' + this.c +
      ' ' + this.d +
      ' ' + this.e +
      ' ' + this.f +
      ')'
  },

  toJSON () {
    return {
      a: this.a,
      b: this.b,
      c: this.c,
      d: this.d,
      e: this.e,
      f: this.f
    }
  },

  clone () {
    return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f)
  },

  eq (other) {
    return _.eq(this.a, other.a) &&
      _.eq(this.b, other.b) &&
      _.eq(this.c, other.c) &&
      _.eq(this.d, other.d) &&
      _.eq(this.e, other.e) &&
      _.eq(this.f, other.f)
  },

  multiply (other) {
    const a = this.a
    const b = this.b
    const c = this.c
    const d = this.d
    const e = this.e
    const f = this.f

    this.a = a * other.a + c * other.b
    this.b = b * other.a + d * other.b
    this.c = a * other.c + c * other.d
    this.d = b * other.c + d * other.d
    this.e = a * other.e + c * other.f + e
    this.f = b * other.e + d * other.f + f

    return this
  },

  inverse () {
    const a = this.a
    const b = this.b
    const c = this.c
    const d = this.d
    const e = this.e
    const f = this.f

    const det = a * d - b * c
    if (det < 0.00000000001) {
      throw new Error('Can not find the inverse matrix!')
    }

    this.a = d / det
    this.b = -b / det
    this.c = -c / det
    this.d = a / det
    this.e = (c * f - d * e) / det
    this.f = (b * e - a * f) / det

    return this
  },

  translate (x, y) {
    const ans = new Matrix(1, 0, 0, 1, x, y)
    ans.multiply(this)
    this.assign(ans)
    return this
  },

  scale (sx, sy) {
    const ans = new Matrix(sx, 0, 0, sy, 0, 0)
    ans.multiply(this)
    this.assign(ans)
    return this
  },

  rotate (angle) {
    const ans = new Matrix(Math.cos(angle),
      Math.sin(angle),
      -Math.sin(angle),
      Math.cos(angle),
      0, 0)
    ans.multiply(this)
    this.assign(ans)
    return this
  },

  flipX () {
    const ans = new Matrix(-1, 0, 0, 1, 0, 0)
    ans.multiply(this)
    this.assign(ans)
    return this
  },

  flipY () {
    const ans = new Matrix(1, 0, 0, -1, 0, 0)
    ans.multiply(this)
    this.assign(ans)
    return this
  },

  skewX (angle) {
    const ans = new Matrix(1, 0, Math.tan(angle), 1, 0, 0)
    ans.multiply(this)
    this.assign(ans)
    return this
  },

  skewY (angle) {
    const ans = new Matrix(1, Math.tan(angle), 0, 1, 0, 0)
    ans.multiply(this)
    this.assign(ans)
    return this
  }
})

export default Matrix
