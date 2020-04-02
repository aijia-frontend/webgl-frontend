<template>
  <g>
    <polygon
      class="wall"
      :class="{ active: isActive }"
      :points="pointsStr"
      @click="onClick"></polygon>
  </g>
</template>

<script>
export default {
  name: 'Wall',
  data () {
    return {
      pointsStr: '',
      isActive: false
    }
  },
  props: {
    wall: {
      type: Object,
      required: true
    }
  },
  watch: {
    wall: {
      handler () {
        this.pointsStr = this.wall.pointsStr()
        this.isActive = this.wall.isActive
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    console.log(this)
  },
  methods: {
    onClick () {
      console.log('click wall:===>cmd:scoot wall')
    }
  }
}
</script>
