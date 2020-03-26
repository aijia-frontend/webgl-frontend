// import Vue from 'vue'
import * as _ from 'lodash'
const SvgRenderer = {
  version: 1.1,
  ns: 'http://www.w3.org/2000/svg',
  xmlns: 'http://www.w3.org/2000/xmlns/',
  xlink: 'http://www.w3.org/1999/xlink',
  namespace: 'http://www.w3.org/XML/1998/namespace',

  create: function (tag) {
    return document.createElementNS(SvgRenderer.ns, tag)
  },

  attr: function (node, key, val) {
    if (_.isObject(key)) {
      const attrs = key
      _.each(attrs, function (v, k) {
        SvgRenderer.attr(node, k, v)
      })
      return node
    }

    if (_.isNull(val)) {
      node.removeAttribute(key)
    } else {
      const ns = (key === 'xml:space' ? SvgRenderer.namespace
        : key.substr(0, 4) === 'xml:' ? SvgRenderer.xmlns
          : key.substr(0, 6) === 'xlink:' ? SvgRenderer.xlink : null)
      if (ns) {
        node.setAttributeNS(ns, key, val)
      } else {
        node.setAttribute(key, val)
      }
    }
    return node
  },

  remove: function (node) {
    return node.remove()
  },

  render: function (data) {
    const node = SvgRenderer.create(data.tag)
    data.el = node

    _.each(data.attrs, function (val, key) {
      SvgRenderer.attr(node, key, val)
    })

    const content = data.nodes ? data.nodes : data.content
    if (_.isArray(content)) {
      _.each(content, function (item) {
        node.appendChild(SvgRenderer.render(item))
      })
    } else if (_.isObject(content)) {
      node.appendChild(SvgRenderer.render(content))
    } else if (_.isString(content)) {
      node.innerHTML = content
    }

    return node
  }
}

export default SvgRenderer
