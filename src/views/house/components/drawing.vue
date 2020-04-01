<template>
  <svg
    id="svg"
    width="100%"
    height="100%"
    @click="onClick"
    @mousewheel="onMouseWheel"
    @contextmenu="onRightClick">
    <defs>
      <patternGroup id="grid-sym-minus-min" :pattern="patternMinusMin" :scale="scale"></patternGroup>
      <patternGroup id="grid-sym-minus" :pattern="patternMinus" :scale="scale"></patternGroup>
      <patternGroup id="grid-sym" :pattern="pattern" :scale="scale"></patternGroup>
      <patternGroup id="grid-sym-plus" :pattern="patternPlus" :scale="scale"></patternGroup>
      <wallFill></wallFill>
    </defs>
    <g class="background">
      <rect class="bg-color" width="100%" hight="100%"/>
      <rect
        class="boundary-bg"
        :x="boundary.x"
        :y="boundary.y"
        :width="boundary.width"
        :height="boundary.height"
        :transform="tf.toString()"></rect>
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
          stroke-width="1"></line>
        <line
          class="ucs-v"
          :y1="boundary.y"
          :y2="boundary.y + boundary.height"
          :x1="boundary.x + boundary.width * 0.5"
          :x2="boundary.x + boundary.width * 0.5"
          stroke-width="1"></line>
      </g>
    </g>
    <container ref="container" :transform="tf.toString()"></container>
    <!-- <g class="container" :transform="tf.toString()">
      <circle :cx="origin.x" :cy="origin.y" r="5" fill="none" stroke="red"></circle>
    </g> -->
    <!-- <g class="transient" :transform="tf.toString()">
      <ca></ca>
    </g> -->
    <transient ref="transient" :transform="tf.toString()"></transient>
  </svg>
</template>

<script>
import patternGroup from './patternGroup'
import wallFill from './wallFill'
import container from './container'
import transient from './transient'

import CST from '@/common/cst/main'
import { Point } from '@/common/geometry'
import Matrix from '@/common/matrix'
import Global from '@/common/global'
// import DataStore from '@/common/dataStore'
import DataStore from '../models/dataStore'

const page = {
  width: 160000, // 160000(mm) 160m
  height: 100000
}
const boundary = {
  width: 8000,
  height: 8000
}
const space = 100 // space = 500mm
const defaultGidSpace = 100 // mm

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
    patternGroup,
    wallFill,
    container,
    transient
  },

  watch: {
    tf: function (newV, oldV) {
      console.log('==============>change', newV)
      if (newV.a <= 0.2) {
        this.bgFill = 'grid-sym-plus'
        // this.defaultGidSpace = 500
      } else if (newV.a <= 1) {
        this.bgFill = 'grid-sym'
        // this.defaultGidSpace = 500
      } else if (newV.a <= 5) {
        this.bgFill = 'grid-sym-minus'
        // this.defaultGidSpace = 100
      } else {
        this.bgFill = 'grid-sym-minus-min'
        // this.defaultGidSpace = 20
      }
      this.scale = newV.a
      console.log('缩放倍数：', newV.a)
    }
  },

  created () {
  },

  mounted () {
    this.el = document.getElementById('svg')
    this.calcPattern()
    this.defaultGidSpace = defaultGidSpace
    this.zoomExtend()
    Global.drawing = this
    this.load()
    // setTimeout(() => this.load(), 3000)
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

      const pxPerMM = CST.mm.toPhysical(1.0) // 1
      this.pattern.x = this.origin.x
      this.pattern.y = this.origin.y
      this.pattern.width = space * pxPerMM // 500mm
      this.pattern.height = space * pxPerMM

      this.patternPlus = Object.assign({}, this.pattern) // 5
      this.patternPlus.width *= 5 // 1250
      this.patternPlus.height *= 5

      this.patternMinus = Object.assign({}, this.pattern) // 0.2
      this.patternMinus.width *= 0.2 // 100
      this.patternMinus.height *= 0.2

      this.patternMinusMin = Object.assign({}, this.patternMinus) // 0.04
      this.patternMinusMin.width *= 0.2 // 20
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

    load () {
      window.dataStore = DataStore
      // test
      /* console.log('=====>dataStore:', DataStore)
      DataStore.create({
        type: 'wall',
        data: { x1: 0, x2: 500, y1: 0, y2: 500, parent: this.$refs.container }
      }) */
      // model.render()
      // this.addContainer(model.$el)
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
      // console.log('物理坐标：', pos)
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
      // console.log('逻辑坐标：', lPos)

      return CST.toPhysical(lPos, cstOptions)
    },

    onClick (e) {
      console.log('逻辑坐标：', CST.toLogical(this.posInContent({ x: e.pageX, y: e.pageY }), { tag: 'point', origin: this.origin }))
    },

    onMouseWheel (e) {
      let delta = 0
      delta = e.wheelDelta / 120
      const factor = delta > 0 ? Math.pow(5.0, 0.05) : Math.pow(0.2, 0.05)
      const pos = this.posInView({
        x: e.pageX,
        y: e.pageY
      })

      const tf = this.transform().clone()

      tf.translate(-pos.x, -pos.y)
        .scale(factor, factor)
        .translate(pos.x, pos.y)
      if (tf.a <= 0.01) {
        console.log('can not zoom out')
        return
      }
      if (tf.a >= 0.1) {
        console.log('can not zoom in')
        return
      }

      this.transform(tf)
    },

    onRightClick (e) {
      console.log('rightClick')
      e.preventDefault()
      e.stopPropagation()
    },

    transform (v) {
      if (v) this.tf = v
      return this.tf
    },

    zoomExtend () {
      const pxPerMM = CST.mm.toPhysical(1.0)
      const width = boundary.width * pxPerMM
      const height = boundary.height * pxPerMM
      const scale = Math.min(this.origin.x * 2 / width, this.origin.y * 2 / height) * 0.8
      console.log('scale:', scale)
      const tf = Matrix.identity()
      tf.translate(-this.origin.x, -this.origin.y)
      tf.scale(scale, scale)
      tf.translate(this.origin.x, this.origin.y)
      this.transform(tf)
    },

    addContainer (data) {
      // Object.assign(data.data, { parent: this.$refs.container })
      // DataStore.create(data)
      // this.$refs.container.addEntity(data)
    },

    addTransient (node) {
      this.$refs.transient.addEntity(node)
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
    stroke: #ffffff;
    stroke-width: 1px;
  }
  svg .ucs-h {
    stroke: #00FF00 !important;
  }

  svg .ucs-v {
    stroke: #Dc143C !important;
  }

  svg .wall {
    fill: url() !important;
  }
  svg rect.boundary-bg {
    fill: #236 !important;
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
