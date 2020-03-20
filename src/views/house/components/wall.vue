
<template>
  <g>
    <line :x1="x1" :y1="y1" :x2="x2" :y2="y2"></line>
    <circle @click="destroy" r="5" :cx="x1" :cy="y1"></circle>
    <circle @click="destroy" r="5" :cx="x2" :cy="y2"></circle>
  </g>
</template>

<script>
import DataStore from '../models/dataStore'
export default {
  name: 'wall',
  props: ['attrs'],
  data () {
    return {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0
    }
  },
  created () {
    console.log(this)
    this.render()
  },
  mounted () {},
  beforeDestroy () {},
  activated () {},
  methods: {
    render () {
      this.x1 = this.attrs.x1
      this.y1 = this.attrs.y1
      this.x2 = this.attrs.x2
      this.y2 = this.attrs.y2
    },
    destroy () {
      DataStore.destroy(this)
    }
  }
}
</script>
<style lang="less">
  line {
    stroke: #000;
    stroke-width: 1px;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }

  circle {
    fill: green;
    stroke: #000;
    cursor: pointer;
    stroke-width: 1px;
  }
</style>
