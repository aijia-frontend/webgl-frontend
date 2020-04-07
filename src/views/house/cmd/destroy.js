import BaseCmd from '@/common/baseCmd'
import DestroyHandler from '../handler/destroyHandler'

const Destroy = BaseCmd.extend({
  initialize (attrs, options) {
    this.attrs = attrs
    BaseCmd.prototype.initialize.apply(this, arguments)
  },

  execute () {
    this.onStart()
    this.onEnd()
  },

  onStart () {
    BaseCmd.prototype.onStart.apply(this, arguments)
  },

  onEnd () {
    const destroyHandler = new DestroyHandler(this.attrs)
    destroyHandler.run(this.attrs.ents)
    BaseCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default Destroy
