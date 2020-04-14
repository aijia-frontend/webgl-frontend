import Vector from './vector'
import { Point, Line, PolyLine } from './geometry'
import { isInPolygon } from './util/gTools'

/*
  面积 计算
*/

const get3Pts = (pts, index) => {
  const p0 = pts[index]
  const p1 = pts[index - 1]
  const p2 = pts[index + 1 % pts.length]
  return {
    p0,
    p1,
    p2
  }
}

const polygonArea = (pts) => {
  let S = 0

  while (pts.length > 2) {
    // 拆分为三角形计算面积
    const ptIndex = getPointIndex(pts, 1)
    const pts_ = get3Pts(pts, ptIndex)
    S += calAreaBy3Pts(pts_.p1, pts_.p0, pts_.p2)
    pts.splice(ptIndex, 1)
  }

  return S
}

const calAreaBy3Pts = (p1, p0, p2) => {
  const v1 = new Vector(p0, p1)
  const v2 = new Vector(p0, p2)
  return Math.abs(v1.x * v2.y - v1.y * v2.x) / 2
}

const getPointIndex = (pts, index) => {
  if (judgeIndex(pts, index)) return index
  else {
    index += 1
    return getPointIndex(pts, index)
  }
}

/* 条件：
  1. 夹角的对边的中心不能再区域外
  2. 夹角的对边不能与除夹角两边的四条线外的其他直线相交
*/
const judgeIndex = (pts, index) => {
  if (pts.length === 3) return true
  else {
    // 带入条件判断
    const pts_ = get3Pts(pts, index)

    const p = Point.paramPoint(pts_.p1, pts_.p2, 0.5) // 夹角对边中点
    const pState = isInPolygon(p, pts)
    if (pState !== 'out') { // 不在区域外
      // 对边不能与其他线相交
      const line0 = new Line(pts_.p1, pts_.p2)
      const lines = PolyLine.lines(pts, { isClosed: true })
      const escapeIndex = getEscapeIndexs(lines.length, index)
      const hasIntersect = lines.find((line, index) => {
        if (escapeIndex.includes(index)) return false
        if (line.intersect(line0)) return true
      })
      if (!hasIntersect) return true
    }
  }
  return false
}

const getEscapeIndexs = (length, index) => {
  return [(index - 2 + length) % length, index - 1, index, (index + 1) % length]
}

export default polygonArea
