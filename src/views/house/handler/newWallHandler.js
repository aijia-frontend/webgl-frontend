import BaseHandler from './baseHandler'
import DataStore from '../models/dataStore'
import { Point, Line, PolyLine } from '@/common/geometry'
import _first from 'lodash/first'
import NewJointHandler from './newJointHandler'

const NewWallHandler = BaseHandler.extend({
  initialize (attrs, options) {
    this.walls = DataStore.walls
    // console.log('====>dataStore walls:', this.walls)
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  /*
   *@Date: 2020-04-01
   *@Description: 查找与已经存在的墙相交
   *@Author: helloc
   *@Params:
   *
   *============== 步骤 ==============
  */
  findIntersectingWall () {
    const points = this.wall.points()
    points.push(_first(points))
    this.intersectingWalls = this.walls.filter(wall => {
      if (wall.uid === this.wall.uid) return
      const points1 = wall.points()
      points1.push(_first(points1))
      const intersect = PolyLine.intersect(new PolyLine(points1), new PolyLine(points))
      return intersect.length
    })
    // console.log('intersect Walls:', this.intersectingWalls)
  },

  handlerWalls () {
    // attachWalls
    this.intersectingWalls.forEach(wall => {
      const originPoints1 = wall.originPoints()
      const originPoints2 = [this.wall.points()[0], this.wall.points()[3]]
      // start\end || end\start
      if (Point.equal(originPoints1[0], originPoints2[1])) {
        this.attachWallHandler(this.wall, wall)
      } else if (Point.equal(originPoints1[1], originPoints2[0])) {
        this.attachWallHandler(wall, this.wall)
      // start || end overlap
      } else if (Point.equal(originPoints1[0], originPoints2[0])) {
        this.changeStart(this.wall)
        this.attachWallHandler(this.wall, wall)
      } else if (Point.equal(originPoints1[1], originPoints2[1])) {
        this.changeStart(this.wall)
        this.attachWallHandler(wall, this.wall)
      }
    }, this)
  },

  changeStart (wall) {
    const points = wall.points()
    const first3Pts = points.splice(0, 3)
    points.push(...first3Pts)
    wall.attrs.points = points
  },

  attachWallHandler (wall1, wall2) {
    const points1 = wall1.points()
    const points2 = wall2.points()
    const l1 = new Line(points1[1], points1[2])
    const l2 = new Line(points1[4], points1[5])
    const c1 = new Line(points2[1], points2[2])
    const c2 = new Line(points2[4], points2[5])

    const intersect1 = Line.intersect(l1, c1, { extend: true })
    const intersect2 = Line.intersect(l2, c2, { extend: true })
    if (intersect1) {
      points1[2] = points2[1] = intersect1.point
    }
    if (intersect2) {
      points1[4] = points2[5] = intersect2.point
    }

    this.createJoint({
      position: points1[3],
      walls: [wall1, wall2]
    })
    DataStore.update([{
      ent: wall1,
      points: points1
    }, {
      ent: wall2,
      points: points2
    }])
    // setTimeout(() => {
    wall1.update({ points: points1 })
    wall2.update({ points: points2 })
    // }, 3000)
  },

  createJoint (data) {
    const newJointHandler = new NewJointHandler(this.attrs)
    return newJointHandler.run(data)
  },

  createWall (data) {
    return DataStore.create({
      type: 'wall',
      data: data
    })
  },

  run (data) {
    this.data = data
    this.wall = this.createWall(data)
    this.findIntersectingWall()
    this.handlerWalls()
    // this.drawing.addContainer({
    //   type: 'wall',
    //   data: data
    // })
  }
})

export default NewWallHandler
