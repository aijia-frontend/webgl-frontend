<template>
  <g class="container">
    <areaComp v-for="area in areas" :key="area.uid" :model="area"></areaComp>
    <wall v-for="wall in walls" :key="wall.uid" :model="wall"></wall>
    <joint v-for="joint in joints" :key="joint.uid" :model="joint"></joint>
    <window v-for="window in windows" :key="window.uid" :model="window"></window>
    <areaInfo v-for="area in areas" :key="area.uid + 'info'" :model="area" :tf="tf"></areaInfo>
  </g>
</template>

<script>
import wall from './wall'
import joint from './joint'
import areaComp from './area'
import areaInfo from './areaInfo'
import window from './window'
import DataStore from '../models/dataStore'
export default {
  name: 'Container',
  components: {
    wall,
    joint,
    areaComp,
    areaInfo,
    window
  },
  data () {
    return {
      walls: [],
      joints: [],
      areas: [],
      windows: []
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
    this.windows = DataStore.windows
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
