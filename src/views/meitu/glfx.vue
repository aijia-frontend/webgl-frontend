<template>
  <a-layout id="components-layout-demo-top-side-2">
    <a-layout-header class="header">
      <!-- <div class="logo" /> -->
      <!-- <a-menu
        theme="dark"
        mode="horizontal"
        :defaultSelectedKeys="['2']"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item key="1">美化前</a-menu-item>
        <a-menu-item key="2">美化后</a-menu-item>
      </a-menu> -->
      <div>图像渲染器</div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="300" style="background: #fff">
        <a-menu
          mode="inline"
          :defaultSelectedKeys="['1']"
          :defaultOpenKeys="['sub1']"
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-sub-menu key="sub1">
            <span slot="title">手动调整</span>
          </a-sub-menu>
          <a-sub-menu key="sub2" class="basic-nav">
            <span slot="title">基础信息</span>
            <a-menu-item key="5">
              <div class="basic-navitem">
                <span>亮度</span>
                <a-slider
                  id="test"
                  :defaultValue="0"
                  :min="-100"
                  :max="100"
                  :step="1"
                  v-model="basic.bright"
                />
              </div>
            </a-menu-item>
            <a-menu-item key="6">
              <div class="basic-navitem">
                <span>对比度</span>
                <a-slider
                  id="test"
                  :defaultValue="0"
                  :min="0"
                  :max="200"
                  :step="1"
                  v-model="basic.unsharpMask"
                />
              </div>
            </a-menu-item>
            <a-menu-item key="7">
              <div class="basic-navitem">
                <span>色相</span>
                <a-slider
                  id="test"
                  :defaultValue="0"
                  :min="-100"
                  :max="100"
                  v-model="basic.hue"
                />
              </div>
            </a-menu-item>
            <a-menu-item key="8">
              <div class="basic-navitem">
                <span>饱和度</span>
                <a-slider
                  id="test"
                  :defaultValue="0"
                  :min="-100"
                  :max="100"
                  v-model="basic.saturation"
                />
              </div>
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub3">
            <span slot="title">比例</span>
            <a-menu-item key="9" class="radio-navitem">
              <a-button type="primary" @click="changeRadio(16,9)">16:9</a-button>
              <a-button type="primary" @click="changeRadio(4,3)">4:3</a-button>
              <a-button type="primary" @click="changeRadio(3,4)">3:4</a-button>
              <a-button type="primary" @click="changeRadio(1,1)">1:1</a-button>
              <a-button type="primary" @click="changeRadio(5,6)">5:6</a-button>
              <button style=" visibility: hidden;"></button>
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub4">
            <span slot="title">蒙板</span>
            <a-menu-item key="9" class="mark-navitem">
              <ul>
                <li v-for="(item, index) in marks" :key="index" @click="changeFilter(item)">
                  <img :src="item.url" alt="" style="width:80px;height:50px;" />
                  <p>{{ item.name }}</p>
                </li>
              </ul>
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding:24px">
        <a-layout-content :style="{ background: '#000', padding: '24px', margin: 0, minHeight: '280px' }" id="beautify">
          <!-- <img
            :src="originalImg"
            alt=""
            class="beautify-img"
            id="image"
          /> -->
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script>
import fx from 'glfx'
import smartCrop from 'smartcrop'
export default {
  data () {
    return {
      collapsed: false,
      originalImg: require('../../assets/1.jpg'),
      beautifyImg: null,
      curBright: 0,
      cruUnsharpMask: 0,
      imageElm: null,
      canvasWidth: 0,
      canvasHeight: 0,
      marks: [
        {
          url:
            'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '白天自然',
          bright: 12,
          unsharpMask: 0,
          hue: 0,
          saturation: 55
        },
        {
          url:
            'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '白天曙光',
          bright: 25,
          unsharpMask: 0,
          hue: 0,
          saturation: 0
        },
        {
          url:
            'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '白天暖白',
          bright: 25,
          unsharpMask: 0,
          hue: 8,
          saturation: 70
        },
        {
          url:
            'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '白天清新',
          bright: 25,
          unsharpMask: 0,
          hue: -12,
          saturation: 6
        },
        {
          url:
            'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '白天自然2.0',
          bright: 10,
          unsharpMask: 0,
          hue: 8,
          saturation: 52
        },
        {
          url:
            'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '夜晚暖光',
          bright: -23,
          unsharpMask: 0,
          hue: 4,
          saturation: 70
        },
        {
          url:
            'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '夜晚暖白',
          bright: -23,
          unsharpMask: 0,
          hue: 4,
          saturation: 70
        },
        {
          url:
            'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '夜晚微冷',
          bright: -43,
          unsharpMask: 0,
          hue: 4,
          saturation: 91
        },
        {
          url:
            'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '夜晚灯光2.0',
          bright: 25,
          unsharpMask: 0,
          hue: 18,
          saturation: 70
        }
      ],
      basic: {
        bright: 0,
        unsharpMask: 0,
        hue: 0,
        saturation: 0
      }
    }
  },
  watch: {
    basic: {
      handler (val) {
        const { bright, unsharpMask, hue, saturation } = val
        this.canvas.draw(this.texture).brightnessContrast(bright / 100, 0).unsharpMask(unsharpMask, 2).hueSaturation(hue / 100, saturation / 100).update()
        this.beautifyImg = this.canvas.toDataURL('image/png', 1)
        // console.log(this.beautifyImg)
      },
      deep: true
    }
  },
  methods: {
    changeFilter ({ bright, unsharpMask, hue, saturation }) {
      this.basic.bright = bright
      this.basic.unsharpMask = unsharpMask
      this.basic.hue = hue
      this.basic.saturation = saturation
    },
    /**
     * @description 更换图片比例
     * @param { wRadio:Number } 图片宽度占比
     * @param { hRadio:Number } 图片高度占比
     */
    changeRadio (wRadio, hRadio) {
      const self = this
      const image = new Image()
      image.src = this.beautifyImg || this.originalImg
      image.className = 'beautify-img'
      image.onload = function () {
        document.querySelector('#beautify').append(image)
        smartCrop.crop(image, {
          width: wRadio,
          height: hRadio
        }, function (res) {
          const { x, y, width, height } = res.topCrop
          // 缩放比例
          const scaleRadio = Math.min(self.canvasWidth / width, self.canvasHeight / height)
          // 图片裁剪
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.height = height * scaleRadio
          canvas.width = width * scaleRadio
          ctx.drawImage(image, x, y, width, height, 0, 0, width * scaleRadio, height * scaleRadio)
          const texture = self.canvas.texture(canvas)
          self.canvas.draw(texture, width * scaleRadio, height * scaleRadio).update().replace(image)
        })
      }
    }
  },
  mounted () {
    const self = this
    const image = new Image()
    image.src = require('../../assets/1.jpg')
    image.className = 'beautify-img'
    image.onload = function () {
      document.querySelector('#beautify').append(image)
      self.imageElm = image
      self.canvas = fx.canvas()
      self.texture = self.canvas.texture(image)
      self.texture.loadContentsOf(image)
      self.canvas.draw(self.texture).update().replace(image)
      self.canvasWidth = self.canvas.width
      self.canvasHeight = self.canvas.height
    }
  }
}
</script>

<style lang="less">
.header {
  display: flex;
  justify-content: center;
  color: #fff;
  font-size: 25px;
  letter-spacing: 10px;
}
.beautify-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
#components-layout-demo-top-side-2 .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 28px 16px 0;
}
.ant-layout {
  height: 100%;
}
.basic-navitem {
  display: flex;
  flex-flow: row nowrap;
  span {
    min-width: 43px;
    text-align: right;
  }
  & > div {
    flex: 1;
  }
}
.radio-navitem {
  padding-left: 10px !important;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  height: 100px;
  min-height: 100px;
  & > button {
    margin: 0 5px;
    width: 70px;
  }
}
.mark-navitem {
  padding-left: 10px !important;
  min-height: 300px;
  &:hover {
    color: inherit;
  }
  ul {
    flex-flow: row wrap;
    justify-content: space-between;
    display: flex;
  }
  li {
    width: 80px;
    &:hover {
      color: #1890ff;
    }
  }
  p {
    font-size: 12px;
  }
}
.basic-nav {
  /deep/ .ant-menu .ant-menu-item {
    padding-left: 10px !important;
  }
}
</style>
