import Vue from 'vue'
const install = () => {
  Vue.prototype.$bus = new Vue()
}
export default install
