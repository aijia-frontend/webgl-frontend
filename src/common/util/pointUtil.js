import { Point, Line } from '../geometry'
import Matrix from '../matrix'

const getPointsStr = pts => {
  return pts.map(pt => pt.x + ' ' + pt.y).join(' ')
}

const pointAdd = (pt, offset) => {
  return {
    x: pt.x + offset.x,
    y: pt.y + offset.y
  }
}

const pointRotate = (pt, center, angle) => {
  const tf = Matrix.identity()
  tf.translate(-center.x, -center.y)
  tf.rotate(angle)
  tf.translate(center.x, center.y)
  return Point.transform(pt, tf)
}

const changeStart = (points) => {
  const first3Pts = points.splice(0, 3)
  points.push(...first3Pts)
  return points
}

const getIntersect = (l1, l2, options) => {
  options = Object.assign({}, { extend: true }, options || {})
  l1 = new Line(...l1)
  l2 = new Line(...l2)
  return Line.intersect(l1, l2, options)
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

export {
  getPointsStr,
  pointAdd,
  pointRotate,
  changeStart,
  getIntersect,
  merge2Walls
}
