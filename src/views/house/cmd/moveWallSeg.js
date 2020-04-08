import JigCmd from '@/common/jigCmd'
import wallSegJig from './wallSegJig'
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'

const MoveWallSeg = JigCmd.extend({
  jigType: wallSegJig,

  initialize (attrs, options) {
    this.attrs = attrs
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    data.pos = CST.toLogical(data.pos, {
      tag: 'point',
      origin: DataStore.origin
    })
    JigCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default MoveWallSeg
