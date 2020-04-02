/*
 * @Description:
 * @Author: jiangronghua
 * @Date: 2020-03-04 15:49:52
 * @LastEditors: jiangronghua
 * @LastEditTime: 2020-03-24 16:42:25
 */
// with polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import { VueAxios } from './utils/request'
import { Slider } from 'ant-design-vue'
import eventBus from './common/eventBus.js'

import bootstrap from './core/bootstrap'
import './core/lazy_use'
import './permission' // permission control
import './utils/filter' // global filter
import './components/global.less'
import '@/style/index.less'

Vue.config.productionTip = false

// mount axios Vue.$http and this.$http
Vue.use(VueAxios)
Vue.use(Slider)
Vue.use(eventBus)

new Vue({
  router,
  store,
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')
