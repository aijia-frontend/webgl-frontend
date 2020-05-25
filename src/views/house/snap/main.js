import CST from '@/common/cst/main'
import { Point, Line } from '@/common/geometry'
import { isInPolygon } from '@/common/util/gTools'
import DataStore from '../models/dataStore'
import RefSnap from './refSnap'
import LineSnap from './lineSnap'
const Tol = 100 // mm

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
  let point
  const wall = walls.find(wall => {
    point = Point.paramPoint(wall.start(), wall.end(), 0.5)
    if (Point.distance(point, pos) < Tol) {
      centerPos = point
      return true
    }
    return false
  })
  if (wall) {
    centerPos = toPhysical(centerPos)
    snapRender(centerSnap)
    centerSnap.update(centerPos)
    centerSnap.show()
    return {
      wall,
      snap: centerPos
    }
  }
  return null
}

const findEnd = (pos, options) => {
  pos = toLogical(pos)
  let endPos = null
  const walls = DataStore.walls
  let point
  const wall = walls.find(wall => {
    point = wall.start()
    if (Point.distance(point, pos) < Tol) {
      endPos = point
      return true
    }
    point = wall.end()
    if (Point.distance(point, pos) < Tol) {
      endPos = point
      return true
    }
    return false
  })
  if (wall) {
    endPos = toPhysical(endPos)
    snapRender(jointSnap)
    jointSnap.update(endPos)
    jointSnap.show()
    return {
      wall,
      snap: endPos
    }
  }
  return null
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
  return {
    wall,
    snap: toPhysical(pos)
  }
}

const findHV = (start, pos, type) => {
  if (Math.abs(start[type] - pos[type]) < Tol) return toPhysical(Object.assign({}, pos, { [type]: start[type] }))
  else return null
}

const findHVLine = (pos, options) => {
  pos = toLogical(pos)
  const walls = DataStore.walls
  const pts = []
  if (options.start) pts.push(toLogical(options.start))
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

const findWallLine = (pos, options) => {
  pos = toLogical(pos)
  let line, dist, snap
  let tol = options.tol || Tol
  const wall = DataStore.walls.find(item => {
    if (options.tol) tol = item.weight()
    if (options.type === 'center') {
      line = new Line(item.start(), item.end())
      dist = Point.distance(line.nearestPoint(pos), pos)
      if (dist <= tol) {
        snap = line.nearestPoint(pos)
        return true
      }
      return false
    }
  })
  if (wall) {
    return {
      snap: toPhysical(snap),
      wall
    }
  } else return null
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
  let wall = null
  const oSnap = findEnd(pos, options) ||
    findCenter(pos, options) ||
    findInsideWall(pos, options)

  if (oSnap) {
    position = oSnap.snap
    wall = oSnap.wall
  }
  const hv = findHVLine(pos, options)
  if (hv.hPos) {
    position.y = hv.hPos.y
    jointSnap.update(position)
    centerSnap.update(position)
    wallInsideSnap.update(position)
  }
  if (hv.vPos) {
    position.x = hv.vPos.x
    jointSnap.update(position)
    centerSnap.update(position)
    wallInsideSnap.update(position)
  }

  return {
    position,
    wall
  }
}

const findLine = (pos, options) => {
  let position = pos
  let wall
  const oSnap = findWallLine(pos, options)
  if (oSnap) {
    position = oSnap.snap
    wall = oSnap.wall
  }
  return {
    position,
    wall
  }
}

export default {
  reset,
  find,
  findLine
}
