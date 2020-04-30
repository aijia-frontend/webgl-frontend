import BaseHandler from './baseHandler'
// import { Line } from '@/common/geometry'
import _last from 'lodash/last'
import _findIndex from 'lodash/findIndex'

const entCollAdd = (coll, item, escape) => {
  if (Array.isArray(item)) {
    item.forEach(i => entCollAdd(coll, i))
  } else {
    if (escape.uid === item.uid) return
    const index = _findIndex(coll, ent => ent.uid === item.uid)
    if (index > -1) {
      coll.push(item)
    }
  }
}

const AreaHandler = BaseHandler.extend({
  initialize () {
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  getChains (walls) {
    this.chains = []
    const chain = {
    }
    walls.forEach(wall => {
      // const pts = wall.points()
      // const line1 = new Line(pts[1], pts[2])
      // const line2 = new Line(pts[4], pts[5])
      chain.walls = [wall]

      // 标记一条边为起始计算边
      this.getChain(chain)
    }, this)
  },

  getChain (chain) {
    const wall = _last(chain.walls)
    const joints = wall.joints()
    const refWalls = []
    joints.forEach(joint => {
      const walls = joint.walls()
      entCollAdd(refWalls, walls, wall)
    })
    if (refWalls.length < 2) {
      // 该链上的最后一个墙体不可能生成区域
    } else {
      // 选择wall的一条边
      // 查找与wall相连的一面墙

      // if ()
      // 如果查到的墙是第一堵墙 则该链为封闭链 否则继续
    }
  },

  /*
   *@Date: 2020-04-30
   *@Description: 查找相连的墙
   *@Author: helloc
   *@Params: 起始端
   *
   *============== 步骤 ==============
   * 1. 如果另一端 没有joint， 则从另一边向后查找
   * 2. 不能查已经计入相连的墙
  */
  findConnectWall (wall, refWalls) {

  },

  createJoints () {},

  updateJoints () {},

  destroyJoints () {},

  run (walls) {
    // this.getChains(walls)
    // new Chains
    // update Chains
    // destroy Chains
  }
})

export default AreaHandler
