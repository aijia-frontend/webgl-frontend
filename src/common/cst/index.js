import DPI from './dpi'
import Dispatch from './dispatch'
import Unit from './unit'
import './point'

const CST = {
  toLogical: function (data, options) {
    return Dispatch.invoke('toLogical', data, options)
  },

  toPhysical: function (data, options) {
    return Dispatch.invoke('toPhysical', data, options)
  },

  getDPI: function () {
    return DPI.get()
  },

  setDPI: function (v) {
    DPI.set(v)
  },

  mm: Unit.mm
}

export default CST
