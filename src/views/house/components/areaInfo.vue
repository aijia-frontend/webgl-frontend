<template>
  <g class="areaInfo" :id="model.uid + 'Info'" :hidden="hidden" @click="onClick">
    <!-- <circle :cx="textPos.x" :cy="textPos.y" :r="radius"></circle> -->
    <text :x="textPos.x" :y="textPos.y - 350">
      {{ name }}
    </text>
    <text :x="textPos.x" :y="textPos.y + 350">
      {{ area.toFixed(2) + 'm²' }}
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
      hidden: false,
      textPos: {
        x: 0,
        y: 0
      },
      area: '',
      name: '',
      radius: 0
    }
  },
  props: {
    model: {
      type: Object,
      required: true
    },
    tf: {
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
        this.textPos = CST.toPhysical(this.model.centerPos().center, options)
        this.area = this.model.area()
        this.name = this.model.name()
        this.radius = CST.mm.toPhysical(this.model.centerPos().radius)
        // this.hidden = this.tf.a <= 0.01 || this.area < 0.5
      },
      deep: true,
      immediate: true
    },
    tf: {
      handler () {
        // this.hidden = this.tf.a <= 0.01/*  || this.area < 0.5 */
      },
      immediate: true
    }
  },
  mounted () {
    // this.wall.$view = this
  },
  methods: {
    onClick () {
      DataStore.addSelected(this.model)
    }
  }
}
</script>

<style scoped>
.areaInfo text {
  text-anchor: middle;
  fill: #202020;
  font-size: 600px;
  font-family: fantasy;
  text-shadow: rgb(243, 243, 243) -1.5px -1.5px 0px, rgb(243, 243, 243) -1.5px 1.5px 0px, rgb(243, 243, 243) 1.5px -1.5px 0px, rgb(243, 243, 243) 1.5px 1.5px 0px;
}
</style>
