<template>
  <g>
    <polygon
      class="wall"
      v-for="wall in walls"
      :key="wall.uid"
      :class="{ active: wall.isActive }"
      :points="wall.pointsStr()"
      @click="onClick"></polygon>
  </g>
</template>

<script>
import DataStore from '../models/dataStore'
export default {
  name: 'walls',
  components: {
  },
  data () {
    return {
      walls: [],
      isActive: false
    }
  },
  computed: {},
  created () {
    this.walls = DataStore.walls
  },
  mounted () {},
  methods: {
    onClick () {
      console.log('click wall:===>cmd:scoot wall')
    }
  }
}
</script>

<style scoped>

</style>
