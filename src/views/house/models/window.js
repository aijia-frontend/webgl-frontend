import Symbol from './symbol'
import _clone from 'lodash/clone'
import { Point } from '@/common/geometry'
import Vector from '@/common/vector'

const Window = Symbol.extend({
  initialize () {
    this.type = 'window'
    Symbol.prototype.initialize.apply(this, arguments)
  },

  getPosition () {
    return _clone(this.attrs.position)
  },

  width () {
    return _clone(this.attrs.width)
  },

  deepth () {
    return _clone(this.attrs.deepth)
  },

  getPointsAround () {
    const attrs = _clone(this.attrs)
    const offsetW = new Vector(attrs.width / 2, 0) // 中心点到窗户短边的向量
    offsetW.rotateZ(attrs.angle) // 窗户的角度
    const offsetD = new Vector(0, attrs.deepth / 2) // 中心点到窗户长边的向量
    offsetD.rotateZ(attrs.angle)
    const center = new Point(0, 0) // 中心点
    const p1 = _clone(center).addOffset(offsetW).addOffset(offsetD)
    const p2 = _clone(center).addOffset(offsetW).addOffset(Vector.multiply(offsetD, -1))
    const p3 = _clone(center).addOffset(Vector.multiply(offsetW, -1)).addOffset(Vector.multiply(offsetD, -1))
    const p4 = _clone(center).addOffset(Vector.multiply(offsetW, -1)).addOffset(offsetD)

    return [p1, p2, p3, p4]
  }
})

Window.type = 'window'

export default Window
