import JigCmd from '@/common/jigCmd'
import MoveJointJig from './moveJointJig'

const MoveJoint = JigCmd.extend({
  jigType: MoveJointJig,

  initialize (attrs, options) {
    this.attrs = attrs
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  end () {
    JigCmd.prototype.end.apply(this, arguments)
  }
})

export default MoveJoint
