import { Point } from '@/common/geometry'
import CST from '@/common/cst/main'
import SvgRenderer from '@/common/renderTools'

const PreViewBuilder = {
  wall (attrs, options) {
    // return ;
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
  }
}

export default PreViewBuilder
