import _ from 'lodash'
const DEFAULT_TOL = 0.001
const isEqual = function (a, b) {
  return Math.abs(a - b) <= Number.EPSILON
}

var Vector = function (x, y, z) {
  if (_.isObject(x)) {
    var pt1 = x
    var pt2 = y
    this.x = pt2.x - pt1.x
    this.y = pt2.y - pt1.y
    this.z = _.has(pt1, 'z') && _.has(pt2, 'z') ? pt2.z - pt1.z : 0
  } else {
    this.x = x
    this.y = y
    this.z = _.isNull(z) || _.isUndefined(z) ? 0 : z
  }
}

_.extend(Vector, {
  create: function () {
    var args = Array.prototype.slice.call(arguments)
    args = Array.prototype.concat.call([null], args)
    return new (Function.prototype.bind.apply(Vector, args))()
  },

  equal: function (first, second) {
    return isEqual(first.x, second.x) &&
          isEqual(first.y, second.y) &&
          isEqual(first.z, second.z)
  },

  xAxis: function () {
    return new Vector(1, 0, 0)
  },

  yAxis: function () {
    return new Vector(0, 1, 0)
  },

  zAxis: function () {
    return new Vector(0, 0, 1)
  },

  angle: function (startPt, endPt) {
    let x = endPt.x - startPt.x
    if (Math.abs(x) < DEFAULT_TOL) {
      x = 0
    }
    let y = endPt.y - startPt.y
    if (Math.abs(y) < DEFAULT_TOL) {
      y = 0
    }
    var z = _.has(startPt, 'z') && _.has(endPt, 'z') ? endPt.z - startPt.z : 0
    var r = Math.sqrt(x * x + y * y + z * z)

    var ans = null
    if (x > 0 && y >= 0) {
      ans = Math.asin(y / r)
    } else if (x >= 0 && y < 0) {
      ans = Math.asin(y / r) + 2 * Math.PI
    } else if (x <= 0 && y > 0) {
      ans = Math.acos(x / r)
    } else if (x < 0 && y <= 0) {
      ans = 2 * Math.PI - Math.acos(x / r)
    }

    return Math.abs(ans) < 0.0001 || Math.abs(ans - Math.PI * 2.0) < 0.0001 ? 0.0 : ans
  },

  angleBetween: function (first, second) {
    return first.angle() - second.angle()
  }
})

_.extend(Vector.prototype, {
  clone: function () {
    return new Vector(this.x, this.y, this.z)
  },

  toJSON: function () {
    return {
      x: this.x,
      y: this.y,
      z: this.z
    }
  },

  equal: function (other) {
    return Vector.equal(this, other)
  },

  add: function (other) {
    this.x += other.x
    this.y += other.y
    this.z += other.z

    return this
  },

  sub: function (other) {
    this.x -= other.x
    this.y -= other.y
    this.z -= other.z

    return this
  },

  dotProduct: function (other) {
    return this.x * other.x + this.y * other.y + this.z * other.z
  },

  crossProduct: function (other) {
    var x = this.y * other.z - this.z * other.y
    var y = this.z * other.x - this.x * other.z
    var z = this.x * other.y - this.y * other.x

    return new Vector(x, y, z)
  },

  scale: function (f) {
    this.x *= f
    this.y *= f
    this.z *= f

    return this
  },

  magnitude: function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  },

  normalize: function () {
    var magnitude = this.magnitude()
    this.x /= magnitude
    this.y /= magnitude
    this.z /= magnitude

    return this
  },

  // return value is between [0, 2*PI];
  angle: function () {
    var r = this.magnitude()
    var ans = null
    if (this.x > 0 && this.y >= 0) {
      ans = Math.asin(this.y / r)
    } else if (this.x >= 0 && this.y < 0) {
      ans = Math.asin(this.y / r) + 2 * Math.PI
    } else if (this.x <= 0 && this.y > 0) {
      ans = Math.acos(this.x / r)
    } else if (this.x < 0 && this.y <= 0) {
      ans = 2 * Math.PI - Math.acos(this.x / r)
    }

    return Math.abs(ans) < 0.0001 || Math.abs(ans - Math.PI * 2.0) < 0.0001 ? 0.0 : ans
  },

  rotateZ: function (angle) {
    var current = this.angle() + angle
    var r = this.magnitude()
    this.x = r * Math.cos(current)
    this.y = r * Math.sin(current)

    return this
  },

  angleTo: function (other) {
    return Vector.angleBetween(this, other)
  },

  isCodirection: function (other, tol) {
    tol = tol || DEFAULT_TOL
    return Math.abs(this.angle() - other.angle()) <= tol
  }
})

export default Vector
