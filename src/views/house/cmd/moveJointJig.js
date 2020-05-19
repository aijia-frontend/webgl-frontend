import MoveJig from './moveJig'
import PreviewBuilder from './previewBuilder'
import { Point, Line } from '@/common/geometry'
import SvgRenderer from '@/common/renderTools'
import CST from '@/common/cst/main'
import Vector from '@/common/vector'
// import _uniq from 'lodash/uniq'
import _cloneDeep from 'lodash/cloneDeep'
import _sortBy from 'lodash/sortBy'
import { getPointsStr, pointAdd, pointRotate, changeStart, getIntersect } from '@/common/util/pointUtil'

const addToCollByPond = (pond, coll, ent) => {
  if (Array.isArray(ent)) {
    ent.forEach(item => addToCollByPond(pond, coll, item))
  } else {
    const _ent = pond.find(item => item.uid === ent.uid)
    if (_ent) { // 已在其他链上
      _ent.isPublic = true // 改变模型，在结束时要清掉！！
    } else pond.push(ent)
    coll.push(ent)
  }
}

const addToColl = (coll, ent) => {
  if (Array.isArray(ent)) {
    ent.forEach(item => addToColl(coll, item))
  } else {
    const _ent = coll.find(item => item.ent.uid === ent.ent.uid)
    if (!_ent) coll.push(ent)
  }
}

/*
  查找直接相关墙体
*/
const getRefEntsMap = (joint, refWalls = []) => {
  /* 当前节点
    不控制数量
  */
  const refEntsMap = []
  const originWalls = joint.walls()
  let chain = {}
  originWalls.forEach(wall => {
    chain = {
      origin: {
        ent: wall
      },
      refs: []
    }
    const joints = wall.joints().filter(item => item.uid !== joint.uid)
    const refs = []
    if (joints.length) {
      // refs
      addToCollByPond(refWalls, refs, joints[0].walls().filter(item => item.uid !== wall.uid))
    }
    chain.refs = refs.map(item => {
      return {
        ent: item
      }
    })
    refEntsMap.push(chain)
  })
  return refEntsMap
}

const MoveJointJig = MoveJig.extend({
  initialize (attrs, options) {
    MoveJig.prototype.initialize.apply(this, arguments)
  },

  start () {
    // 查找相关
    this.refEntsMap = getRefEntsMap(this.activeEnt, this.refWalls)
    this.refEnts = []
    this.refEntsMap.forEach(chain => {
      this.refEnts.push(chain.origin.ent, ...(chain.refs.map(item => item.ent)))
    })
    this.activeEnts = []
    this.activeEnts.push(...this.refEnts, this.activeEnt)
    this.initData()

    MoveJig.prototype.start.apply(this, arguments)
  },

  initData () {
    this.originPosition = this.activeEnt.position()
    // 在不同链上的 同一个墙
    this.publicEnts = []
    // chain
    let points, refPoints
    let index = -1
    this.refEntsMap.forEach(item => {
      points = item.origin.ent.points()
      if (Point.equal(item.origin.ent.end(), this.originPosition)) {
        points = changeStart(points)
      }
      index += 1
      item.origin.index = index
      item.refs = item.refs.map(ref => {
        refPoints = ref.ent.points()
        let changeS = false
        if (Point.equal(ref.ent.end(), points[3])) {
          changeS = true
          refPoints = changeStart(refPoints)
        }
        ref.startChange = changeS
        index += 1
        ref.originPoints = refPoints.map(this.point2Physical)
        ref.index = index
        ref.angle = Vector.angle(ref.originPoints[0], ref.originPoints[3])
        if (ref.ent.isPublic) {
          const publicEnt = this.publicEnts.find(item => item.ent.uid === ref.ent.uid)
          if (!publicEnt) {
            this.publicEnts.push({
              ent: ref.ent,
              originPoints: ref.originPoints,
              // points: _cloneDeep(ref.originPoints),
              index: index,
              startChange: changeS,
              use: false
            })
          } else {
            ref.index = publicEnt.index
            index--
          }
        }
        return ref
      }, this)
      // 按照角度排序
      item.refs = _sortBy(item.refs, ref => ref.angle)
      item.origin.originPoints = points.map(this.point2Physical)
      item.origin.angle = Vector.angle(item.origin.originPoints[0], item.origin.originPoints[3])
    }, this)
    // 按照角度排序
    this.refEntsMap = _sortBy(this.refEntsMap, chain => chain.origin.angle)
    console.log('refEntsMap:', this.refEntsMap)
    console.log('publicEnts:', this.publicEnts)
  },

  prepare () {
    // 添加关联图形
    let type = ''
    let tryout = null
    let publicInfo
    this.refEnts.forEach(ent => {
      publicInfo = this.publicEnts.find(item => item.ent.uid === ent.uid)
      if (publicInfo && publicInfo.hasRender) return
      if (publicInfo) publicInfo.hasRender = true
      if (ent.uid === this.activeEnt.uid) return
      type = ent.type + 's'
      if (!this[type]) this[type] = []
      tryout = PreviewBuilder.build(ent)
      this.drawing.addTransient(tryout)
      this[type].push(tryout)
    }, this)

    // 添加临时图形
    this.preview = {
      activeEnt: PreviewBuilder.build(this.activeEnt)
    }
    this.drawing.addTransient(this.preview.activeEnt)
  },

  cleanup () {
    this.publicEnts.forEach(item => delete item.ent.isPublic)
    MoveJig.prototype.cleanup.apply(this, arguments)
  },

  update (pos) {
    // updateJoint
    SvgRenderer.attr(this.preview.activeEnt, { cx: pos.x, cy: pos.y })
    this.endPos = pos
    // updateRefWalls
    this.updateOriginWalls(pos)
  },

  wallSeg (origin, pos) {
    let points = _cloneDeep(origin.originPoints)
    const wallWeight = origin.ent.weight()
    const startPos = pos
    const end = points[3]

    const angle = Vector.angle(startPos, end)
    const pxPerMM = CST.mm.toPhysical(1)
    const point = {
      x: startPos.x + wallWeight * pxPerMM * 0.5,
      y: startPos.y
    }
    const offset = {
      x: end.x - startPos.x,
      y: end.y - startPos.y
    }
    const p1 = pointRotate(point, startPos, angle + Math.PI / 2)
    const p2 = pointAdd(p1, offset)
    const p3 = pointRotate(point, startPos, angle - Math.PI / 2)
    const p4 = pointAdd(p3, offset)
    points = [startPos, p1, p2, end, p4, p3]

    return points
  },

  updateOriginWalls (pos) {
    // 模糊更新
    this.refEntsMap.forEach(chain => {
      chain.origin.points = this.wallSeg(chain.origin, pos)
      chain.origin.angle = Vector.angle(chain.origin.points[0], chain.origin.points[3])
    })
    const refEntsMap = _sortBy(this.refEntsMap, chain => chain.origin.angle)
    // joint位置 精确更新
    const length = refEntsMap.length
    let wallInfo1, wallInfo2
    refEntsMap.forEach((chain, index) => {
      wallInfo1 = chain.origin
      wallInfo2 = refEntsMap[(index + 1) % length].origin
      this.update2Walls(wallInfo1, wallInfo2)
    })
    // 更新相关墙体
    this.updateRefWalls()
  },

  // 相邻更新
  /* 按照邻边更新 */
  /* 逆转points0 */
  /* next 更新points0[1]、points1[5] */
  update2Walls (info1, info2) {
    let points0 = changeStart(info1.points)
    const points1 = info2.points
    const intersect = getIntersect([points0[4], points0[5]], [points1[4], points1[5]])
    points0[4] = points1[5] = intersect ? intersect.point : points0[4]
    points0 = changeStart(points0)

    SvgRenderer.attr(this.walls[info1.index], { points: getPointsStr(info1.points) })
    SvgRenderer.attr(this.walls[info2.index], { points: getPointsStr(info2.points) })
  },

  updateRefWalls () {
    let length, wallInfo2
    this.refEntsMap.forEach(chain => {
      if (!chain.refs || !chain.refs.length) return
      chain.origin.points = changeStart(chain.origin.points)
      chain.origin.angle = Vector.angle(chain.origin.points[0], chain.origin.points[3])
      let points
      chain.refs.forEach(ref => {
        if (ref.ent.isPublic) {
          // 从公共对象上取 更新过的points
          const publicInfo = this.publicEnts.find(item => item.ent.uid === ref.ent.uid)
          if (!publicInfo.use) {
            points = _cloneDeep(publicInfo.originPoints)
            publicInfo.use = true
          } else {
            points = publicInfo.points
            publicInfo.use = false
          }
          // 如果顺序不一致 则转换
          if (publicInfo.startChange !== ref.startChange) points = changeStart(points)
        } else points = _cloneDeep(ref.originPoints)
        ref.points = points
      }, this)
      // 包含origin在内的 一组 墙体
      let coll = []
      coll.push(...chain.refs, chain.origin)
      coll = _sortBy(coll, item => item.angle)
      length = coll.length
      coll.forEach((item, index) => {
        wallInfo2 = coll[(index + 1) % length]
        this.update2Walls(item, wallInfo2)

        this.publicHandler(item)
        this.publicHandler(wallInfo2)
      }, this)
      chain.origin.points = changeStart(chain.origin.points)
    }, this)
  },

  // 处理公共墙体
  publicHandler (info) {
    if (info.ent.isPublic) {
      // 合并已经处理的数据
      // 每次更新只更新公共对象上对应的两个点 在 points上
      const publicInfo = this.publicEnts.find(pub => pub.ent.uid === info.ent.uid)
      let points = _cloneDeep(info.points)
      if (publicInfo.startChange !== info.startChange) points = changeStart(points)
      publicInfo.points = points
    }
  },

  onMouseMove (e) {
    MoveJig.prototype.onMouseMove.apply(this, arguments)
    if (!this.startPos) return
    const pos = this.getPos(e)
    this.update(pos)
  },

  onMouseUp (e) {
    MoveJig.prototype.onMouseUp.apply(this, arguments)
    if (e.button === 2) return

    if (this.endPos) {
      const dis = Point.distance(this.startPos, this.endPos)
      if (dis >= 20) {
        const refs = []
        this.refEntsMap.forEach(item => {
          addToColl(refs, Object.assign({}, item.origin, { isOrigin: true }))
          addToColl(refs, item.refs)
        })
        this.data = [{
          ent: this.activeEnt,
          position: this.endPos
        }, ...refs]
        this.end()
      } else this.cancel()
    } else this.cancel()
  },

  getPos (e) {
    let pos = MoveJig.prototype.getPos.apply(this, arguments)
    if (this.attachWall) {
      const origin = this.attachWall.originPoints().map(this.point2Physical)
      const line = new Line(origin[0], origin[1])
      pos = line.nearestPoint(pos)
    }
    return pos
  }
})

export default MoveJointJig
