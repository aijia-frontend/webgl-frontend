import JigCmd from '@/common/jigCmd'
import doorJig from './doorJig'

const AddDoor = JigCmd.extend({
  jigType: doorJig,

  initialize (attrs, options) {
    this.attrs = attrs
    this.options = options
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    JigCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default AddDoor
