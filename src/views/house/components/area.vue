<template>
  <g class="area" :class="{ active: isActive }" :id="model.uid" :hidden="hidden" @click="onClick">
    <polygon class="content" :points="pointsStr"></polygon>
    <polygon class="hover" :points="pointsStr" v-show="isActive"></polygon>
    <text :x="textPos.x" :y="textPos.y">
      <tspan>{{ name }}</tspan>
      <tspan dx="-100%" dy="100%">{{ area }}</tspan>
    </text>
  </g>
</template>

<script>
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'

export default {
  name: 'AreaComp',
  data () {
    return {
      pointsStr: '',
      isActive: false,
      hidden: false,
      textPos: {
        x: 0,
        y: 0
      },
      area: '',
      name: ''
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
        this.textPos = CST.toPhysical(this.model.centerPos(), options)
        this.area = this.model.area()
        this.name = this.model.name()
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
    }
  }
}
</script>

<style scoped>
.area polygon.content {
  fill: url(#floor) !important;
  stroke-width: 0 !important;
}
.area polygon.hover {
  fill: #257ab9;
  stroke-width: 0 !important;
  fill-opacity: 0.5;
}
.area text {
  text-anchor: middle;
  fill: #202020;
  font-size: 600px;
  font-family: fantasy;
  text-shadow: rgb(243, 243, 243) -1.5px -1.5px 0px, rgb(243, 243, 243) -1.5px 1.5px 0px, rgb(243, 243, 243) 1.5px -1.5px 0px, rgb(243, 243, 243) 1.5px 1.5px 0px;
}
</style>
