import Factory from './factory'
import wall from './wall'
import joint from './joint'
import area from './area'

import window from './window'
// import DataStore from './dataStore'
// import Vue from 'vue'

// DataStore.initialize()
// Vue.mixin({
//   DataStore,
// })
const registry = [wall, joint, area, window]

Factory.regist(registry)
