<template>
  <div id="content">
    <div id="top">
      <span>缩放倍数：{{ this.tf.a }}</span>
    </div>
    <div id="left">
      <button @click="executeCmd('drawWall')">画线</button>
      <button @click="deleteS">删除首部</button>
      <button @click="deleteM">删除中间</button>
      <button @click="deleteE">删除尾部</button>
    </div>
    <div id="center" :class="cursor" @click="onClick" @mousewheel="onMouseWheel">
      <svg id="canvas" xmlns="http://www.w3.org/2000/svg" version="1.1"
           width="100%" height="100%">
        <rect class="background" x="0" y="0" width="100%" height="100%" fill="#DCDCDC"></rect>
        <container id="container" :lines="lines" :transform="tf.toString()">
        </container>
        <transient id="transient" :transform="tf.toString()"></transient>
      </svg>
    </div>
    <div id="footer">
    </div>
  </div>
</template>

<script>
import container from './container'
import transient from './transient'
import DataStore from '../models/dataStore'
import wall from './wall'
import { uniqueId as _uniqueId } from 'lodash'
import Matrix from '../common/matrix'
import { Point } from '../common/geometry'

export default {
  name: 'Drawing',
  data () {
    return {
      lines: DataStore._lines,
      cursor: 'default',
      tf: Matrix.identity()
    }
  },
  components: {
    container,
    transient,
    wall
  },
  beforeCreate () {
  },
  created () {
  },
  activated () {
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      const $el = document.getElementById('center')
      this.offsetLeft = $el.offsetLeft
      this.offsetTop = $el.offsetTop
    },
    render () {},
    onClick (e) {
      let pos = this.posInView(e)
      pos = this.posInContent(pos)
      let line = this.lines[0]
      line.attrs.id = _uniqueId('line')
      line.attrs.x1 = pos.x
      line.attrs.y1 = pos.y
      this.lines.pop()
      this.lines.push(line)
      return pos
    },
    onMouseWheel (e) {
      let delta = e.wheelDelta / 120
      let factor = delta > 0 ? Math.pow(5.0, 0.2) : Math.pow(0.2, 0.2)
      let pos = this.posInView(e)

      let tf = this.transform().clone()

      tf.translate(-pos.x, -pos.y)
        .scale(factor, factor)
        .translate(pos.x, pos.y)

      this.transform(tf)
    },
    posInView (e) {
      return {
        x: e.clientX - this.offsetLeft,
        y: e.clientY - this.offsetTop
      }
    },
    posInContent (pt) {
      return Point.transform(pt, this.tf.inverse())
    },
    transform (v) {
      if (v) this.tf = v
      return this.tf
    },
    executeCmd (cmd) {
      this.$bus.$emit(cmd, {
        drawing: this
      })
      /* (Array.from({ length: 2 })).forEach(item => {
        const x = this.lines[this.lines.length - 1].attrs.x1
        const y = this.lines[this.lines.length - 1].attrs.y1
        this.lines.push({
          attrs: {
            id: _uniqueId('line'),
            x1: x + 60,
            y1: y + 60,
            x2: 500,
            y2: 500
          }
        })
      }) */
    },

    deleteS () {
      this.lines.shift()
    },
    deleteM () {
      const m = Math.floor(this.lines.length / 2)
      this.lines.splice(m, 1)
    },
    deleteE () {
      this.lines.pop()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
  #content {
    width: 100%;
    height: 100%;
    #top {
      position: absolute;
      width: 100%;
      height: 60px;
      border: 0.1px solid white;
      background-color: #A9A9A9;
    }
    #left {
      position: absolute;
      top: 60px;
      width: 200px;
      height: calc(100% - 60px);
      border: 0.1px solid white;
      background-color: #A9A9A9;
    }
    #center {
      position: absolute;
      top: 60px;
      left: 200px;
      width: calc(100% - 200px);
      height: calc(100% - 100px);
    }
    #footer {
      position: absolute;
      bottom: 0px;
      left: 200px;
      width: calc(100% - 200px);
      height: 40px;
      border: 0.1px solid white;
      background-color: #A9A9A9;
      div {
        position: relative;
        border: 0.1px solid green;
        height: 40px;
        flex: border-box;
      }
      #footer-left {
        width: 60%;
      }
      #footer-right {
        width: 40%;
      }
    }
    .default {
      cursor: crosshair;
    }
  }
</style>
