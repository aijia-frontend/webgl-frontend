<template>
  <rect id="bg-fill" :x="x" :y="y" :width="width" :height="height"></rect>
</template>

<script>
import DataStore from '../models/dataStore'
import CST from '@/common/cst/index'
export default {
  name: 'BgFill',

  data () {
    return {
      width: 0,
      height: 0
    }
  },

  computed: {
    x () {
      return -this.width * 0.5
    },
    y () {
      return -this.height * 0.5
    }
  },

  mounted () {
    this.init()
  },

  methods: {
    init () {
      this.attrs = DataStore.frame
      this.width = CST.mm.toPhysical(this.attrs.width)
      this.height = CST.mm.toPhysical(this.attrs.height)

      this.grids(5) // grids 5(mm)
      this.grids(20) // grids 20(mm)
      this.grids(50) // grids 50(mm)
    },

    grids (val) {
      //
    }
  }
}
</script>
<style scoped>
  #bg-fill {
    fill: none;
    stroke: red
  }
</style>
