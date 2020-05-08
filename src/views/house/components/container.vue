<template>
  <g class="container">
    <!-- <walls></walls> -->
    <areaComp v-for="area in areas" :key="area.uid" :model="area"></areaComp>
    <wall v-for="wall in walls" :key="wall.uid" :model="wall"></wall>
    <joint v-for="joint in joints" :key="joint.uid" :model="joint"></joint>
    <areaInfo v-for="area in areas" :key="area.uid + 'info'" :model="area" :tf="tf"></areaInfo>
  </g>
</template>

<script>
import walls from './walls'
import wall from './wall'
import joint from './joint'
import areaComp from './area'
import areaInfo from './areaInfo'
import DataStore from '../models/dataStore'
export default {
  name: 'Container',
  components: {
    walls,
    wall,
    joint,
    areaComp,
    areaInfo
  },
  data () {
    return {
      walls: [],
      joints: [],
      areas: []
    }
  },
  props: {
    tf: {
      type: Object,
      required: true
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
