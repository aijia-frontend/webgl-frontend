import JigCmd from '@/common/jigCmd'
import panJig from './panJig'

const Pan = JigCmd.extend({
  jigType: panJig,

  initialize (attrs, options) {
    this.attrs = attrs
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    JigCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default Pan
