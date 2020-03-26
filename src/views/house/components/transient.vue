<template>
  <g class="transient">
    <!--<wall></wall>-->
  </g>
</template>

<script>
// import wall from './wall'
export default {
  name: 'Trainsent',
  props: {},
  components: {
    // wall
  },
  data () {
    return {}
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

<style lang="less" scoped>
  g.transient {
    polygon.wall {
      fill: #F5F5DC !important;
    }
  }
</style>
