import MoveJig from './moveJig'
import SvgRenderer from '@/common/renderTools'
import Vector from '@/common/vector'
import { Point, Line } from '@/common/geometry'
import CST from '@/common/cst/main'
import { getPointsStr, pointAdd, pointRotate, changeStart, getIntersect } from '@/common/util/pointUtil'
import PreviewBuilder from './previewBuilder'
// import DataStore from '../models/dataStore'
import _cloneDeep from 'lodash/cloneDeep'
import _sortBy from 'lodash/sortBy'
import Snap from '../snap/main'
import Matrix from '@/common/matrix'

const line = {
  tag: 'polyline',
  attrs: {
    class: 'wallLine preview',
    points: ''
  }
}

const getRefEnts = (walls, ents, dataStore) => {
  const wallIds = walls.map(item => item.uid)
  ents.push(...dataStore.symbols().filter(item => item.attrs.wall && wallIds.includes(item.attrs.wall)))
}

const wallSegJig = MoveJig.extend({
  initialize (attrs, options) {
    MoveJig.prototype.initialize.apply(this, arguments)
    this.wall = attrs.wall
    this.wallWeight = this.wall.weight()
    if (this.attrs.start) {
      this.startPos = this.point2Physical(this.attrs.start)
    }
  },

  start () {
    // 查找相关内容
    this.activeEnts = [this.wall]
    const joints = this.wall.joints()
    this.refWalls = []
    if (joints.length) {
      this.joint = joints[0]
      const refWalls = joints[0].walls().filter(item => item.uid !== this.wall.uid)
      this.refWalls.push(...refWalls)

      this.activeEnts.push(...refWalls)
      this.initRefWallsData(joints[0])
    }

    /* 绑定墙体 */
    /* 注意
      由于param，wall的points要用原始的顺序, 所以更新过程中要确保不能改变墙体的原始点位顺序
     */
    this.refSymbols = []
    getRefEnts([this.wall], this.refSymbols, this.dataStore)
    this.activeEnts.push(...this.refSymbols)

    this.initSymbolsData()

    // 隐藏
    this.drawing.hide(this.activeEnts)
    MoveJig.prototype.start.apply(this, arguments)
  },

  /*
  {
    ent
    param: 在墙上的相对位置
  }
   */
  initSymbolsData () {
    let wall, originPoints, line, param
    this.refSymbols = this.refSymbols.map(item => {
      wall = item.getWall()
      originPoints = wall.originPoints()
      line = new Line(originPoints[0], originPoints[1])
      param = line.pointParam(item.getPosition())
      return {
        ent: item,
        param
      }
    })
  },

  initRefWallsData (joint) {
    const jointPos = joint.position()
    let points, isChange, originPoints, angle
    this.refWalls = this.refWalls.map(wall => {
      points = wall.points()
      isChange = false
      if (Point.equal(jointPos, points[3])) { // 需要颠倒起点终点
        points = changeStart(points)
        isChange = true
      }
      originPoints = points.map(this.point2Physical)
      angle = Vector.angle(originPoints[0], originPoints[3])

      return {
        ent: wall,
        originPoints,
        angle,
        isChange
      }
    })
    this.refWalls = _sortBy(this.refWalls, item => item.angle)
  },

  cleanup () {
    this.drawing.show(this.activeEnts)
    MoveJig.prototype.cleanup.apply(this, arguments)
  },

  prepare () {
    // 添加临时图形
    this.preview = {
      line: SvgRenderer.render(line)
    }
    this.preview[this.wall.uid] = PreviewBuilder.build(this.wall)
    this.drawing.addTransient(this.preview[this.wall.uid])
    this.drawing.addTransient(this.preview.line)
    // 添加关联图形
    let tryout = null
    this.refWalls.forEach(item => {
      tryout = PreviewBuilder.build(item.ent)
      this.preview[item.ent.uid] = tryout
      this.drawing.addTransient(tryout)
    })
    // symbols
    this.refSymbols.forEach(item => {
      tryout = PreviewBuilder.build(item.ent)
      this.preview[item.ent.uid] = tryout
      this.drawing.addTransient(tryout)
    })
  },

  update (pos) {
    SvgRenderer.attr(this.preview.line, { points: getPointsStr([this.startPos, pos]) })
    this.updateWall(pos)
  },

  updateWall (pos) {
    // 计算polygon points
    // angle
    const angle = Vector.angle(this.startPos, pos)
    const pxPerMM = CST.mm.toPhysical(1)
    const point = {
      x: this.startPos.x + this.wallWeight * pxPerMM * 0.5,
      y: this.startPos.y
    }
    const offset = {
      x: pos.x - this.startPos.x,
      y: pos.y - this.startPos.y
    }
    const p1 = pointRotate(point, this.startPos, angle + Math.PI / 2)
    const p2 = pointAdd(p1, offset)
    const p3 = pointRotate(point, this.startPos, angle - Math.PI / 2)
    const p4 = pointAdd(p3, offset)
    const points = [this.startPos, p1, p2, pos, p4, p3]
    this.points = points

    this.updateSymbols()
    if (this.refWalls.length) {
      this.updateRefWalls()
    } else {
      SvgRenderer.attr(this.preview[this.wall.uid], { points: getPointsStr(this.points) })
    }
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

    SvgRenderer.attr(this.preview[info1.ent.uid], { points: getPointsStr(info1.points) })
    SvgRenderer.attr(this.preview[info2.ent.uid], { points: getPointsStr(info2.points) })
  },

  updateRefWalls () {
    let walls = [...this.refWalls]
    walls.forEach(item => {
      item.points = _cloneDeep(item.originPoints)
    })
    const wallInfo = {
      ent: this.wall,
      points: _cloneDeep(this.points),
      angle: Vector.angle(this.points[0], this.points[3])
    }
    walls.push(wallInfo)
    walls = _sortBy(walls, item => item.angle)
    const length = walls.length
    let next
    walls.forEach((item, index) => {
      next = walls[(index + 1) % length]
      this.update2Walls(item, next)
    })

    this.points = wallInfo.points
  },

  updateSymbols () {
    const angle = Vector.angle(this.points[0], this.points[3])
    let position, tf
    // let position, wall
    this.refSymbols.forEach(item => {
      position = Point.paramPoint(this.points[0], this.points[3], item.param)
      tf = Matrix.identity()
      tf.rotate(angle)
      tf.translate(position.x, position.y)
      SvgRenderer.attr(this.preview[item.ent.uid], { transform: tf.toString() })
      item.angle = angle
      item.position = position
    })
  },

  onMouseUp (e) {
    MoveJig.prototype.onMouseUp.apply(this, arguments)
    if (e.button === 2) return

    const pos = this.getPos(e)
    if (!this.startPos) {
      this.startPos = pos
      SvgRenderer.attr(this.preview.line, { points: getPointsStr([pos]) })
    } else {
      this.update(pos)
      this.data = this.refWalls
      this.data.push({
        ent: this.wall,
        points: this.points,
        isOrigin: true
      })
      this.data.push(...this.refSymbols)
      this.end()
    }
  },

  /* onMouseMove (e) {
    MoveJig.prototype.onMouseMove.apply(this, arguments)
    if (!this.startPos) return
    const pos = this.getPos(e)
    this.update(pos)
  }, */

  getPos (e) {
    let pos = this.drawing.posInContent({
      x: e.pageX,
      y: e.pageY
    })
    const oSnap = Snap.findLine(_cloneDeep(pos), { type: 'center', tol: 150 })
    if (oSnap) {
      pos = oSnap.position
    }

    return pos
  }
})

export default wallSegJig
