import BaseCmd from './baseCmd.js'

const JigCmd = BaseCmd.extend({
  initialize: function (attrs, options) {
    const JigType = this.jigType
    this.jig = new JigType(attrs)
    this.bindJig()
  },

  execute: function () {
    this.jig.start()
    return BaseCmd.prototype.execute.apply(this, arguments)
  },

  cancel: function () {
    this.jig.cancel()
    return BaseCmd.prototype.cancel.apply(this, arguments)
  },

  bindJig: function () {
    this.jig.$on('start', this.onStart.bind(this))
    this.jig.$on('end', this.onEnd.bind(this))
    this.jig.$on('cancel', this.onCancel.bind(this))
  },

  unBindJig: function () {
    this.jig.$off('start')
    this.jig.$off('end')
    this.jig.$off('cancel')
  },

  onCancel: function () {
    this.unBindJig()

    BaseCmd.prototype.onCancel.apply(this, arguments)
  },

  onEnd: function (data) {
    this.unBindJig()

    BaseCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default JigCmd
