import { Point, Line } from '../geometry'
import Matrix from '../matrix'

/* pts转为path */
const getPointsStr = pts => {
  return pts.map(pt => pt.x + ' ' + pt.y).join(' ')
}

/* pt点平移offset */
const pointAdd = (pt, offset) => {
  return {
    x: pt.x + offset.x,
    y: pt.y + offset.y
  }
}

/* pt点绕center点旋转angle */
const pointRotate = (pt, center, angle) => {
  const tf = Matrix.identity()
  tf.translate(-center.x, -center.y)
  tf.rotate(angle)
  tf.translate(center.x, center.y)
  return Point.transform(pt, tf)
}

/* 改变墙体的起点为之前的终点 */
const changeStart = (points) => {
  const first3Pts = points.splice(0, 3)
  points.push(...first3Pts)
  return points
}

/* 求l1，l2的交点 */
/* l1:[pt,pt] */
/* l2:[pt,pt] */
/* options: {
  extend: 同geometry中的规则
} */
const getIntersect = (l1, l2, options) => {
  options = Object.assign({}, { extend: true }, options || {})
  l1 = new Line(...l1)
  l2 = new Line(...l2)
  return Line.intersect(l1, l2, options)
}

/* 计算两堵墙的内、中、外三条边的交点 */
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

export {
  getPointsStr,
  pointAdd,
  pointRotate,
  changeStart,
  getIntersect,
  merge2Walls
}
