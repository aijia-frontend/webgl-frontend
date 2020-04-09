import JigCmd from '@/common/jigCmd'
import wallSegJig from './wallSegJig'
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'
import UpdateHandler from '../handler/updateHandler'

const MoveWallSeg = JigCmd.extend({
  jigType: wallSegJig,

  initialize (attrs, options) {
    this.attrs = attrs
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    const toLogical = (pt) => CST.toLogical(pt, {
      tag: 'point',
      origin: DataStore.origin
    })

    data.wall.points = data.wall.points.map(toLogical)
    data.refs.forEach(item => {
      delete item.originPoints
      item.points = item.points.map(toLogical)
    })

    const handler = new UpdateHandler(this.attrs)
    handler.run(data)

    JigCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default MoveWallSeg
