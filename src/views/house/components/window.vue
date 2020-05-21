<template>
  <g
    class="window"
    :class="{ active: isActive }"
    :id="model.uid"
    :hidden="hidden"
    :transform="tf.toString()"
    @click="onClick">
    <polygon class="bbox" :points="pointsStr"></polygon>
    <line
      v-for="line in lines"
      :key="model.uid + line.index"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"></line>
    <use :x="start.x" :y="start.y" xlink:href="#symbol-end" @mousedown="onMoveSeg(3, 0)" v-show="isActive"></use>
    <use :x="end.x" :y="end.y" xlink:href="#symbol-end" @mousedown="onMoveSeg(0, 3)" v-show="isActive"></use>
  </g>
</template>

<script>
import CST from '@/common/cst/main'
import { getPointsStr } from '@/common/util/pointUtil'
import { Point } from '@/common/geometry'
import Vector from '@/common/vector'
import matrix from '@/common/matrix'
import DataStore from '../models/dataStore'
import _clone from 'lodash/clone'

export default {
  name: 'Window',
  data () {
    return {
      pointsStr: '',
      tf: matrix.identity(),
      isActive: false,
      lines: [],
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: 0,
        y: 0
      },
      hidden: false
    }
  },
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  watch: {
    model: {
      handler (newV, old) {
        const points = this.getPointsAround(_clone(this.model.attrs))
        this.getLines(points)
        this.pointsStr = getPointsStr(points)
        const position = this.toPhysical(this.model.getPositioin())
        this.tf = matrix.identity().translate(position.x, position.y)
        this.isActive = this.model.attrs.isActive
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    // this.wall.$view = this
  },
  methods: {
    toPhysical (pt) {
      return CST.toPhysical(pt, {
        tag: 'point',
        origin: DataStore.origin
      })
    },

    getPointsAround (attrs) {
      const width = CST.mm.toPhysical(attrs.width)
      const deepth = CST.mm.toPhysical(attrs.deepth)
      const offsetW = new Vector(width / 2, 0) // 中心点到窗户短边的向量
      offsetW.rotateZ(attrs.angle) // 窗户的角度
      const offsetD = new Vector(0, deepth / 2) // 中心点到窗户长边的向量
      offsetD.rotateZ(attrs.angle)
      const center = new Point(0, 0) // 中心点
      const p1 = _clone(center).addOffset(offsetW).addOffset(offsetD)
      const p2 = _clone(center).addOffset(offsetW).addOffset(Vector.multiply(offsetD, -1))
      const p3 = _clone(center).addOffset(Vector.multiply(offsetW, -1)).addOffset(Vector.multiply(offsetD, -1))
      const p4 = _clone(center).addOffset(Vector.multiply(offsetW, -1)).addOffset(offsetD)

      return [p1, p2, p3, p4]
    },

    getLines (pts) {
      // 内部两条线
      const p1 = Point.paramPoint(pts[0], pts[1], 1 / 3)
      const p2 = Point.paramPoint(pts[0], pts[1], 2 / 3)
      const p3 = Point.paramPoint(pts[3], pts[2], 1 / 3)
      const p4 = Point.paramPoint(pts[3], pts[2], 2 / 3)

      this.start = Point.paramPoint(pts[0], pts[1], 1 / 2)
      this.end = Point.paramPoint(pts[3], pts[2], 1 / 2)

      const line1 = {
        index: 0,
        x1: p1.x,
        y1: p1.y,
        x2: p3.x,
        y2: p3.y
      }
      const line2 = {
        index: 1,
        x1: p2.x,
        y1: p2.y,
        x2: p4.x,
        y2: p4.y
      }

      this.lines = [line1, line2]
    },

    onClick () {
      if (DataStore.activeCmd) return
      DataStore.addSelected(this.model)
    },

    onMoveSeg (start, end) {
      if (!DataStore.activeCmd) {
        event.stopPropagation()
      }
    },

    onMove () {
      if (!DataStore.activeCmd) {
        event.stopPropagation()
        DataStore.addSelected(this.model)
      }
    }
  }
}
</script>

<style scoped>
  .window polygon.bbox {
    fill: #ffffff;
    stroke: #000000;
  }
  .window line {
    stroke: #808080;
  }
  .window.active polygon.bbox {
    fill: #D2E6F5;
    stroke-width: 4px;
    stroke: #4B96FF;
  }
</style>
