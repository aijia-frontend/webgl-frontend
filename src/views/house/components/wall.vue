<template>
  <g class="wall" :class="{ active: isActive }" :id="model.uid" :hidden="hidden">
    <polygon
      :points="pointsStr"
      @click="onClick"></polygon>
    <use :x="start.x" :y="start.y" xlink:href="#wall-end" @click="onMoveSeg(end, start)"></use>
    <use :x="end.x" :y="end.y" xlink:href="#wall-end" @click="onMoveSeg(start, end)"></use>
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
      console.log('click wall:===>cmd:scoot wall')
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
    }
  }
}
</script>
