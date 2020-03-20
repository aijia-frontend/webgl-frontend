// import { findIndex as _findIndex } from 'lodash'
import Vue from 'vue'

const DataStore = new Vue({
  data: {
    frame: { // 视口 100(m) * 100(m)
      width: 100,
      height: 100
    },
    origin: null,
    activeCmd: null
  },

  watch: {
  },

  methods: {
  }
})

export default DataStore
