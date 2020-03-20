import extend from '../common/extend'
import Vue from 'vue'
const vue = new Vue()

Vue.extend({

})

const Model = function () {
  vue.call(this)
}

Model.prototype = Model.prototype
Model.constructor = Model

Model.extend = extend

Model.extend({
  // 私有
})

Model.prototype.extend({
  initialize () {},
  toJSON () {}
})

export default Model
