<template>
  <div class="leftTools">
    <a-button type="primary" @click="toggleCollapsed" style="margin-bottom: 16px">
      <a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'" />
    </a-button>
    <a-menu
      :defaultSelectedKeys="['sub1']"
      :defaultOpenKeys="['']"
      mode="inline"
      theme="dark"
      :inlineCollapsed="collapsed">
      <a-sub-menu key="sub1">
        <span slot="title"><a-icon type="bank" /><span>户型</span></span>
        <a-menu-item key="wall0" @click="cmdStart('drawWall', 0)">画墙</a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub2">
        <span slot="title"><a-icon type="pie-chart" /><span>门窗</span></span>
        <a-menu-item key="door0" @click="cmdStart('addDoor', 0)">门</a-menu-item>
        <a-menu-item key="window0" @click="cmdStart('addWindow', 0)">窗</a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub3">
        <span slot="title"><a-icon type="desktop" /><span>结构</span></span>
        <a-menu-item key="fabric0" @click="cmdStart('drawFabric', 0)">烟道</a-menu-item>
      </a-sub-menu>
      <a-menu-item key="3">
        <a-icon type="inbox" />
        <span>Option 3</span>
      </a-menu-item>
      <a-sub-menu key="sub4">
        <span slot="title"><a-icon type="appstore" /><span>Navigation Two</span></span>
        <a-menu-item key="9">Option 9</a-menu-item>
        <a-menu-item key="10">Option 10</a-menu-item>
        <a-sub-menu key="sub3" title="Submenu">
          <a-menu-item key="11">Option 11</a-menu-item>
          <a-menu-item key="12">Option 12</a-menu-item>
        </a-sub-menu>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script>
import DataStore from '../models/dataStore'
export default {
  data () {
    return {
      collapsed: true
    }
  },
  methods: {
    toggleCollapsed () {
      this.collapsed = !this.collapsed
    },
    cmdStart (cmd, type) {
      // this.$bus.$on('start:' + cmd, this.buttonEnable.bind(this))
      // this.$bus.$on('end:' + cmd, this.cmdState.bind(this))
      // this.$bus.$on('cancel:' + cmd, this.cmdState.bind(this))

      // this.$bus.$emit('execute', cmd)
      this.$bus.$emit(cmd, {
        // app: this.app,
        canvas: document.getElementById('svg'),
        drawing: DataStore.drawing
      }, {
        type,
        position: DataStore.drawing.posInContent({
          x: event.pageX,
          y: event.pageY
        })
      })
    }
  }
}
</script>
<style scoped>
  .leftTools {
    pointer-events: auto;
  }
</style>
