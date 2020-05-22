import BaseHandler from './baseHandler'
import { Point, PolyLine } from '@/common/geometry'
import { isInPolygon } from '@/common/util/gTools'
import _last from 'lodash/last'
import _first from 'lodash/first'
import _findIndex from 'lodash/findIndex'

const entCollAdd = (coll, item, escape) => {
  if (Array.isArray(item)) {
    item.forEach(i => entCollAdd(coll, i, escape))
  } else {
    if (escape.uid === item.uid) return
    const index = _findIndex(coll, ent => ent.uid === item.uid)
    if (index === -1) {
      coll.push(item)
    }
  }
}

/* 获取与当前墙体链接在同一个joint上的墙 */
const getRefWalls = (wall) => {
  const refWalls = []
  const joints = wall.joints()
  joints.forEach(joint => {
    const walls = joint.walls()
    entCollAdd(refWalls, walls, wall)
  })
  return refWalls
}

/*
 *@Date: 2020-05-07
 *@Description: 获取与当前墙体相连的墙
 *@Author: helloc
*/
const getConnectWallInfo = (currentInfo, chain, refWalls) => {
  let param1, params
  /* 若只有一个joint 则直接返回另一边 */
  if (currentInfo.wall.joints().length === 1 && !currentInfo.isSelf) {
    const param = currentInfo.param
    if (param === 1) params = [2, 4]
    else if (param === 2) params = [1, 5]
    else if (param === 4) params = [5, 1]
    else params = [4, 2]
    chain.push({
      wall: currentInfo.wall,
      param: params[0]
    })
    return {
      wall: currentInfo.wall,
      param: params[1],
      isSelf: true
    }
  }
  const ratio = (currentInfo.param === 2 || currentInfo.param === 5) ? -1 : 1
  const pts0 = currentInfo.wall.points()
  const point = pts0[currentInfo.param + ratio]
  const lastConnect = chain[chain.length - 2]
  params = [1, 2, 4, 5]
  let pts1
  const next = refWalls.find(ref => {
    if (lastConnect && lastConnect.uid === ref.uid) return false
    pts1 = ref.points()
    param1 = params.find(item => Point.equal(point, pts1[item]))
    return param1
  })
  if (!next) return null
  return {
    wall: next,
    param: param1
  }
}

/* 获取闭环的所有点 */
const getPoints = (chain) => {
  const points = []
  chain.forEach(item => {
    points.push(getPoint(item))
  })
  return points
}

const getPoint = (chainItem) => {
  return chainItem.wall.points()[chainItem.param]
}

const AreaHandler = BaseHandler.extend({
  initialize () {
    this.destroyEnts = []
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  getChains (walls) {
    this.chains = []
    walls.forEach(wall => {
      const chain1 = [{
        wall,
        param: 1
      }]

      const chain2 = [{
        wall,
        param: 4
      }]
      // 标记一条边为起始计算边
      this.getChain(chain1)
      this.getChain(chain2)
    }, this)
  },

  getChain (chain) {
    const wallInfo0 = _last(chain)
    const refWalls = getRefWalls(wallInfo0.wall)
    if (refWalls.length >= 1) { // 存在区域内中的墙 只有一个相关墙体
      // 该链上的最后一个墙体关联墙体小于1个 不可能生成区域
      // 查找与wall相连的一面墙
      const wallInfo = getConnectWallInfo(wallInfo0, chain, refWalls)
      if (wallInfo) {
        // 首尾两点不重合
        if (/* wallInfo.isSelf ||  */ !Point.equal(getPoint(wallInfo), getPoint(_first(chain))) /* wallInfo.wall.uid !== _first(chain).wall.uid */) { // 继续查
          chain.push(wallInfo)
          this.getChain(chain)
        } else { // 闭环
          // 获取闭合区域
          // 不能有墙上的其他点在闭环区域内
          if (this.areaTest(chain) && chain.length > 2) this.areaAdd(chain)
        }
      }
    }
  },

  /* 过滤重复的区域 */
  areaAdd (chain) {
    // 是否与已存在区域有重合
    const points1 = getPoints(chain)
    const pl1 = new PolyLine(points1)
    let points2, pl2
    this.dataStore.areas.find(area => {
      points2 = area.points()
      pl2 = new PolyLine(points2)
      if (PolyLine.hasOverlap(pl1, pl2)) {
        this.destroyEnts.push(area)
      }
    })
    // 是否与正在添加的区域有重合 没有时添加
    const overlap = this.chains.find(chain => {
      points2 = getPoints(chain)
      pl2 = new PolyLine(points2)
      return PolyLine.hasOverlap(pl1, pl2)
    })
    if (!overlap) this.chains.push(chain)
  },

  /* 测试该区域是否为最适合的区域 */
  areaTest (chain) {
    const points = getPoints(chain)
    // 取任意墙上一中点
    const center = Point.paramPoint(chain[0].wall.start(), chain[0].wall.end(), 0.5)
    return isInPolygon(center, points) === 'out'
  },

  createAreas () {
    let walls, points
    this.chains.forEach(chain => {
      points = getPoints(chain)
      walls = chain.map(item => item.wall.uid)
      this.dataStore.create({
        type: 'area',
        data: {
          walls,
          points
        }
      })
    })
  },

  updateAreas () {},

  destroyAreas () {
    this.destroyEnts.forEach(item => !item._isDestroyed && item.destroy())
  },

  run (walls) {
    console.time('计算闭环')
    console.log('参与计算的墙体：', walls)
    this.getChains(walls)
    console.timeEnd('计算闭环')
    console.log('闭环：', this.chains)
    // new Chains
    this.createAreas()
    // update Chains
    // destroy Chains
    this.destroyAreas()
  }
})

export default AreaHandler
