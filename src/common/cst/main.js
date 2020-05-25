import Unit from './unit'
import './point'
import './rect'
import './line'
import './polygon'
import './angle'
import Dispatch from './dispatch'
const CST = {
  toLogical (data, options) {
    return Dispatch.invoke('toLogical', data, options)
  },

  toPhysical (data, options) {
    return Dispatch.invoke('toPhysical', data, options)
  },

  mm: Unit.mm
}

export default CST
