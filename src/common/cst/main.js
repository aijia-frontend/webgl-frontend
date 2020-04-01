import DPI from './dpi'
import Unit from './unit'
import './point'
import './rect'
import './line'
import './polygon'
import Dispatch from './dispatch'
const CST = {
  toLogical (data, options) {
    return Dispatch.invoke('toLogical', data, options)
  },

  toPhysical (data, options) {
    return Dispatch.invoke('toPhysical', data, options)
  },

  getDPI () {
    return DPI.get()
  },

  setDPI (v) {
    DPI.set(v)
  },

  mm: Unit.mm
}

export default CST
