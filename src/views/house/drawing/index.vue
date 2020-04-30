<template>
  <div id="page">
    <div id="canvas">
      <drawing></drawing>
    </div>
    <div id="left">
      <leftTools style="z-index:99"></leftTools>
    </div>
    <div id="footer">
      <span :class="{ hide: !posChange }">
        position(x: {{ point.x }}, y: {{ point.y }})
      </span>
    </div>
    <div
      class="dimension"
      :style="{top: top, left: left, width: '100px'}"
      v-show="inputVisible"
      @click.right.prevent=";">
      <a-input
        ref="inputNumber"
        v-model="length"
        :autoFocus="true"
        :disabled="true"
        type="number"
        suffix="mm"
        size="small"
        @pressEnter="onPressEnter"
        @blur="onPressEnter"
      />
    </div>
  </div>
</template>

<script>
import drawing from '../components/drawing'
import leftTools from '../components/leftTools'
import '../cmd/main'
import '../models/main'

export default {
  name: 'Drawing',
  data () {
    return {
      inputVisible: false,
      top: '0px',
      left: '0px',
      length: 0,
      point: {
        x: 0,
        y: 0
      },
      posChange: false
    }
  },
  components: {
    drawing,
    leftTools
  },
  mounted () {
    this.$bus.$on('dimension', this.onDimension)
    this.$bus.$on('cancel', this.cmdEnd)
    this.$bus.$on('end', this.cmdEnd)
    this.$bus.$on('posContent', this.posContent)
  },
  methods: {
    onDimension (data) {
      this.top = (data.pos.y - 64 - 12) + 'px'
      this.left = (data.pos.x - 0 - 50) + 'px'
      this.length = data.length
      this.inputVisible = data.length >= data.wallWeight
    },
    onPressEnter () {
      this.inputVisible = false
    },
    cmdEnd () {
      this.inputVisible = false
    },
    posContent (v) {
      this.posChange = !!v
      if (v) {
        this.point = v
      }
    }
  }
}
</script>

<style>
  #page {
      position: absolute;
      top: 64px;
      bottom: 0;
      left: 0;
      right: 0;
      overflow: hidden;
  }
  #left {
    position: absolute;
    top: 0px;
    left: 0px;
    height: calc(100% - 30px);
    pointer-events: none;
  }
  #footer {
    position: absolute;
    bottom: 0px;
    width: 100%;
    height: 30px;
    background-color: #ffffff;
    border: 1px solid #D3D3D3;
  }
  #canvas {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }
  .dimension {
    position: absolute !important;
  }
  .hide {
    display: none;
  }
</style>
