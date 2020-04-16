<template>
  <g class="wall" :class="{ active: isActive }" :id="model.uid" :hidden="hidden">
    <polygon
      :points="pointsStr"
      @mousedown.left="onMove"></polygon>
    <use :x="start.x" :y="start.y" xlink:href="#wall-end" @mousedown="onMoveSeg(end, start)"></use>
    <use :x="end.x" :y="end.y" xlink:href="#wall-end" @mousedown="onMoveSeg(start, end)"></use>
  </g>
</template>

<script>
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'

export default {
  name: 'Wall',
  data () {
    return {
      pointsStr: '',
      isActive: false,
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
        const options = {
          tag: 'point',
          origin: DataStore.origin
        }
        this.pointsStr = this.model.pointsStr()
        this.isActive = this.model.attrs.isActive
        this.start = CST.toPhysical(this.model.start(), options)
        this.end = CST.toPhysical(this.model.end(), options)
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    // this.wall.$view = this
  },
  methods: {
    onClick () {
      if (DataStore.activeCmd) return
      DataStore.addSelected(this.model)
    },

    onMoveSeg (start, end) {
      if (!DataStore.activeCmd) {
        event.stopPropagation()
        this.$bus.$emit('moveWallSeg', {
          drawing: DataStore.drawing,
          canvas: DataStore.drawing.$el,
          start,
          end,
          wall: this.model
        })
      }
    },

    onMove () {
      if (!DataStore.activeCmd) {
        event.stopPropagation()
        DataStore.addSelected(this.model)
        console.log('mouseDown wall:===>cmd:move wall')
        this.$bus.$emit('moveWall', {
          drawing: DataStore.drawing,
          canvas: DataStore.drawing.$el,
          activeEnt: this.model,
          startPos: DataStore.drawing.posInContent({
            x: event.pageX,
            y: event.pageY
          })
        })
      }
    }
  }
}
</script>
