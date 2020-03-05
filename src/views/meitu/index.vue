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
            <a-menu-item key="5" >
              <div class="basic-navitem">
                <span>亮度</span>
                <a-slider id="test" :defaultValue="30" />
              </div>
            </a-menu-item>
            <a-menu-item key="6">
              <div class="basic-navitem">
                <span>对比度</span>
                <a-slider id="test" :defaultValue="30" />
              </div>
            </a-menu-item>
            <a-menu-item key="7">
              <div class="basic-navitem">
                <span>色相</span>
                <a-slider id="test" :defaultValue="30" />
              </div>
            </a-menu-item>
            <a-menu-item key="8">
              <div class="basic-navitem">
                <span>饱和度</span>
                <a-slider id="test" :defaultValue="30" />
              </div>
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub3">
            <span slot="title">比例</span>
            <a-menu-item key="9" class="radio-navitem">
              <a-button type="primary">16:9</a-button>
              <a-button type="primary">4:3</a-button>
              <a-button type="primary">3:4</a-button>
              <a-button type="primary">1:1</a-button>
              <a-button type="primary">5:6</a-button>
              <button style=" visibility: hidden;"></button>
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub4">
            <span slot="title">蒙板</span>
            <a-menu-item key="9" class="mark-navitem">
              <ul>
                <li v-for="(item,index) in marks" :key="index">
                  <img :src="item.url" alt="" style="width:80px;height:50px;">
                  <p>{{ item.name }}</p>
                </li>
              </ul>
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding:24px">
        <a-layout-content
          :style="{ background: '#000', padding: '24px', margin: 0, minHeight: '280px' }"
        >
          <img src="https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original" alt="" class="beautify-img">
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  data () {
    return {
      collapsed: false,
      marks: [
        {
          url: 'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '白天自然'
        },
        {
          url: 'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '白天曙光'
        },
        {
          url: 'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '白天暖白'
        },
        {
          url: 'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '白天清新'
        },
        {
          url: 'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '白天自然2.0'
        },
        {
          url: 'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '夜晚暖光'
        },
        {
          url: 'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '夜晚暖白'
        },
        {
          url: 'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '夜晚微冷'
        },
        {
          url: 'https://img15.ihomefnt.com/2/GeneralFile/fae9312af490571ab13da443cb5c662b943af88946f74185358fb2820aefb789.jpg!original',
          name: '夜晚灯光2.0'
        }
      ]
    }
  }
}
</script>

<style lang="less">
.header{
  display: flex;
  justify-content: center;
  color: #fff;
  font-size: 25px;
  letter-spacing: 10px;
}
.beautify-img{
  width:100%;
  height:100%;
  object-fit:contain;
}
  #components-layout-demo-top-side-2 .logo {
    width: 120px;
    height: 31px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px 28px 16px 0;
  }
  .ant-layout{
    height: 100%;
  }
  .basic-navitem{
    display: flex;
    flex-flow: row nowrap;
    span{
      min-width: 43px;
      text-align: right;
    }
    &>div{
      flex: 1;
    }
  }
  .radio-navitem{
    padding-left: 10px!important;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    height:100px ;
    min-height: 100px;
    &>button{
      margin: 0 5px;
      width: 70px;
    }
  }
  .mark-navitem{
    padding-left: 10px!important;
    min-height: 300px;
    &:hover{
      color: inherit;
    }
    ul{
      flex-flow: row wrap;
      justify-content: space-between;
      display: flex;
    }
    li{
      width: 80px;
      &:hover{
        color: #1890ff;
      }
    }
    p{
      font-size: 12px;
    }
  }
  .basic-nav{
    /deep/ .ant-menu .ant-menu-item{
      padding-left: 10px!important;
    }

  }
</style>
