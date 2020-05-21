import JigCmd from '@/common/jigCmd'
import fabricJig from './fabricJig'

const AddFabric = JigCmd.extend({
  jigType: fabricJig,

  initialize (attrs, options) {
    this.attrs = attrs
    this.options = options
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    JigCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default AddFabric
