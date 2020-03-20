<template>
    <g class="container">
      <wall v-for="line in lines" :key="line.attrs.id" :attrs="line.attrs"></wall>
    </g>
</template>

<script>
import wall from './wall'
export default {
  name: 'container',
  components: {
    wall
  },
  props: ['lines'],
  data () {
    return {
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
