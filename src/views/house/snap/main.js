import CST from '@/common/cst/main'
import { Point } from '@/common/geometry'
import { isInPolygon } from '@/common/util/gTools'
import DataStore from '../models/dataStore'
import RefSnap from './refSnap'
import LineSnap from './lineSnap'
const Tol = 50 // mm

const newRefSnap = (refId) => {
  return new RefSnap({
    position: {
      x: 0,
      y: 0
    },
    refId
  })
}

const jointSnap = newRefSnap('#joint-snap')
const centerSnap = newRefSnap('#wall-center-snap')
const wallInsideSnap = newRefSnap('#wall-inside-snap')
const hLineSnap = new LineSnap({
  start: { x: 0, y: 0 },
  end: { x: 0, y: 0 }
})
const vLineSnap = new LineSnap({
  start: { x: 0, y: 0 },
  end: { x: 0, y: 0 }
})
const snaps = [jointSnap, centerSnap, wallInsideSnap, hLineSnap, vLineSnap]

const toLogical = (pos) => {
  const options = {
    tag: 'point',
    origin: DataStore.origin
  }
  return CST.toLogical(pos, options)
}

const toPhysical = (pos) => {
  const options = {
    tag: 'point',
    origin: DataStore.origin
  }
  return CST.toPhysical(pos, options)
}

const findCenter = (pos, options) => {
  pos = toLogical(pos)
  let centerPos = null
  const walls = DataStore.walls
  const pts = []
  walls.forEach(wall => pts.push(Point.paramPoint(wall.start(), wall.end(), 0.5)))
  pts.forEach(pt => {
    if (Point.distance(pt, pos) < Tol) {
      centerPos = pt
      return true
    }
  })
  if (centerPos) {
    centerPos = toPhysical(centerPos)
    snapRender(centerSnap)
    centerSnap.update(centerPos)
    centerSnap.show()
  }

  return centerPos
}

const findEnd = (pos, options) => {
  pos = toLogical(pos)
  let endPos = null
  const walls = DataStore.walls
  const pts = []
  walls.forEach(wall => pts.push(wall.start(), wall.end()))
  pts.find(pt => {
    if (Point.distance(pt, pos) < Tol) {
      endPos = pt
      return true
    }
  })
  if (endPos) {
    endPos = toPhysical(endPos)
    snapRender(jointSnap)
    jointSnap.update(endPos)
    jointSnap.show()
  }
  return endPos
}

const findInsideWall = (pos, options) => {
  pos = toLogical(pos)
  const walls = DataStore.walls
  const wall = walls.find(wall => {
    const points = wall.points()
    return isInPolygon(pos, points) === 'in'
  })
  if (wall) {
    snapRender(wallInsideSnap)
    wallInsideSnap.update(toPhysical(pos))
    wallInsideSnap.show()
  }
  return null
}

const findHV = (start, pos, type) => {
  if (Math.abs(start[type] - pos[type]) < Tol) return toPhysical(Object.assign({}, pos, { [type]: start[type] }))
  else return null
}

const findHVLine = (pos, options) => {
  pos = toLogical(pos)
  const walls = DataStore.walls
  const pts = []
  walls.forEach(wall => pts.push(wall.start(), wall.end()))
  let hPos = pts.find(pt => {
    return findHV(pt, pos, 'y') // h
  })
  let vPos = pts.find(pt => {
    return findHV(pt, pos, 'x') // v
  })

  if (hPos) {
    hPos = toPhysical(hPos)
    snapRender(hLineSnap)
    hLineSnap.update({
      x: hPos.x - 99999,
      y: hPos.y
    }, {
      x: hPos.x + 99999,
      y: hPos.y
    })
    hLineSnap.show()
  }
  if (vPos) {
    vPos = toPhysical(vPos)
    snapRender(vLineSnap)
    vLineSnap.update({
      x: vPos.x,
      y: vPos.y - 99999
    }, {
      x: vPos.x,
      y: vPos.y + 99999
    })
    vLineSnap.show()
  }

  return {
    hPos,
    vPos
  }
}

const snapRender = (snap) => {
  const drawing = DataStore.drawing
  if (!snap.el) {
    snap.render()
    drawing.addTransient(snap.el)
  }
}

const reset = (options) => {
  snaps.forEach(snap => snap[options.func]())
}

const find = (pos, options) => {
  let position = pos
  const snap = findEnd(pos, options) ||
    findCenter(pos, options) ||
    findInsideWall(pos, options)

  if (snap) {
    position = snap
  }
  const hv = findHVLine(pos)
  if (hv.hPos) {
    position.y = hv.hPos.y
  }
  if (hv.vPos) {
    position.x = hv.vPos.x
  }

  return position
}

export default {
  reset,
  find
}
