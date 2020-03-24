import Dispatch from './dispatch'
import Unit from './unit'

var getOrigin = function (options) {
  const origin = {
    x: 0,
    y: 0
  }

  if (options && options.origin) {
    origin.x = options.origin.x
    origin.y = options.origin.y
  }

  return origin
}

const toLogical = function (pt, options) {
  const origin = getOrigin(options)
  const ratio = Unit.mm.toLogical(1.0)

  return {
    x: parseFloat((pt.x * ratio + (-origin.x) * ratio).toFixed(6)),
    y: parseFloat((pt.y * (-ratio) + origin.y * ratio).toFixed(6))
  }
}

const toPhysical = function (pt, options) {
  const origin = getOrigin(options)
  const ratio = Unit.mm.toPhysical(1.0)

  return {
    x: pt.x * ratio + origin.x,
    y: pt.y * (-ratio) + origin.y
  }
}

const Point = {
  toLogical,
  toPhysical
}

Dispatch.register('point', Point)

export default Point
