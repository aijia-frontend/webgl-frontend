<template>
  <g id="wall-end">
    <circle
      cx="0"
      cy="0"
      :r="radius"
      fill="#96969B"
      stroke="#FFD700"
      :stroke-width="radius * 0.5"></circle>
  </g>
</template>

<script>
import CST from '@/common/cst/main'
const radius = 30
export default {
  name: 'Grips',
  data () {
    return {
      radius: 0
    }
  },
  mounted () {
    const pxPreMM = CST.mm.toPhysical(1)
    this.radius = radius * pxPreMM
  }
}
</script>
