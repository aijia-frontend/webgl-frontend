import Dispatch from './dispatch'
import Point from './point'

const toPhysical = function (data, options) {
  const points = data.attrs.points.map(pt => Point.toPhysical(pt, options))

  return {
    tag: data.tag,
    attrs: Object.assign({}, data.attrs, { points })
  }
}

const toLogical = function (data, options) {
  const points = data.attrs.points.map(pt => Point.toLogical(pt, options))

  return {
    tag: data.tag,
    attrs: Object.assign({}, data.attrs, { points })
  }
}

const Polygon = {
  toLogical,
  toPhysical
}
Dispatch.register('polygon', Polygon)

export default Polygon
