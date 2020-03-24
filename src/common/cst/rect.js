import * as _ from 'lodash'
import Dispatch from './dispatch'
import Point from './point'

const toLogical = function (data, options) {
  const tl = Point.toLogical({
    x: data.attrs.x,
    y: data.attrs.y
  }, options)
  const rb = Point.toLogical({
    x: data.attrs.x + data.attrs.width,
    y: data.attrs.y - data.attrs.height
  }, options)

  return {
    tag: data.tag,
    attrs: _.extend({}, data.attrs, {
      x: _.min([tl.x, rb.x]),
      y: _.min([tl.y, rb.y]),
      width: Math.abs(rb.x - tl.x),
      height: Math.abs(rb.y - tl.y)
    })
  }
}

const toPhysical = function (data, options) {
  const tl = Point.toPhysical({
    x: data.attrs.x,
    y: data.attrs.y
  }, options)
  const rb = Point.toPhysical({
    x: data.attrs.x + data.attrs.width,
    y: data.attrs.y - data.attrs.height
  }, options)

  return {
    tag: data.tag,
    attrs: _.extend({}, data.attrs, {
      x: _.min([tl.x, rb.x]),
      y: _.min([tl.y, rb.y]),
      width: Math.abs(rb.x - tl.x),
      height: Math.abs(rb.y - tl.y)
    })
  }
}

const Rect = {
  toLogical,
  toPhysical
}
Dispatch.register('rect', Rect)

export default Rect
