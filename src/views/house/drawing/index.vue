<template>
  <div id="content">
    <div id="dpi"></div>
    <div id="top">
      <span>缩放倍数：{{ this.tf.a }}</span>
    </div>
    <div id="left">
      <!-- <button @click="executeCmd('drawWall')">画线</button>
      <button @click="deleteS">删除首部</button>
      <button @click="deleteM">删除中间</button>
      <button @click="deleteE">删除尾部</button> -->
    </div>
    <div id="center" :class="cursor" @click="onClick" @mousewheel="onMouseWheel">
      <svg
        id="canvas"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="100%"
        height="100%">
        <!-- 背景 -->
        <rect
          class="background"
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="#DCDCDC"></rect>
        <bg-fill></bg-fill>
        <!-- 页面内容 -->
        <container id="container" :lines="lines" :transform="tf.toString()"></container>
        <!-- 临时内容 -->
        <transient id="transient" :transform="tf.toString()"></transient>
      </svg>
    </div>
    <div id="footer"></div>
  </div>
</template>

<script>
import { Point } from '@/common/geometry'
import { Deferred } from 'simply-deferred'
import Matrix from '@/common/matrix'
import DataStore from '../models/dataStore'

import BgFill from '../components/bgFill.vue'
export default {
  name: 'Drawing',
  components: {
    BgFill
  },
  data () {
    return {
      cursor: 'default',
      tf: Matrix.identity(),
      lines: []
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.el = document.getElementById('canvas')
      console.log(Deferred)
      this.defer = new Deferred()
      const width = this.el.clientWidth
      const height = this.el.clientWidth
      const origin = {
        x: width * 0.5,
        y: height * 0.5
      }
      DataStore.origin = origin
    },

    onClick (e) {},

    onMouseWheel (e) {
      const delta = e.wheelDelta / 120
      const factor = delta > 0 ? Math.pow(5.0, 0.2) : Math.pow(0.2, 0.2)
      const pos = this.posInView(e)

      const tf = this.transform().clone()

      tf.translate(-pos.x, -pos.y)
        .scale(factor, factor)
        .translate(pos.x, pos.y)

      this.transform(tf)
    },

    posInView (pt) {
      const ctm = this.el.getScreenCTM()
      let pos = this.el.createSVGPoint()
      pos.x = pt.x
      pos.y = pt.y

      pos = pos.matrixTransform(ctm.inverse())
      return pos
    },

    posInContent (pt) {
      return Point.transform(pt, this.tf.clone().inverse())
    },

    transform (v) {
      if (v) this.tf = v
      return this.tf
    },

    zoomExtent (bound) {
      let x = 0
      let y = 0
      let width = 1
      let height = 1
      if (bound) {
        ({ x, y, width, height } = bound)
      } else {
        ({ x, y, width, height } = this.container.getLocalBounds())
      }
      const viewWidth = this.app.view.width
      const viewHeight = this.app.view.height
      const ratio = Math.min(viewWidth / width, viewHeight / height) * 0.8
      const canvasCenter = {
        x: viewWidth * 0.5,
        y: viewHeight * 0.5
      }
      const center = {
        x: (x + width * 0.5) * ratio,
        y: (y + height * 0.5) * ratio
      }
      const tf = (new Matrix()).identity()

      tf.scale(ratio, ratio)
      tf.translate(canvasCenter.x - center.x, canvasCenter.y - center.y)
      this.transform(tf)
    },

    cmd () {}
  }
}
</script>

<style lang="less" scoped>
  #content {
    position: absolute;
    margin: -24px 0px;
    width: 100%;
    height: 100%;
    #dpi {
      position: absolute;
      left: -100%;
      top: -100%;
      width: 1in;
      height: 1in;
    }
    #top {
      position: absolute;
      width: 100%;
      height: 60px;
      border: 0.1px solid white;
      background-color: #A9A9A9;
      opacity: 0.6;
      z-index: 1;
    }
    #left {
      position: absolute;
      top: 60px;
      width: 200px;
      height: calc(100% - 60px);
      border: 0.1px solid white;
      background-color: #A9A9A9;
      opacity: 0.6;
      z-index: 1;
    }
    #center {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    #footer {
      position: absolute;
      bottom: 0px;
      left: 200px;
      width: calc(100% - 200px);
      height: 40px;
      border: 0.1px solid white;
      background-color: #A9A9A9;
      opacity: 0.6;
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
