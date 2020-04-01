import _extend from 'lodash/extend'
import extend from '@/common/extend'

const BaseHandler = function (attrs) {
  this.attrs = attrs
  this.drawing = attrs.drawing

  this.initialize.apply(this, arguments)
}

_extend(BaseHandler.prototype, {
  initialize: function () {},

  run: function () {
    throw new Error('Must be overridden by sub class.')
  }
})

BaseHandler.extend = extend

export default BaseHandler
