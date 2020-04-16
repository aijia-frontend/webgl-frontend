import MoveJig from './moveJig'
import SvgRenderer from '@/common/renderTools'
import Vector from '@/common/vector'
import { Point, Line } from '@/common/geometry'
// import Matrix from '@/common/matrix'
// import CST from '@/common/cst/main'
// import PreviewBuilder from './previewBuilder'
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

const addToColl = (coll, ents, escape) => {
  if (Array.isArray(ents)) {
    ents.forEach(item => addToColl(coll, item, escape))
  } else {
    if (ents.uid === escape) return
    const ent = coll.find(item => item.uid === ents.uid)
    if (!ent) coll.push(ents)
  }
}

const getRefEnts = (wall) => {
  const joints = wall.joints()
  const refEnts = []
  joints.forEach(joint => {
    const walls = joint.walls()
    addToColl(refEnts, walls, wall.uid)
  })
  refEnts.push(...joints)

  return refEnts
}

const moveWallJig = MoveJig.extend({
  initialize (attrs, options) {
    MoveJig.prototype.initialize.apply(this, arguments)
  },

  start () {
    // 查找相关内容
    this.refEnts = getRefEnts(this.activeEnt)
    this.activeEnts = [this.activeEnt]
    this.activeEnts.push(...this.refEnts)

    this.initData()

    MoveJig.prototype.start.apply(this, arguments)
  },

  initData () {
    this.originPoints = this.activeEnt.points().map(this.point2Physical)
    // 按照joint分类
    const joints = this.refEnts.filter(item => item.type === 'joint')
    const walls = this.refEnts.filter(item => item.type === 'wall')
    this.refEntsData = []
    joints.forEach(joint => {
      const position = joint.position()
      this.refEntsData.push({
        ent: joint,
        isStart: Point.equal(position, this.activeEnt.start()),
        position: this.point2Physical(position)
      })
    })
    walls.forEach(wall => {
      const start = wall.start()
      const end = wall.end()
      let points = wall.points()
      // 更新时 反序 改变当前值
      if (Point.equal(start, this.activeEnt.start()) || Point.equal(end, this.activeEnt.end())) {
        points = changeStart(points)
      }
      let isStart = false
      if (Point.equal(points[3], this.activeEnt.start())) isStart = true
      points = points.map(this.point2Physical)
      this.refEntsData.push({
        ent: wall,
        isStart,
        originAngle: Vector.angle(points[0], points[3]),
        originPoints: points
      })
    })

    this.refWall = this.refEntsData[this.refEntsData.length - 1]
    if (this.refWall) {
      const originPoints = this.refWall.originPoints
      const originLine = new Line(originPoints[0], originPoints[3])
      this.startPos = originLine.ptProjection(this.startPos)
    }
  },

  update (pos) {
    if (this.refWall) {
      const originPoints = this.refWall.originPoints
      const originLine = new Line(originPoints[0], originPoints[3])
      pos = originLine.ptProjection(pos)
    }
    this.endPos = pos
    const offset = {
      x: pos.x - this.startPos.x,
      y: pos.y - this.startPos.y
    }
    this.updateWall(offset)
  },

  updateWall (offset) {
    // 若存在相连的墙体，则在其中一面墙的方向上移动 : 无方向
    this.points = this.originPoints.map(pt => pointAdd(pt, offset))
    this.updateRefWalls()
    this.updateJoints()
    SvgRenderer.attr(this.preview.activeEnt, { points: getPointsStr(this.points) })
  },

  updateRefWalls () {
    const refWalls = this.refEntsData.filter(item => item.ent.type === 'wall')
    refWalls.forEach((item, index) => {
      let points, angle, inters
      if (item.isStart) {
        // item -> this.points
        points = _cloneDeep(item.originPoints)
        angle = Vector.angle(points[0], this.points[0])
        if (Math.abs(angle - item.originAngle) > 1) {
          const point0 = points[0]
          points.reverse()
          points.pop()
          points.unshift(point0)
        }
        inters = merge2Walls(points, this.points)
        this.points[0] = points[3] = inters.inter0.point
        this.points[1] = points[2] = inters.inter1.point
        this.points[5] = points[4] = inters.inter2.point
        item.points = points
        SvgRenderer.attr(this.walls[index], { points: getPointsStr(points) })
      } else {
        // this.points -> item
        points = _cloneDeep(item.originPoints)
        angle = Vector.angle(this.points[3], points[3])
        if (Math.abs(angle - item.originAngle) > 1) {
          const point0 = points[0]
          points.reverse()
          points.pop()
          points.unshift(point0)
        }
        inters = merge2Walls(this.points, points)
        this.points[3] = points[0] = inters.inter0.point
        this.points[2] = points[1] = inters.inter1.point
        this.points[4] = points[5] = inters.inter2.point
        item.points = points
        SvgRenderer.attr(this.walls[index], { points: getPointsStr(points) })
      }
    }, this)
  },

  updateJoints () {
    const refJoints = this.refEntsData.filter(item => item.ent.type === 'joint')
    refJoints.forEach((item, index) => {
      item.position = item.isStart ? this.points[0] : this.points[3]
      SvgRenderer.attr(this.joints[index], { cx: item.position.x, cy: item.position.y })
    }, this)
  },

  onMouseUp (e) {
    if (this.endPos) {
      const dis = Point.distance(this.startPos, this.endPos)
      if (dis >= 20) {
        this.data = [{
          ent: this.activeEnt,
          points: this.points
        }, ...this.refEntsData]
        this.end()
        return
      }
    }
    this.cancel()
  },

  onMouseMove (e) {
    MoveJig.prototype.onMouseMove.apply(this, arguments)
    if (!this.startPos) return
    const pos = this.getPos(e)
    this.update(pos)
  }
})

export default moveWallJig
