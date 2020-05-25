import Dispatch from './dispatch'

const TOL = 0.001

const toLogical = function (angle) {
  if (Math.abs(angle) < TOL) {
    return 0
  } else {
    return Math.PI * 2.0 - angle
  }
}

const toPhysical = function (angle) {
  if (Math.abs(angle) < TOL) {
    return 0
  } else {
    return Math.PI * 2.0 - angle
  }
}

const Angle = {
  toLogical,
  toPhysical
}

Dispatch.register('angle', Angle)

export default Angle
