import BaseCmd from '../common/baseCmd'

const Destroy = BaseCmd.extend({
  initialize (attrs, options) {
    this.attrs = attrs
    BaseCmd.prototype.initialize.apply(this, arguments)
  },

  execute () {},

  onStart () {
    BaseCmd.prototype.onStart.apply(this, arguments)
  },

  onEnd () {
    BaseCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default Destroy
