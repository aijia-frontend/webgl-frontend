import factory from './factory'
import wall from './wall'
import DataStore from './dataStore'
import Vue from 'vue'

DataStore.initialize()
Vue.mixin({
  DataStore,
})

const registry = [wall]

factory.regist(registry)
