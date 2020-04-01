<template>
  <g class="container">
    <!-- <wall v-for="line in lines" :key="line.attrs.id" :attrs="line.attrs"></wall> -->
  </g>
</template>

<script>
// import wall from './wall'
export default {
  name: 'Container',
  components: {
    // wall
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
