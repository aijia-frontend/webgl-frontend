<template>
  <pattern
    :id="id"
    :x="pattern.x"
    :y="pattern.y"
    :width="pattern.width"
    :height="pattern.height"
    patternUnits="userSpaceOnUse">
    <line
      v-for="item in size"
      :key="id + 'h' + item"
      x1="0"
      :x2="pattern.width"
      :y1="item * pattern.height / 5"
      :y2="item * pattern.height / 5"
      class="h"
      stroke="#ffffff"
      stroke-opacity="0.3"
      :stroke-width="1 / scale"/>
    <line
      v-for="item in size"
      :key="id + 'v' + item"
      y1="0"
      :y2="pattern.height"
      :x1="item * pattern.width / 5"
      :x2="item * pattern.width / 5"
      class="v"
      stroke="#ffffff"
      stroke-opacity="0.3"
      :stroke-width="1 / scale"/>
    <line
      x1="0"
      y1="0"
      :x2="pattern.width"
      y2="0"
      stroke="#ffffff"
      stroke-opacity="0.6"
      :stroke-width="2 / scale"/>
    <line
      x1="0"
      y1="0"
      x2="0"
      :y2="pattern.height"
      stroke="#ffffff"
      stroke-opacity="0.6"
      :stroke-width="2 / scale"/>
    <line />
  </pattern>
</template>

<script>
// const space = 500 // space = 20mm

export default {
  name: 'PatternGroup',
  data () {
    return {
      size: [1, 2, 3, 4]
    }
  },
  props: {
    id: {
      type: String,
      required: true
    },
    pattern: {
      type: Object,
      required: true,
      default () {
        return {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      }
    },
    scale: {
      type: Number,
      required: true,
      default: 1
    }
  }
}
</script>
