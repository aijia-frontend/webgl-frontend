<template>
  <g class="joint" :class="{ active: isActive }" :hidden="hidden">
    <circle :cx="position.x" :cy="position.y" :r="radius" @mousedown.left="onMove"></circle>
  </g>
</template>

<script>
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'

export default {
  name: 'Joint',
  data () {
    return {
      position: {
        x: 0,
        y: 0
      },
      radius: 0,
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
        const options = {
          tag: 'point',
          origin: DataStore.origin
        }
        this.position = CST.toPhysical(this.model.position(), options)
        this.radius = CST.mm.toPhysical(this.model.radius())
        this.isActive = this.model.attrs.isActive
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    // this.radius = CST.mm.toPhysical(40)
  },
  mounted () {
    // this.wall.$view = this
  },
  methods: {
    onMove () {
      if (!DataStore.activeCmd) {
        event.stopPropagation()
        DataStore.addSelected(this.model)
        console.log('mouseDown joint:===>cmd:move joint')
        this.$bus.$emit('moveJoint', {
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
