import _extend from 'lodash/extend'
import _clone from 'lodash/clone'
import SvgRender from '@/common/renderTools'

const RefSnap = function (attrs) {
  this.attrs = {
    position: _clone(attrs.position),
    refId: attrs.refId
  }
}

_extend(RefSnap.prototype, {
  render: function () {
    const json = {
      tag: 'use',
      attrs: {
        'class': 'snap',
        x: this.attrs.position.x,
        y: this.attrs.position.y,
        'xlink:href': this.attrs.refId
      }
    }

    this.el = SvgRender.render(json)

    return this.el
  },

  update: function (pos) {
    this.attrs.position.x = pos.x
    this.attrs.position.y = pos.y

    if (this.el) {
      SvgRender.attr(this.el, this.attrs.position)
    }
  },

  show: function () {
    if (this.el) {
      SvgRender.attr(this.el, {
        display: 'visible'
      })
    }
  },

  hide: function () {
    if (this.el) {
      SvgRender.attr(this.el, {
        display: 'none'
      })
    }
  },

  reset: function () {
    this.hide()
    this.el = null
  }
})

export default RefSnap
