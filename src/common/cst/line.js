import Dispatch from './dispatch'
import Point from './point'

const toPhysical = function (data, options) {
  const p1 = Point.toPhysical({
    x: data.attrs.x1,
    y: data.attrs.y1
  }, options)
  const p2 = Point.toPhysical({
    x: data.attrs.x2,
    y: data.attrs.y2
  }, options)

  return {
    tag: data.tag,
    attrs: Object.assign({}, data.attrs, {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y
    })
  }
}

const toLogical = function (data, options) {
  const p1 = Point.toLogical({
    x: data.attrs.x1,
    y: data.attrs.y1
  }, options)
  const p2 = Point.toLogical({
    x: data.attrs.x2,
    y: data.attrs.y2
  }, options)

  return {
    tag: data.tag,
    attrs: Object.assign({}, data.attrs, {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y
    })
  }
}

const Line = {
  toLogical,
  toPhysical
}
Dispatch.register('line', Line)

export default Line
