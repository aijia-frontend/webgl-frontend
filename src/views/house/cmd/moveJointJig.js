import MoveJig from './moveJig'
import PreviewBuilder from './previewBuilder'
import { Point } from '@/common/geometry'
import SvgRenderer from '@/common/renderTools'
import CST from '@/common/cst/main'
import Vector from '@/common/vector'
// import _uniq from 'lodash/uniq'
import _cloneDeep from 'lodash/cloneDeep'
import { getPointsStr, pointAdd, pointRotate, changeStart, merge2Walls } from '@/common/util/pointUtil'

const addToCollByPond = (pond, coll, ent) => {
  if (Array.isArray(ent)) {
    ent.forEach(item => addToCollByPond(pond, coll, item))
  } else {
    const _ent = pond.find(item => item.uid === ent.uid)
    if (!_ent) {
      pond.push(ent)
      coll.push(ent)
    }
  }
}

const getRefEntsMap = (joint) => {
  /* 当前节点
    不控制数量
  */
  const refEntsMap = []
  const originWalls = joint.walls()
  const refsWalls = []
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
      addToCollByPond(refsWalls, refs, joints[0].walls().filter(item => item.uid !== wall.uid))
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
    this.refEntsMap = getRefEntsMap(this.activeEnt)
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
        if (Point.equal(ref.ent.end(), points[3])) {
          refPoints = changeStart(refPoints)
        }
        index += 1
        ref.originPoints = refPoints.map(this.point2Physical)
        ref.index = index
        return ref
      })
      item.origin.originPoints = points.map(this.point2Physical)
    })
  },

  prepare () {
    // 添加关联图形
    let type = ''
    let tryout = null
    this.refEnts.forEach(ent => {
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
    if (this.refEntsMap.length === 2) {
      const points0 = this.wallSeg(this.refEntsMap[0].origin, pos)
      const points1 = changeStart(this.wallSeg(this.refEntsMap[1].origin, pos))
      const intersInfo = merge2Walls(points1, points0)
      points1[2] = points0[1] = intersInfo.inter1.point
      points1[4] = points0[5] = intersInfo.inter2.point

      this.refEntsMap[1].origin.points = changeStart(points1)
      this.refEntsMap[0].origin.points = points0
    }
    this.updateRefWalls()
  },

  updateRefWalls () {
    this.refEntsMap.forEach(item => {
      const points0 = item.origin.points
      item.refs.forEach(ref => {
        const points1 = ref.originPoints
        const intersInfo = merge2Walls(points0, points1)
        points0[2] = points1[1] = intersInfo.inter1.point
        points0[4] = points1[5] = intersInfo.inter2.point
        ref.points = points1
        item.origin.points = points0

        SvgRenderer.attr(this.walls[ref.index], { points: getPointsStr(ref.points) })
      })
      SvgRenderer.attr(this.walls[item.origin.index], { points: getPointsStr(item.origin.points) })
    })
  },

  onMouseMove (e) {
    MoveJig.prototype.onMouseMove.apply(this, arguments)
    if (!this.startPos) return
    const pos = this.getPos(e)
    this.update(pos)
  },

  onMouseUp (e) {
    if (this.endPos) {
      const dis = Point.distance(this.startPos, this.endPos)
      if (dis >= 20) {
        const refs = []
        this.refEntsMap.forEach(item => {
          refs.push(item.origin, ...item.refs)
        })
        this.data = [{
          ent: this.activeEnt,
          position: this.endPos
        }, ...refs]
        this.end()
      } else this.cancel()
    } else this.cancel()
  }

})

export default MoveJointJig
