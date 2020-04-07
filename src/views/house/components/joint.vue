<template>
  <g class="joint" :class="{ active: isActive }">
    <circle :cx="position.x" :cy="position.y" :r="radius" @click="onClick"></circle>
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
      isActive: false
    }
  },
  props: {
    joint: {
      type: Object,
      required: true
    }
  },
  watch: {
    joint: {
      handler (newV, old) {
        const options = {
          tag: 'point',
          origin: DataStore.origin
        }
        this.position = CST.toPhysical(this.joint.position(), options)
        this.isActive = this.joint.attrs.isActive
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    this.radius = CST.mm.toPhysical(40)
  },
  mounted () {
    // this.wall.$view = this
  },
  methods: {
    onClick () {
      console.log('click wall:===>cmd:scoot wall')
      DataStore.addSelected(this.joint)
    }
  }
}
</script>
