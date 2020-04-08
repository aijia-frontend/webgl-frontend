<template>
  <g class="container">
    <!-- <walls></walls> -->
    <wall v-for="wall in walls" :key="wall.uid" :model="wall"></wall>
    <joint v-for="joint in joints" :key="joint.uid" :model="joint"></joint>
  </g>
</template>

<script>
import walls from './walls'
import wall from './wall'
import joint from './joint'
import DataStore from '../models/dataStore'
export default {
  name: 'Container',
  components: {
    walls,
    wall,
    joint
  },
  data () {
    return {
      walls: [],
      joints: []
    }
  },
  created () {
    this.walls = DataStore.walls
    this.joints = DataStore.joints
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
