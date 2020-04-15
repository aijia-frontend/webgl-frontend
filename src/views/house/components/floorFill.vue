<template>
  <pattern
    id="floor"
    x="0"
    y="0"
    patternUnits="userSpaceOnUse"
    :width="width"
    :height="height">
    <image
      x="0"
      y="0"
      :width="width"
      :height="height"
      href="../../../assets/floorImages/floor1.jpg"></image>
  </pattern>
</template>

<script>
import CST from '@/common/cst/main'

const size = {
  width: 530,
  height: 530
}

export default {
  name: 'FloorFill',
  data () {
    return {
      width: 0,
      height: 0
    }
  },
  mounted () {
    const pxPerMM = CST.mm.toPhysical(1)
    this.width = size.width * pxPerMM * 2
    this.height = size.height * pxPerMM * 2
  }
}
</script>
