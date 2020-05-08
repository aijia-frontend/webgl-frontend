<template>
  <g class="area" :class="{ active: isActive }" :id="model.uid" :hidden="hidden" @click="onClick">
    <polygon class="content" :points="pointsStr"></polygon>
    <polygon class="hover" :points="pointsStr" v-show="isActive"></polygon>
  </g>
</template>

<script>
import DataStore from '../models/dataStore'

export default {
  name: 'AreaComp',
  data () {
    return {
      pointsStr: '',
      isActive: false,
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
        this.pointsStr = this.model.pointsStr()
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
</style>
