<template>
  <div id="page">
    <div id="dpi"></div>
    <div id="canvas">
      <drawing :cursor="cursor"></drawing>
    </div>
    <leftTools style="z-index:99"></leftTools>
    <div id="footer"></div>
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
      cursor: 'cross',
      origin: {}
    }
  },
  components: {
    drawing,
    leftTools
  },
  mounted () {
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
  #left-tools {
    position: absolute;
    top: 0px;
    left: 0;
    width: 200px;
    height: calc(100% - 30px);
    background-color: #ffffff;
    border: 1px solid #D3D3D3
  }
  #footer {
    position: absolute;
    bottom: 0px;
    width: 100%;
    height: 30px;
    background-color: #ffffff;
    border: 1px solid #D3D3D3;
  }
  #dpi {
    position: absolute;
    top: -100%;
    left: -100%;
    width: 1in;
    height: 1in;
  }
  #canvas {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }
  #canvas svg[cursor="arrow"] {
    cursor: url(../../../assets/cursor/selectCursor.png) 10 7, auto;
  }

  #canvas svg[cursor="cross"] {
    cursor: url(../../../assets/cursor/crossCursor.png) 24 24, auto;
  }

  #canvas svg[cursor="pan"] {
    cursor: url(../../../assets/cursor/panCursor.png) 16 8, auto;
  }
  #canvas svg rect.bg-fill {
    stroke: #212830;
    fill: #000000;
  }
</style>
