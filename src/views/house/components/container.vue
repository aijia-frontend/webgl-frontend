<template>
  <g class="container">
    <!-- <walls></walls> -->
    <areaComp v-for="area in areas" :key="area.uid" :model="area"></areaComp>
    <wall v-for="wall in walls" :key="wall.uid" :model="wall"></wall>
    <joint v-for="joint in joints" :key="joint.uid" :model="joint"></joint>
  </g>
</template>

<script>
import walls from './walls'
import wall from './wall'
import joint from './joint'
import areaComp from './area'
import DataStore from '../models/dataStore'
export default {
  name: 'Container',
  components: {
    walls,
    wall,
    joint,
    areaComp
  },
  data () {
    return {
      walls: [],
      joints: [],
      areas: []
    }
  },
  created () {
    this.walls = DataStore.walls
    this.joints = DataStore.joints
    this.areas = DataStore.areas
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
