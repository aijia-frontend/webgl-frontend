import JigCmd from '@/common/jigCmd'
import MoveJointJig from './moveJointJig'
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'
import UpdateHandler from '../handler/updateHandler'

const MoveJoint = JigCmd.extend({
  jigType: MoveJointJig,

  initialize (attrs, options) {
    this.attrs = attrs
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    const toLogical = (pt) => {
      return CST.toLogical(pt, {
        tag: 'point',
        origin: DataStore.origin
      })
    }
    data.forEach(item => {
      delete item.index
      delete item.originPoints

      if (item.points) {
        item.points = item.points.map(toLogical)
      } else if (item.position) {
        item.position = toLogical(item.position)
      }
    })

    const handler = new UpdateHandler(this.attrs)
    handler.run(data)

    JigCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default MoveJoint
