<template>
  <g
    class="window"
    :class="{ active: isActive }"
    :id="model.uid"
    :hidden="hidden"
    :transform="tf.toString()"
    @mousedown.left="onMove">
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
import matrix from '@/common/matrix'
import DataStore from '../models/dataStore'

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
        const points = this.model.getPointsAround().map(pt => this.toPhysical(pt))
        this.getLines(points)
        this.pointsStr = getPointsStr(points)
        const position = this.toPhysical(this.model.getPosition(), DataStore.origin)
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
    toPhysical (pt, origin) {
      return CST.toPhysical(pt, {
        tag: 'point',
        origin: origin
      })
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

    onMoveSeg (start, end) {
      if (!DataStore.activeCmd) {
        event.stopPropagation()
      }
    },

    onMove () {
      if (!DataStore.activeCmd) {
        event.stopPropagation()
        DataStore.addSelected(this.model)
        /* this.$bus.$emit('moveWall', {
          drawing: DataStore.drawing,
          canvas: DataStore.drawing.$el,
          activeEnt: this.model,
          startPos: this.toPhysical(this.model.getPosition())
        }) */
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
