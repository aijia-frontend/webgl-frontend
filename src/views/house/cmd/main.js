// 注册绘图程序
import { each as _each } from 'lodash'
import DataStore from '../models/dataStore'
import DrawWall from './drawWall'
import Pan from './pan'
import Vue from 'vue'

// eslint-disable-next-line no-new
new Vue({
  data: {
    registry: {
      drawWall: DrawWall,
      pan: Pan
    },
    activeCmd: null
  },

  watch: {
    activeCmd: function (cmd) {
      DataStore.activeCmd = cmd
    }
  },

  created: function () {
    this.eventRegistry()
    this.$bus.$on('start', this.cmdStart)
    this.$bus.$on('end', this.cmdEnd)
    this.$bus.$on('cancel', this.cmdCancel)
  },

  methods: {
    cmdStart: function (cmd) {
      this.activeCmd = cmd
    },

    cmdEnd: function () {
      this.activeCmd = null
    },

    cmdCancel: function () {
      this.activeCmd = null
    },

    eventRegistry: function () {
      const that = this
      _each(this.registry, (Handler, name) => {
        that.$bus.$on(name, function (attrs, options) {
          console.log('=========>执行命令： ', name)
          that.$bus.$emit('execute', name)
          if (that.activeCmd) {
            that.activeCmd.cancel()
          }
          const cmd = new Handler(attrs, options)
          cmd.name(name)
          cmd.execute()
        })
      })
    }
  }
})
