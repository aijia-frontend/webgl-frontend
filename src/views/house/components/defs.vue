<template>
  <defs>
    <patternGroup id="grid-sym-minus-min" :pattern="patternMinusMin" :scale="scale"></patternGroup>
    <patternGroup id="grid-sym-minus" :pattern="patternMinus" :scale="scale"></patternGroup>
    <patternGroup id="grid-sym" :pattern="pattern" :scale="scale"></patternGroup>
    <patternGroup id="grid-sym-plus" :pattern="patternPlus" :scale="scale"></patternGroup>
    <wallFill></wallFill>
    <floorFill></floorFill>
    <g id="wall-end">
      <circle
        cx="0"
        cy="0"
        :r="radiusGrip"
        fill="#96969B"
        stroke="#FFD700"
        :stroke-width="radiusGrip * 0.5"></circle>
    </g>
    <g id="joint-snap" class="snap">
      <circle cx="0" cy="0" :r="radiusSnap"></circle>
      <line x1="0" x2="0" :y1="-radiusSnap * 0.75" :y2="radiusSnap * 0.75"></line>
      <line y1="0" y2="0" :x1="-radiusSnap * 0.75" :x2="radiusSnap * 0.75"></line>
    </g>
    <g id="wall-inside-snap" class="snap">
      <circle cx="0" cy="0" :r="radiusSnap"></circle>
    </g>
    <g id="wall-center-snap" class="snap">
      <polygon :points="pointsStr"></polygon>
    </g>
    <g id="symbol-end">
      <circle cx="0" cy="0" :r="radiusGrip"></circle>
    </g>
  </defs>
</template>
<script>
import patternGroup from './patternGroup'
import floorFill from './floorFill'
import wallFill from './wallFill'

import CST from '@/common/cst/main'
import { getPointsStr } from '@/common/util/pointUtil'

const space = 100 // space = 500mm
const gripCircleRadius = 30 // mm
const snapCircleRadius = 45 // mm
const snapTriangle = 45 // mm

export default {
  name: 'Def',
  components: {
    patternGroup,
    wallFill,
    floorFill
  },
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
      radiusGrip: 0,
      radiusSnap: 0,
      pointsStr: ''
    }
  },
  props: {
    scale: {
      type: Number,
      required: true
    },
    origin: {
      type: Object,
      required: true
    }
  },
  watch: {
    origin: function (newV, oldV) {
      this.origin = newV
      this.calcPattern()
      this.calcSnaps()
    }
  },
  methods: {
    calcPattern () {
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
    },
    calcSnaps () {
      this.radiusGrip = CST.mm.toPhysical(gripCircleRadius)
      this.radiusSnap = CST.mm.toPhysical(snapCircleRadius)

      const points = [{ x: 0, y: snapTriangle }, { x: snapTriangle, y: -snapTriangle }, { x: -snapTriangle, y: -snapTriangle }].map(pt => CST.toPhysical(pt, { tag: 'point' }))
      this.pointsStr = getPointsStr(points)
    }
  }
}
</script>
<style scoped>
  .snap circle {
    stroke: #ffffff;
    stroke-width: 4mm;
    fill: #327DFF;
  }

  .snap line {
    stroke: #ffffff;
    stroke-width: 6mm;
  }

  .snap polygon {
    stroke: #ffffff;
    stroke-width: 5mm;
    fill: #327DFF;
  }

  #symbol-end circle {
    fill: #ffffff;
    stroke: #4B96FF;
    stroke-width: 6mm
  }
</style>
