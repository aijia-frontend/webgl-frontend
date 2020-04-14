import Jig from './baseJig'
import SvgRenderer from '@/common/renderTools'
// import Vector from '@/common/vector'
import { Point, Line } from '@/common/geometry'
// import Matrix from '@/common/matrix'
import CST from '@/common/cst/main'
import PreviewBuilder from './previewBuilder'
import _cloneDeep from 'lodash/cloneDeep'
// const wallWeight = 140 // mm

const getPointsStr = pts => {
  return pts.map(pt => pt.x + ' ' + pt.y).join(' ')
}

const pointAdd = (pt, offset) => {
  return {
    x: pt.x + offset.x,
    y: pt.y + offset.y
  }
}

const changeStart = (points) => {
  const first3Pts = points.splice(0, 3)
  points.push(...first3Pts)
  return points
}

/* const pointTransform = (pt, center, angle) => {
  const tf = Matrix.identity()
  tf.translate(-center.x, -center.y)
  tf.rotate(angle)
  tf.translate(center.x, center.y)
  return Point.transform(pt, tf)
} */

const getIntersect = (l1, l2) => {
  l1 = new Line(...l1)
  l2 = new Line(...l2)
  return Line.intersect(l1, l2, { extend: true })
}

const merge2Walls = (points1, points2) => {
  let inter0 = getIntersect([points1[0], points1[3]], [points2[0], points2[3]])
  let inter1 = getIntersect([points1[1], points1[2]], [points2[1], points2[2]])
  let inter2 = getIntersect([points1[4], points1[5]], [points2[4], points2[5]])
  if (!inter0 || !inter1 || !inter2) {
    inter0 = {
      point: points2[0],
      p1: 1,
      p2: 0
    }
    inter1 = {
      point: points2[1],
      p1: 1,
      p2: 0
    }
    inter2 = {
      point: points2[5],
      p1: 0,
      p2: 1
    }
  }
  return {
    inter0,
    inter1,
    inter2
  }
}

const moveWallJig = Jig.extend({
  initialize (attrs, options) {
    Jig.prototype.initialize.apply(this, arguments)
    this.wall = attrs.wall
    if (this.attrs.startPos) {
      this.startPos = this.attrs.startPos
    }
  },

  start () {
    // 查找相关内容
    this.refEnts = []
    this.activeEnts = [this.wall]
    const joints = this.wall.joints()
    this.refWalls = []
    this.originPoints = this.wall.points().map(this.point2Physical)
    if (joints.length) {
      if (Point.equal(joints[0].position(), this.wall.points()[3])) {
        this.originPoints = changeStart(this.originPoints)
      }
      const refWalls = joints[0].walls().filter(item => item.uid !== this.wall.uid)
      this.refWalls.push(...refWalls)
      this.refEnts.push(...refWalls)
      this.activeEnts.push(...refWalls)
      this.refEnts.push(joints[0])
      this.activeEnts.push(joints[0])
      this.initRefWallsData(joints[0])
    }

    if (this.refWalls.length) {
      const originPoints = this.refWalls[0].ent.originPoints().map(this.point2Physical)
      const originLine = new Line(originPoints[0], originPoints[1])
      this.startPos = originLine.nearestPoint(this.startPos, {
        extend: true
      })
    }

    // 隐藏
    this.drawing.hide(this.activeEnts)
    Jig.prototype.start.apply(this, arguments)
  },

  initRefWallsData (joint) {
    const jointPos = joint.position()
    this.refWalls = this.refWalls.map(wall => {
      let points = wall.points()
      if (Point.equal(jointPos, points[0])) { // 需要颠倒起点终点
        points = changeStart(points)
      }
      const originPoints = points.map(this.point2Physical)
      return {
        ent: wall,
        originPoints
      }
    })
  },

  cleanup () {
    this.drawing.show(this.activeEnts)
    Jig.prototype.cleanup.apply(this, arguments)
  },

  prepare () {
    // 添加临时图形
    this.preview = {
      wall: PreviewBuilder.build(this.wall)
    }
    this.drawing.addTransient(this.preview.wall)
    // 添加关联图形
    let type = ''
    let tryout = null
    this.refEnts.forEach(ent => {
      type = ent.type + 's'
      if (!this[type]) this[type] = []
      tryout = PreviewBuilder.build(ent)
      this.drawing.addTransient(tryout)
      this[type].push(tryout)
    })
    // this.update(this.attrs.end)
  },

  update (pos) {
    if (this.refWalls.length) {
      const originPoints = this.refWalls[0].ent.originPoints().map(this.point2Physical)
      const originLine = new Line(originPoints[0], originPoints[1])
      pos = originLine.nearestPoint(pos, {
        extend: true
      })
    }
    const offset = {
      x: pos.x - this.startPos.x,
      y: pos.y - this.startPos.y
    }
    this.updateWall(offset)

    // const options = {
    //   tag: 'point',
    //   origin: this.dataStore.origin
    // }
    // const startL = CST.toLogical(this.points[1], options)
    // const endL = CST.toLogical(this.points[2], options)
    // this.$bus.$emit('dimension', {
    //   pos: this.drawing.getPosFromView(Point.paramPoint(this.points[1], this.points[2], 0.5)),
    //   length: Point.distance(startL, endL),
    //   wallWeight
    // })
  },

  updateWall (offset) {
    // 若存在相连的墙体，则在其中一面墙的方向上移动 : 无方向
    this.points = this.originPoints.map(pt => pointAdd(pt, offset))
    this.updateRefWalls()
    SvgRenderer.attr(this.preview.wall, { points: getPointsStr(this.points) })
  },

  updateRefWalls () {
    if (this.refWalls.length === 1) {
      const points1 = _cloneDeep(this.refWalls[0].originPoints)
      const inters = merge2Walls(points1, this.points)
      points1[3] = inters.inter0.point
      points1[2] = inters.inter1.point
      points1[4] = inters.inter2.point
      this.refWalls[0].points = points1
      SvgRenderer.attr(this.walls[0], { points: getPointsStr(points1) })
      this.points[0] = inters.inter0.point
      this.points[1] = inters.inter1.point
      this.points[5] = inters.inter2.point

      // updateJoint
      SvgRenderer.attr(this.joints[0], { cx: inters.inter0.point.x, cy: inters.inter0.point.y })
    }
    /* this.refWalls.forEach(ent => {
      const points = ent.originPoints
      const inters = merge2Walls(this.points)
    }) */
  },

  onMouseUp (e) {
    Jig.prototype.onMouseUp.apply(this, arguments)

    const pos = this.getPos(e)
    const dis = CST.mm.toLogical(Point.distance(pos, this.startPos))
    if (dis < 1) this.cancel()
    else {
      this.update(pos)
      this.data = [{
        ent: this.wall,
        points: this.points
      }, ...this.refWalls, ...this.joints]
      // this.data.refs = this.refWalls
      // this.data.wall = {
      //   ent: this.wall,
      //   points: this.points
      // }
      this.end()
    }
  },

  onMouseMove (e) {
    Jig.prototype.onMouseMove.apply(this, arguments)
    if (!this.startPos) return
    const pos = this.getPos(e)
    this.update(pos)
  }
})

export default moveWallJig
