import JigCmd from '@/common/jigCmd'
import wallJig from './wallJig'
const DrawWall = JigCmd.extend({
  jigType: wallJig,

  initialize (attrs, options) {
    this.attrs = attrs
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd () {
    JigCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default DrawWall
