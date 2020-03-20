import { has as _has, extend as _extend } from 'lodash'
const extend = function (protoProps, staticProps) {
  const parent = this
  let child

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && _has(protoProps, 'constructor')) {
    child = protoProps.constructor
  } else {
    child = function () {
      return parent.apply(this, arguments)
    }
  }

  // Add static properties to the constructor function, if supplied.
  _extend(child, parent, staticProps)

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  const Surrogate = function () {
    this.constructor = child
  }
  Surrogate.prototype = parent.prototype
  // eslint-disable-next-line no-new
  child.prototype = new Surrogate()

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) _extend(child.prototype, protoProps)

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype

  return child
}

export default extend
