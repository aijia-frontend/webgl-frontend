import JigCmd from '@/common/jigCmd'
import Jig from './moveSymbolSegJig'
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'
import UpdateHandler from '../handler/updateHandler'

const MoveSymbolSeg = JigCmd.extend({
  jigType: Jig,

  initialize (attrs, options) {
    this.attrs = attrs
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    const toLogical = (pt, tag = 'point') => CST.toLogical(pt, {
      tag,
      origin: DataStore.origin
    })

    const updates = [{
      ent: data.ent,
      data: {
        wall: data.wall ? data.wall.uid : '',
        position: toLogical(data.position),
        angle: toLogical(data.angle, 'angle'),
        width: CST.mm.toLogical(data.width),
        deepth: CST.mm.toLogical(data.deepth)
      }
    }]

    const handler = new UpdateHandler(this.attrs)
    handler.run(updates)

    JigCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default MoveSymbolSeg
