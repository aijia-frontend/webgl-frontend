import { Point } from '@/common/geometry'
import CST from '@/common/cst/main'
import SvgRenderer from '@/common/renderTools'
import { getPointsStr } from '@/common/util/pointUtil'
import Vector from '@/common/vector'
import Matrix from '@/common/matrix'
import DataStore from '../models/dataStore'
import _clone from 'lodash/clone'

const POLYGON = {
  tag: 'polygon',
  attrs: {
    points: ''
  }
}

const CIRCLE = {
  tag: 'circle',
  attrs: {
    class: 'joint preview'
  }
}

const LINE = {
  tag: 'line',
  attrs: {}
}

const getWindowPtsAround = (attrs) => {
  const offsetW = new Vector(attrs.width / 2, 0) // 中心点到窗户短边的向量
  // offsetW.rotateZ(attrs.angle || 0) // 窗户的角度
  const offsetD = new Vector(0, attrs.deepth / 2) // 中心点到窗户长边的向量
  // offsetD.rotateZ(attrs.angle || 0)
  const center = new Point(0, 0) // 中心点
  const p1 = _clone(center).addOffset(offsetW).addOffset(offsetD)
  const p2 = _clone(center).addOffset(offsetW).addOffset(Vector.multiply(offsetD, -1))
  const p3 = _clone(center).addOffset(Vector.multiply(offsetW, -1)).addOffset(Vector.multiply(offsetD, -1))
  const p4 = _clone(center).addOffset(Vector.multiply(offsetW, -1)).addOffset(offsetD)

  return [p1, p2, p3, p4]
}

const PreViewBuilder = {
  ptTfOptions: {
    tag: 'point',
    origin: DataStore.origin
  },
  wall (attrs, options) {
    const polygon = _clone(POLYGON)
    polygon.attrs.class = 'wall preview'
    if (options.isModel) {
      attrs = {
        points: attrs.pointsStr()
      }
    } else {
      attrs.points = getPointsStr(attrs.points)
    }
    polygon.attrs.points = attrs.points
    return SvgRenderer.render(polygon)
  },

  dimension (p1, p2) {
    const distance = CST.mm.toLogical(Point.distance(p1, p2))
    const center = Point.paramPoint(p1, p2, 0.5)
    const text = {
      tag: 'text',
      attrs: {
        x: center.x,
        y: center.y,
        'font-size': 400
      },
      nodes: distance.toFixed(2) + 'mm'
    }
    return SvgRenderer.render(text)
  },

  joint (attrs, options) {
    if (options.isModel) {
      attrs = {
        position: CST.toPhysical(attrs.position(), { tag: 'point',
          origin: DataStore.origin
        }),
        radius: CST.mm.toPhysical(attrs.radius())
      }
    }
    const circle = _clone(CIRCLE)
    circle.attrs.cx = attrs.position.x
    circle.attrs.cy = attrs.position.y
    circle.attrs.r = attrs.radius
    return SvgRenderer.render(circle)
  },

  /* 构造窗的临时图形 */
  /*
  attrs: {
    width // 宽度
    deepth // 深度
    angle // 角度
  }
   */
  window (attrs, options) {
    if (options.isModel) {
      attrs = {
        angle: CST.toPhysical(attrs.angle(), { tag: 'angle' }),
        position: CST.toPhysical(attrs.getPosition(), { tag: 'point', origin: DataStore.origin }),
        width: CST.mm.toPhysical(attrs.width()),
        deepth: CST.mm.toPhysical(attrs.deepth())
      }
    }
    const tf = Matrix.identity()
    tf.rotate(attrs.angle)
    tf.translate(attrs.position.x, attrs.position.y)

    const window = {
      tag: 'g',
      attrs: {
        class: 'window preview',
        transform: tf.toString()
      },
      nodes: []
    }

    // 外边框的点位
    const polygon = _clone(POLYGON)
    const pts = getWindowPtsAround(attrs)
    polygon.attrs.class = ''
    polygon.attrs.points = getPointsStr(pts)

    // 内部两条线
    const p1 = Point.paramPoint(pts[0], pts[1], 1 / 3)
    const p2 = Point.paramPoint(pts[0], pts[1], 2 / 3)
    const p3 = Point.paramPoint(pts[3], pts[2], 1 / 3)
    const p4 = Point.paramPoint(pts[3], pts[2], 2 / 3)

    const line1 = _clone(LINE)
    line1.attrs = {
      x1: p1.x,
      y1: p1.y,
      x2: p3.x,
      y2: p3.y
    }
    const line2 = _clone(LINE)
    line2.attrs = {
      x1: p2.x,
      y1: p2.y,
      x2: p4.x,
      y2: p4.y
    }
    window.nodes.push(polygon, line1, line2)

    return SvgRenderer.render(window)
  },

  build (ent, options = { isModel: true }) {
    return this[ent.type](ent, options)
  }
}

export default PreViewBuilder
