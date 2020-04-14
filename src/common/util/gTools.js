import { Point } from '../geometry'

/**
   * @description 射线法判断点是否在多边形内部
   * @param {Object} p 待判断的点，格式：{ x: X坐标, y: Y坐标 }
   * @param {Array} poly 多边形顶点，数组成员的格式同 p
   * @return {String} 点 p 和多边形 poly 的几何关系
   */
function isInPolygon (p, poly) {
  const px = p.x
  const py = p.y
  let flag = false

  for (let i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
    const sx = poly[i].x
    const sy = poly[i].y
    const tx = poly[j].x
    const ty = poly[j].y

    // 点与多边形顶点重合
    if ((sx === px && sy === py) || (tx === px && ty === py)) {
      return 'on'
    }

    // 判断线段两端点是否在射线两侧
    if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
      // 线段上与射线 Y 坐标相同的点的 X 坐标
      const x = sx + (py - sy) * (tx - sx) / (ty - sy)

      // 点在多边形的边上
      if (x === px) {
        return 'on'
      }

      // 射线穿过多边形的边界
      if (x > px) {
        flag = !flag
      }
    } else if (px === tx && px === sx) { // 点在区域两点的水平连线上
      if (py >= Math.min(sy, ty) && py <= Math.max(sy, ty)) {
        return 'on'
      }
    } else if (py === ty && py === sy) { // 点在区域两点的垂直连线上
      if (px >= Math.min(sx, tx) && px <= Math.max(sx, tx)) {
        return 'on'
      }
    }
  }

  // 射线穿过多边形边界的次数为奇数时点在多边形内
  return flag ? 'in' : 'out'
}

/*
 *@Date: 2020-04-14
 *@Description: 获取环形封闭曲的内外环
 *@Author: helloc
 *@Params:
 *
 *============== 步骤 ==============
 * ！ 内环长度小于外环长度 ！
*/
const getLoops = (lines) => {
  const loop1 = [lines[0].p1, lines[0].p2]
  const loop2 = [lines[1].p1, lines[1].p2]
  getLoop(lines, loop1)
  getLoop(lines, loop2)
  return {
    loop1,
    loop2
  }
}

const getLoop = (lines, loop) => {
  const start = loop[loop.length - 2]
  const end = loop[loop.length - 1]
  const line = lines.find(line => {
    if ((Point.equal(line.p1, end) && Point.equal(line.p2, start)) ||
    (Point.equal(line.p2, end) && Point.equal(line.p1, start))) return false
    if (Point.equal(line.p1, end) || Point.equal(line.p2, end)) return true
  })
  if (line) {
    let pt = null
    if (Point.equal(line.p1, end)) {
      pt = line.p2
    } else {
      pt = line.p1
    }
    if (Point.equal(loop[0], pt)) return loop
    else {
      loop.push(pt)
      getLoop(lines, loop)
    }
  } else {
    return loop
  }
}

export {
  isInPolygon,
  getLoops
}
