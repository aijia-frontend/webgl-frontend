<template>
  <g class="container">
    <!-- <walls></walls> -->
    <wall v-for="wall in walls" :key="wall.uid" :wall="wall"></wall>
  </g>
</template>

<script>
import walls from './walls'
import wall from './wall'
import DataStore from '../models/dataStore'
export default {
  name: 'Container',
  components: {
    walls,
    wall
  },
  data () {
    return {
      walls: []
    }
  },
  created () {
    this.walls = DataStore.walls
  },
  methods: {
    addEntity (node) {
      if (Array.isArray(node)) {
        node.forEach(t => this.addEntity(t))
      }
      this.$el.appendChild(node)
    }
  }
}
</script>

<style scoped>

</style>
