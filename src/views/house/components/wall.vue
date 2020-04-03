<template>
  <g class="wall" :class="{ active: isActive }">
    <polygon
      :points="pointsStr"
      @click="onClick"></polygon>
    <use :x="start.x" :y="start.y" xlink:href="#wall-end"></use>
    <use :x="end.x" :y="end.y" xlink:href="#wall-end"></use>
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
      }
    }
  },
  props: {
    wall: {
      type: Object,
      required: true
    }
  },
  watch: {
    wall: {
      handler () {
        const options = {
          tag: 'point',
          origin: DataStore.origin
        }
        this.pointsStr = this.wall.pointsStr()
        this.isActive = this.wall.attrs.isActive
        this.start = CST.toPhysical(this.wall.start(), options)
        this.end = CST.toPhysical(this.wall.end(), options)
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    this.wall.$view = this
  },
  methods: {
    onClick () {
      console.log('click wall:===>cmd:scoot wall')
      DataStore.addSelected(this.wall)
    }
  }
}
</script>
