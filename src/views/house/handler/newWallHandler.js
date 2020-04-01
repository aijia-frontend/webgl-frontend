import BaseHandler from './baseHandler'
import DataStore from '../models/dataStore'
import { PolyLine } from '@/common/geometry'
import _first from 'lodash/first'

const NewWallHandler = BaseHandler.extend({
  initialize (attrs, options) {
    console.log(DataStore)

    this.walls = DataStore.getWalls()
    console.log('====>dataStore walls:', this.walls)
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
  attachWall (data) {
    const points = data.points
    points.push(_first(points))
    const intersectWalls = this.walls.filter(wall => {
      const points1 = wall.points()
      points1.push(_first(points1))
      const intersect = PolyLine.intersect(new PolyLine(points1), new PolyLine(points))
      return intersect.length
    })
    console.log('intersect Walls:', intersectWalls)
  },

  run (data) {
    this.attachWall(data)
    this.drawing.addContainer({
      type: 'wall',
      data: data
    })
  }
})

export default NewWallHandler
