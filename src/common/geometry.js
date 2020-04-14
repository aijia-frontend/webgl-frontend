/** 2019/10/10
 *: helloC
 *: (二维图形处理)
 *:
 */
import _ from 'lodash'
import Vector from './vector'
const DEFAULT_TOL = 0.01

const Point = function (x, y) {
  this.x = x
  this.y = y
}

_.extend(Point, {
  create () {
    let args = Array.prototype.slice.call(arguments)
    args = Array.prototype.concat.call([null], args)
    return new (Function.prototype.bind.apply(Point, args))()
  },

  merge (pts) {
    const len = Math.floor(pts.length / 2)
    const preParts = _.clone(pts).splice(0, len)
    const endParts = _.clone(pts).splice(len)
    preParts.reverse()
    endParts.reverse()
    preParts.push(...endParts)
    return PolyLine.merge([], preParts)
  },

  toJSON () {
    return {
      x: this.x,
      y: this.y
    }
  },

  equal (p1, p2, tol) {
    tol = tol || DEFAULT_TOL
    return Point.distance(p1, p2) <= tol
  },

  distance (p1, p2) {
    return Math.sqrt(Math.pow((p1.x - p2.x), 2.0) + Math.pow((p1.y - p2.y), 2.0))
  },

  paramPoint (p1, p2, param) {
    if (p1.x === p2.x) {
      return new Point(p1.x, (1 - param) * p1.y + param * p2.y)
    } else if (p1.y === p2.y) {
      return new Point((1 - param) * p1.x + param * p2.x, p1.y)
    } else {
      return new Point((1 - param) * p1.x + param * p2.x,
        (1 - param) * p1.y + param * p2.y)
    }
  },

  isColinear (p1, p2, p3, tol) {
    tol = tol || DEFAULT_TOL
    return Math.abs((p2.y - p1.y) * (p3.x - p2.x) -
      (p2.x - p1.x) * (p3.y - p2.y)) <= tol
  },

  getRbPoint (pts) {
    const sortY = _.sortBy(pts, pt => pt.y)
    const sortX = _.sortBy(pts, pt => pt.x)
    let intersecter
    for (let i = 1; i < pts.length; i++) {
      const _sortY = sortY.slice(length - i)
      const _sortX = sortX.slice(length - i)
      intersecter = _.intersection(_sortX, _sortY)
      if (intersecter.length) break
    }

    return intersecter[0]
  },
  transform (pt, tf) {
    const x = pt.x * tf.a + pt.y * tf.c + tf.e
    const y = pt.x * tf.b + pt.y * tf.d + tf.f

    return {
      x,
      y
    }
  }
})

_.extend(Point.prototype, {
  distance (other) {
    return Point.distance(this, other)
  }
})

const Line = function (p1, p2) {
  this.p1 = p1
  this.p2 = p2
}

_.extend(Line, {
  create () {
    let args = Array.prototype.slice.call(arguments)
    args = Array.prototype.concat.call([null], args)
    return new (Function.prototype.bind.apply(Line, args))()
  },

  equal (l1, l2) {
    const line = new Line(l1)
    return line.equal(l2)
  },

  isParallel (l1, l2, tol) {
    // vector angle
    tol = tol || Math.PI / 18000 // 0.01 Math.PI / 180
    const angle1 = Vector.angle(l1.p1, l1.p2) % Math.PI
    const angle2 = Vector.angle(l2.p1, l2.p2) % Math.PI
    return Math.abs(angle1 - angle2) <= tol
    /* console.log('isParallel:', angle2, angle1, Math.abs(angle1 - angle2) <= tol)
    return Math.abs((l1.p2.x - l1.p1.x) * (l2.p2.y - l2.p1.y) -
      (l1.p2.y - l1.p1.y) * (l2.p2.x - l2.p1.x)) <= tol */
  },

  isPtOn (pt, line, options) {
    options = _.defaults({}, options, {
      extend: false,
      tol: DEFAULT_TOL
    })

    const line1 = new Line(pt, line.p1)
    const isParallel = Line.isParallel(line, line1)
    if (!isParallel) return false
    const dis1 = Point.distance(pt, line.p1)
    const dis2 = Point.distance(pt, line.p2)
    const dis = Point.distance(line.p1, line.p2)
    console.log('此点与该线的任意一点组成的线是否与该线平行：', isParallel) // vector angle
    console.log('此点到p1的距离：', dis1) // dis to p1
    console.log('此点到p2的距离：', dis2) // dis to p2
    console.log('此点是否在线上：', isParallel && dis1 <= dis && dis2 <= dis)
    return dis1 <= dis && dis2 <= dis

    /* if (!options.extend) {
      // vertical
      if (Math.abs(line.p1.x - line.p2.x) < options.tol) {
        return Math.abs(pt.x - line.p1.x) < options.tol &&
          pt.y >= Math.min(line.p1.y, line.p2.y) - options.tol &&
          pt.y <= Math.max(line.p1.y, line.p2.y) + options.tol
      }
      // horizontal
      if (Math.abs(line.p1.y - line.p2.y) < options.tol) {
        return Math.abs(pt.y - line.p1.y) < options.tol &&
          pt.x >= Math.min(line.p1.x, line.p2.x) - options.tol &&
          pt.x <= Math.max(line.p1.x, line.p2.x) + options.tol
      }

      if (_.min([line.p1.x, line.p2.x]) - pt.x > options.tol ||
        pt.x - _.max([line.p1.x, line.p2.x]) > options.tol) {
        return false
      }

      if (_.min([line.p1.y, line.p2.y]) - pt.y > options.tol ||
       pt.y - _.max([line.p1.y, line.p2.y]) > options.tol) {
        return false
      }
    }

    // vertical
    if (Math.abs(line.p1.x - line.p2.x) < options.tol) {
      return Math.abs(pt.x - line.p1.x) < options.tol
    }
    // horizontal
    if (Math.abs(line.p1.y - line.p2.y) < options.tol) {
      return Math.abs(pt.y - line.p1.y) < options.tol
    }

    return Math.abs((pt.x - line.p1.x) * (line.p2.y - line.p1.y) -
      (pt.y - line.p1.y) * (line.p2.x - line.p1.x)) <= options.tol */
  },

  ptLineDist (pt, line) {
    if (line.p1.x === line.p2.x) {
      return Math.abs(line.p1.x - pt.x)
    } else if (line.p1.y === line.p2.y) {
      return Math.abs(line.p1.y - pt.y)
    } else {
      const A = (line.p1.y - line.p2.y) / (line.p1.x - line.p2.x)
      const B = -1
      const C = line.p2.y - line.p2.x * A

      return Math.abs(A * pt.x + B * pt.y + C) / Math.sqrt(A * A + B * B)
    }
  },

  ptProjection (pt, line) {
    let k
    const pLine = line.p1
    if (line.p1.y === line.p2.y) {
      return {
        x: pt.x,
        y: pLine.y
      }
    } else if (line.p1.x === line.p2.x) {
      return {
        x: pLine.x,
        y: pt.y
      }
    } else {
      k = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x)
      const x = (k * pLine.x + pt.x / k + pt.y - pLine.y) / (1 / k + k)
      return {
        x: x,
        y: -1 / k * (x - pt.x) + pt.y
      }
    }
  },

  intersect (l1, l2, options) {
    options = _.defaults({}, options, {
      tol: DEFAULT_TOL,
      extend: false
    })
    if (Line.isParallel(l1, l2, options.tol)) {
      return null
    }

    const p1 = ((l2.p2.y - l2.p1.y) * (l2.p1.x - l1.p1.x) - (l2.p2.x - l2.p1.x) * (l2.p1.y - l1.p1.y)) /
        ((l2.p2.y - l2.p1.y) * (l1.p2.x - l1.p1.x) - (l2.p2.x - l2.p1.x) * (l1.p2.y - l1.p1.y))
    const p2 = ((l1.p2.y - l1.p1.y) * (l2.p1.x - l1.p1.x) - (l1.p2.x - l1.p1.x) * (l2.p1.y - l1.p1.y)) /
        ((l1.p2.x - l1.p1.x) * (l2.p2.y - l2.p1.y) - (l1.p2.y - l1.p1.y) * (l2.p2.x - l2.p1.x))
    const pt = {
      x: (l1.p2.x - l1.p1.x) * p1 + l1.p1.x,
      y: (l1.p2.y - l1.p1.y) * p1 + l1.p1.y
    }

    const tol = 0.00001
    if (options.extend || ((p1 > 0 - tol && p1 < 1.0 + tol) && (p2 > 0 - tol && p2 < 1.0 + tol))) {
      return {
        point: pt,
        p1: p1,
        p2: p2
      }
    }

    if (options.limit === 0.5 && p1 > 0 - tol) {
      return {
        point: pt,
        p1: p1,
        p2: p2
      }
    }

    if (options.limit === 1 && (p1 > 0 - tol && p1 < 1.0 + tol)) {
      return {
        point: pt,
        p1: p1,
        p2: p2
      }
    }

    if (options.limit === 2 && (p2 > 0 - tol && p2 < 1.0 + tol)) {
      return {
        point: pt,
        p1: p1,
        p2: p2
      }
    }

    return null
  },

  isColinear (l1, l2, tol) {
    return Point.isColinear(l1.p1, l1.p2, l2.p1, tol) &&
      Point.isColinear(l1.p1, l1.p2, l2.p2, tol)
  },

  hasOverlap (l1, l2, tol) {
    tol = tol || DEFAULT_TOL
    if (!Line.isColinear(l1, l2, tol)) return false

    const cl = l1.length() + l2.length() - _.max([
      Point.distance(l1.p1, l2.p1),
      Point.distance(l1.p1, l2.p2),
      Point.distance(l1.p2, l2.p1),
      Point.distance(l1.p2, l2.p2)
    ])

    return cl > tol
  }
})

_.extend(Line.prototype, {
  points () {
    return [this.p1, this.p2]
  },

  length () {
    return Point.distance(this.p1, this.p2)
  },

  isHori () {
    return this.p1.y === this.p2.y
  },

  isVertical () {
    return this.p1.x === this.p2.x
  },

  equal (other) {
    return this.p1.x === other.p1.x &&
    this.p1.y === other.p1.y &&
    this.p2.x === other.p2.x &&
    this.p2.y === other.p2.y
  },

  paramPoint (param) {
    return Point.paramPoint(this.p1, this.p2, param)
  },

  pointParam (pt) {
    if (!this.isPtOn(pt)) {
      throw new Error('The point is not on the line!')
    }

    if (Point.equal(this.p1, this.p2)) {
      throw new Error('Invalid line data!')
    }

    if (Math.abs(this.p2.x - this.p1.x) > Math.abs(this.p2.y - this.p1.y)) {
      return (pt.x - this.p1.x) / (this.p2.x - this.p1.x)
    }

    return (pt.y - this.p1.y) / (this.p2.y - this.p1.y)
  },

  isPtOn (pt, tol) {
    tol = tol || DEFAULT_TOL
    return Line.isPtOn(pt, this, { tol: tol })
  },

  ptLineDist (pt) {
    return Line.ptLineDist(pt, this)
  },

  nearestPoint (pt, options) {
    options = _.defaults({}, options, {
      extend: false
    })

    const l1 = (pt.x - this.p1.x) * (this.p2.x - this.p1.x) + (pt.y - this.p1.y) * (this.p2.y - this.p1.y)
    const l2 = (this.p2.x - this.p1.x) * (this.p2.x - this.p1.x) + (this.p2.y - this.p1.y) * (this.p2.y - this.p1.y)
    let t = l1 / l2

    if (!options.extend) {
      if (t < 0) {
        t = 0
      } else if (t > 1) {
        t = 1
      }
    }

    return this.paramPoint(t)
  },

  ptProjection (pt) {
    return Line.ptProjection(pt, this)
  },

  intersect (line, options) {
    return Line.intersect(line, this, options)
  },

  isIntersectedWith (rect) {
    rect = new Rect(rect)
    const line1 = new Line(rect.leftTop(), rect.rightTop())
    const line2 = new Line(rect.leftTop(), rect.leftBottom())
    const line3 = new Line(rect.rightTop(), rect.rightBottom())
    const line4 = new Line(rect.leftBottom(), rect.rightBottom())
    return Line.intersect(this, line1) || Line.intersect(this, line2) || Line.intersect(this, line3) || Line.intersect(this, line4)
  }
})

const PolyLine = function (points) {
  this.points = points
}

_.extend(PolyLine, {
  create () {
    let args = Array.prototype.slice.call(arguments)
    args = Array.prototype.concat.call([null], args)
    return new (Function.prototype.bind.apply(PolyLine, args))()
  },

  isPtOn (pl, pt) {
    pl = new PolyLine(pl)
    return pl.isPtOn(pt)
  },

  merge (origin, data) {
    if (!data) return origin

    const ans = origin
    if (_.isArray(data)) {
      _.forEach(data, function (pt) {
        PolyLine.merge(ans, pt)
      })

      return ans
    } else {
      const pt = data

      if (ans.length === 0) {
        ans.push(pt)
      }

      // if it's exactly the same point, do nothing.
      if (_.isEqual(pt, ans[ans.length - 1])) {
        return ans
      }

      // the original poly line only have one point or has no point.
      if (ans.length === 1) {
        ans.push(pt)
      }

      // the original polyline has more than 1 point
      const l1 = new Line(ans[ans.length - 2], ans[ans.length - 1])
      const l2 = new Line(ans[ans.length - 1], pt)
      if (Line.isParallel(l1, l2)) {
        ans.splice(ans.length - 1, 1)
        if (!_.isEqual(pt, ans[ans.length - 1])) {
          ans.push(pt)
        }
      } else {
        ans.push(pt)
      }

      return ans
    }
  },

  lines (points, options) {
    options = Object.assign({}, options)
    const lines = []
    const length = points.length
    const type = options.isHori ? 'x' : 'y'
    for (let i = 0; i < length - 1; i++) {
      const pts = _.sortBy([points[i], points[i + 1]], pt => pt[type])
      lines.push(new Line(pts[0], pts[1]))
    }
    if (options.isClosed) {
      const pts = _.sortBy([points[length - 1], points[0]], pt => pt[type])
      lines.push(new Line(pts[0], pts[1]))
    }
    return lines
  },

  intersect (pl1, pl2) {
    const ans = []
    const points1 = _.result(pl1, 'points')
    const points2 = _.result(pl2, 'points')
    for (let i = 0; i < points1.length - 1; ++i) {
      const l1 = new Line(points1[i], points1[i + 1])
      for (let j = 0; j < points2.length - 1; ++j) {
        const l2 = new Line(points2[j], points2[j + 1])
        const intersection = Line.intersect(l1, l2)
        if (intersection) {
          intersection.p1 += i
          intersection.p2 += j
          ans.push(intersection)
        }
      }
    }

    return ans
  },

  hasOverlap (pl1, pl2) {
    let ans = false
    const points1 = pl1.points
    const points2 = pl2.points
    for (let i = 0; i < points1.length - 1; ++i) {
      const l1 = new Line(points1[i], points1[i + 1])
      for (let j = 0; j < points2.length - 1; ++j) {
        const l2 = new Line(points2[j], points2[j + 1])
        if (Line.hasOverlap(l1, l2)) {
          ans = true
          break
        }
      }

      if (ans) break
    }

    return ans
  },

  length (pl1, options) {
    pl1 = new PolyLine(pl1)
    return pl1.length(options)
  }
})

_.extend(PolyLine.prototype, {
  isPtOn (pt) {
    let ans = false
    for (let i = 0; i < this.points.length - 1; ++i) {
      const line = new Line(this.points[i], this.points[i + 1])
      if (line.isPtOn(pt)) {
        ans = true
        break
      }
    }

    return ans
  },

  lines (options) {
    return PolyLine.lines(this.points, options)
  },

  params () {
    const params = new Array(this.points.length)
    _.forEach(params, (val, index) => {
      params[index] = {
        param: index
      }
    })
    return params
  },

  pointParam (pt, escape) {
    let param = null
    for (let i = 0; i < this.points.length - 1; ++i) {
      const line = new Line(this.points[i], this.points[i + 1])
      if (line.isPtOn(pt)) {
        if (_.isEqual(this.points[i], pt)) {
          pt = this.points[i]
        } else if (_.isEqual(this.points[i + 1], pt)) {
          pt = this.points[i + 1]
        }
        param = i + line.pointParam(pt)
        if (!escape || param > escape) {
          break
        }
      }
    }

    return param
  },

  paramPoint (param) {
    if (param < 0 || param > this.points.length - 1) {
      console.log(param, this.points)
      throw new Error('param is out of range!')
    }
    if (_.isEqual(param, this.points.length - 1)) {
      return this.points[this.points.length - 1]
    }

    const index = Math.floor(param)
    const line = new Line(this.points[index], this.points[index + 1])
    return line.paramPoint(param - index)
  },

  intersect (other) {
    return PolyLine.intersect(this, other)
  },

  isIntersectedWith (rect) {
    let ans = false
    for (let i = 0; i < this.points.length - 1; ++i) {
      const line = new Line(this.points[i], this.points[i + 1])
      ans = line.isIntersectedWith(rect)
      if (ans) {
        break
      }
    }

    return ans
  },

  length (options) {
    const lines = this.lines(options)
    let len = 0
    lines.forEach(item => {
      len += item.length()
    })
    return len
  }
})

const Rect = function (args) {
  if (_.isArray(args)) {
    if (args.length < 3) throw new Error('need more than 3 points!')
    const xMin = _.minBy(args, pt => pt.x).x
    const yMin = _.minBy(args, pt => pt.y).y
    const xMax = _.maxBy(args, pt => pt.x).x
    const yMax = _.maxBy(args, pt => pt.y).y
    this.x = xMin
    this.y = yMin
    this.width = xMax - xMin
    this.height = yMax - yMin
  } else {
    this.x = args.x
    this.y = args.y
    this.width = args.width
    this.height = args.height
  }
}

_.extend(Rect, {
  create () {
    let args = Array.prototype.slice.call(arguments)
    args = Array.prototype.concat.call([null], args)
    return new (Function.prototype.bind.apply(Rect, args))()
  },

  points (rect) {
    rect = new Rect(rect)
    return [rect.leftTop(), rect.rightTop(), rect.rightBottom(), rect.leftBottom()]
  },

  center (rect) {
    rect = new Rect(rect)
    return rect.center()
  },

  isPtInside (pt, rect) {
    const tl = {
      x: rect.x,
      y: rect.y
    }
    const rb = {
      x: rect.x + rect.width,
      y: rect.y + rect.height
    }
    return pt.x >= tl.x && pt.y >= tl.y &&
      pt.x <= rb.x && pt.y <= rb.y
  },

  isEnclosedIn (rect1, rect2) {
    rect1 = new Rect(rect1)
    return rect1.isEnclosedIn(rect2)
  }
})

_.extend(Rect.prototype, {
  assign (other) {
    this.x = other.x
    this.y = other.y
    this.width = other.width
    this.height = other.height
  },

  points () {
    return [this.leftTop(), this.rightTop(), this.rightBottom(), this.leftBottom()]
  },

  isHori () {
    return this.width >= this.height
  },

  toJSON () {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }
  },

  center () {
    return {
      x: this.x + this.width * 0.5,
      y: this.y + this.height * 0.5
    }
  },

  leftTop () {
    return {
      x: this.x,
      y: this.y
    }
  },

  rightTop () {
    return {
      x: this.x + this.width,
      y: this.y
    }
  },

  leftBottom () {
    return {
      x: this.x,
      y: this.y + this.height
    }
  },

  rightBottom () {
    return {
      x: this.x + this.width,
      y: this.y + this.height
    }
  },

  isPtInside (pt) {
    return Rect.isPtInside(pt, this)
  },

  isEnclosedIn (rect) {
    return this.x >= rect.x && this.y >= rect.y &&
      (this.x + this.width) <= (rect.x + rect.width) &&
      (this.y + this.height) <= (rect.y + rect.height)
  },

  isIntersectedWith (rect) {
    rect = new Rect(rect)
    const tl1 = this.leftTop()
    const rb1 = this.rightBottom()
    const tl2 = rect.leftTop()
    const rb2 = rect.rightBottom()

    return tl1.x < rb2.x && tl1.y < rb2.y &&
      rb1.x > tl2.x && rb1.y > tl2.y
  },

  nearestTip (pt) {
    const polyLine = new PolyLine([this.leftTop(), this.rightTop(), this.rightBottom(), this.leftBottom(), this.leftTop()])
    if (!polyLine.isPtOn(pt)) return null
    const param = polyLine.pointParam(pt)
    return polyLine.paramPoint(Math.round(param))
  },

  merge (other) {
    const x = _.min([this.x, other.x])
    const y = _.min([this.y, other.y])
    const width = _.max([this.x + this.width, other.x + other.width]) - x
    const height = _.max([this.y + this.height, other.y + other.height]) - y

    this.x = x
    this.y = y
    this.width = width
    this.height = height

    return this
  }
})

export {
  DEFAULT_TOL,
  Point,
  Line,
  PolyLine,
  Rect
}
