import { Point } from '@/common/geometry'
import CST from '@/common/cst/main'
import SvgRenderer from '@/common/renderTools'
import { getPointsStr } from '@/common/util/pointUtil'
import DataStore from '../models/dataStore'
import _clone from 'lodash/clone'

const POLYGON = {
  tag: 'polygon',
  attrs: {
    class: 'wall preview',
    points: ''
  }
}

const CIRCLE = {
  tag: 'circle',
  attrs: {
    class: 'joint preview'
  }
}

const PreViewBuilder = {
  ptTfOptions: {
    tag: 'point',
    origin: DataStore.origin
  },
  wall (attrs, options) {
    const polygon = _clone(POLYGON)
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

  build (ent) {
    return this[ent.type](ent, { isModel: true })
  }
}

export default PreViewBuilder
