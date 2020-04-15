import _extend from 'lodash/extend'
import _clone from 'lodash/clone'
import SvgRender from '@/common/renderTools'

const LineSnap = function (attrs) {
  this.attrs = {
    start: _clone(attrs.start),
    end: _clone(attrs.end)
  }
}

_extend(LineSnap.prototype, {
  render: function () {
    const json = {
      tag: 'line',
      attrs: {
        'class': 'snap',
        x1: this.attrs.start.x,
        y1: this.attrs.start.y,
        x2: this.attrs.end.x,
        y2: this.attrs.end.y,
        stroke: '#FF521D',
        'stroke-width': '2mm'
      }
    }

    this.el = SvgRender.render(json)
    return this.el
  },

  update: function (start, end) {
    this.attrs.start = _clone(start)
    this.attrs.end = _clone(end)

    if (this.el) {
      SvgRender.attr(this.el, {
        x1: this.attrs.start.x,
        y1: this.attrs.start.y,
        x2: this.attrs.end.x,
        y2: this.attrs.end.y
      })
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

export default LineSnap
