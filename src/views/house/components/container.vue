<template>
  <g class="container">
    <walls></walls>
    <!-- <wall v-for="line in lines" :key="line.attrs.id" :attrs="line.attrs"></wall> -->
  </g>
</template>

<script>
import walls from './walls'
export default {
  name: 'Container',
  components: {
    walls
  },
  // props: ['lines'],
  data () {
    return {
    }
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
