<template>
  <svg id="svg" width="100%" height="100%" @click="onClick" @mousewheel="onMouseWheel">
    <defs>
      <patternGroup id="grid-sym-minus-min" :pattern="patternMinusMin" :scale="scale"></patternGroup>
      <patternGroup id="grid-sym-minus" :pattern="patternMinus" :scale="scale"></patternGroup>
      <patternGroup id="grid-sym" :pattern="pattern" :scale="scale"></patternGroup>
      <patternGroup id="grid-sym-plus" :pattern="patternPlus" :scale="scale"></patternGroup>
    </defs>
    <g class="background">
      <rect class="bg-color" width="100%" hight="100%"/>
      <rect
        :class="bgFill"
        :x="boundary.x"
        :y="boundary.y"
        :width="boundary.width"
        :height="boundary.height"
        fill="url(#grid-sym)"
        :transform="tf.toString()"></rect>
      <g class="ucs" :transform="tf.toString()">
        <line
          class="ucs-h"
          :x1="boundary.x"
          :x2="boundary.x + boundary.width"
          :y1="boundary.y + boundary.height * 0.5"
          :y2="boundary.y + boundary.height * 0.5"
          stroke="#00FF00"
          stroke-width="1"></line>
        <line
          class="ucs-v"
          :y1="boundary.y"
          :y2="boundary.y + boundary.height"
          :x1="boundary.x + boundary.width * 0.5"
          :x2="boundary.x + boundary.width * 0.5"
          stroke="#Dc143C"
          stroke-width="1"></line>
      </g>
    </g>
    <g class="container" :transform="tf.toString()">
      <circle :cx="origin.x" :cy="origin.y" r="5" fill="none" stroke="red"></circle>
    </g>
    <g class="transient"></g>
  </svg>
</template>

<script>
import CST from '@/common/cst/main'
import DataStore from '@/common/dataStore'
import { Point } from '@/common/geometry'
import Matrix from '@/common/matrix'
import patternGroup from './patternGroup'
const page = {
  width: 160000, // 160000(mm) 160m
  height: 100000
}
const space = 500 // space = 500mm
const defaultGidSpace = 20 // mm

export default {
  name: 'Drawing',

  data () {
    return {
      pattern: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      patternPlus: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      patternMinus: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      patternMinusMin: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      origin: {},
      tf: Matrix.identity(),
      boundary: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      scale: 1,
      bgFill: 'grid-sym'
    }
  },

  components: {
    patternGroup
  },

  mounted () {
    this.el = document.getElementById('svg')
    this.calcPattern()
    this.defaultGidSpace = defaultGidSpace
  },

  methods: {
    calcPattern () {
      const $el = document.getElementById('canvas')
      const width = $el.offsetWidth
      const height = $el.offsetHeight
      this.origin = {
        x: width * 0.5,
        y: height * 0.5
      }
      DataStore.origin = this.origin

      const pxPerMM = CST.mm.toPhysical(1.0)
      this.pattern.x = this.origin.x
      this.pattern.y = this.origin.y
      this.pattern.width = space * pxPerMM
      this.pattern.height = space * pxPerMM

      this.patternPlus = Object.assign({}, this.pattern)
      this.patternPlus.width *= 5
      this.patternPlus.height *= 5

      this.patternMinus = Object.assign({}, this.pattern)
      this.patternMinus.width *= 0.2
      this.patternMinus.height *= 0.2

      this.patternMinusMin = Object.assign({}, this.patternMinus)
      this.patternMinusMin.width *= 0.2
      this.patternMinusMin.height *= 0.2

      const rect = {
        x: -page.width * 0.5,
        y: page.height * 0.5,
        width: page.width,
        height: page.height
      }
      this.boundary = CST.toPhysical({
        tag: 'rect',
        attrs: rect
      }, {
        origin: this.origin
      }).attrs
    },

    posInView (pt) {
      const ctm = this.el.getScreenCTM()
      const pos = this.el.createSVGPoint()
      pos.x = pt.x
      pos.y = pt.y

      return pos.matrixTransform(ctm.inverse())
    },

    posInContent (pt, options = { clasp: true }) { // 默认吸附
      let pos = this.posInView(pt)
      console.log('物理坐标：', pos)
      const tf = this.transform().clone().inverse()
      pos = Point.transform(pos, tf)

      const cstOptions = {
        tag: 'point',
        origin: this.origin
      }
      const lPos = CST.toLogical(pos, cstOptions)
      if (options.clasp) {
        lPos.x = Math.round(lPos.x / this.defaultGidSpace) * this.defaultGidSpace
        lPos.y = Math.round(lPos.y / this.defaultGidSpace) * this.defaultGidSpace
      }
      console.log('逻辑左边：', lPos)

      return CST.toPhysical(lPos, cstOptions)
    },

    onClick (e) {
      console.log('click')
      console.log(this.posInContent({
        x: e.pageX,
        y: e.pageY
      }))
    },

    onMouseWheel (e) {
      let delta = 0
      delta = e.wheelDelta / 120
      const factor = delta > 0 ? Math.pow(5.0, 0.2) : Math.pow(0.2, 0.2)
      const pos = this.posInView({
        x: e.pageX,
        y: e.pageY
      })

      const tf = this.transform().clone()

      tf.translate(-pos.x, -pos.y)
        .scale(factor, factor)
        .translate(pos.x, pos.y)
      if (tf.a <= 0.005) {
        console.log('can not zoom out')
        // return
      }
      if (tf.a >= 20) {
        console.log('can not zoom in')
        return
      }
      if (tf.a <= 0.2) {
        this.bgFill = 'grid-sym-plus'
        this.defaultGidSpace = 500
      } else if (tf.a >= 5) {
        this.bgFill = 'grid-sym-minus-min'
        this.defaultGidSpace = 4
      } else if (tf.a >= 2) {
        this.bgFill = 'grid-sym-minus'
        this.defaultGidSpace = 20
      } else {
        this.bgFill = 'grid-sym'
        this.defaultGidSpace = 100
      }

      this.transform(tf)
      this.scale = tf.a
      console.log('缩放倍数：', tf.a)
    },

    transform (v) {
      if (v) this.tf = v
      return this.tf
    }
  }
}
</script>
<style scoped>
  svg line,
  svg circle,
  svg polyline,
  svg rect,
  svg path,
  svg polygon,
  svg ellipse {
    vector-effect: non-scaling-stroke;
    fill: none;
  }
  svg .wall {
    fill: url() !important;
  }
  svg rect.bg-color {
    fill: #F0F4F5 !important;
  }
  svg rect.grid-sym-minus-min {
    fill: url(#grid-sym-minus-min) !important;
  }
  svg rect.grid-sym-minus {
    fill: url(#grid-sym-minus) !important;
  }
  svg rect.grid-sym {
    fill: url(#grid-sym) !important;
  }
  svg rect.grid-sym-plus {
    fill: url(#grid-sym-plus) !important;
  }
</style>
