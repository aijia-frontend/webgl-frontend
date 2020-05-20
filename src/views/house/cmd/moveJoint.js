import JigCmd from '@/common/jigCmd'
import MoveJointJig from './moveJointJig'
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'
import UpdateHandler from '../handler/updateHandler'
import _pick from 'lodash/pick'

const MoveJoint = JigCmd.extend({
  jigType: MoveJointJig,

  initialize (attrs, options) {
    this.attrs = attrs
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    const updates = data.map(item => {
      return {
        ent: item.ent,
        isOrigin: item.isOrigin,
        data: _pick(item, ['position', 'points'])
      }
    })
    const toLogical = (pt) => {
      return CST.toLogical(pt, {
        tag: 'point',
        origin: DataStore.origin
      })
    }
    updates.forEach(item => {
      if (item.data.points) {
        item.data.points = item.data.points.map(toLogical)
      } else if (item.data.position) {
        item.data.position = toLogical(item.data.position)
      }
    })

    const handler = new UpdateHandler(this.attrs)
    handler.run(updates)

    JigCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default MoveJoint
