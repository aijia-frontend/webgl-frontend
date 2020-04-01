import Factory from './factory'
import wall from './wall'
// import DataStore from './dataStore'
// import Vue from 'vue'

// DataStore.initialize()
// Vue.mixin({
//   DataStore,
// })
console.log(wall, wall.type)
const registry = [wall]

Factory.regist(registry)
