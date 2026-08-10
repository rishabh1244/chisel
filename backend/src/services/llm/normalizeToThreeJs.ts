export interface ThreeJsObject {
  type: string
  [key: string]: unknown
}

export function normalizeToThreeJs(
  data: Record<string, any>
): { objects: ThreeJsObject[] } {
  const objects: ThreeJsObject[] = []

  const wallHeight = Number(data.wallHeight || 9)
  const wallThickness = Number(data.wallThickness || 0.5)

  const walls = Array.isArray(data.walls) ? data.walls : []
  const wallById: Record<string, any> = {}

  walls.forEach((wall: any) => {
    if (wall && Array.isArray(wall.start) && Array.isArray(wall.end)) {
      wallById[wall.id] = wall
      objects.push({
        type: 'wall',
        start: wall.start,
        end: wall.end,
        height: wall.height ?? wallHeight,
        thickness: wall.thickness ?? wallThickness,
      })
    }
  })

  if (
    data.floor &&
    Array.isArray(data.floor.outline) &&
    data.floor.outline.length >= 3
  ) {
    objects.push({ type: 'floor', corners: data.floor.outline })
  }

  const openings = Array.isArray(data.openings) ? data.openings : []
  openings.forEach((opening: any) => {
    if (!opening) return
    const isWindow = opening.type === 'window'
    const wall = wallById[opening.wallId]
    let position: number[]
    if (wall) {
      const [sx, sy] = wall.start
      const [ex, ey] = wall.end
      const fraction =
        typeof opening.position === 'number' ? opening.position : 0.5
      position = [sx + (ex - sx) * fraction, sy + (ey - sy) * fraction]
    } else if (Array.isArray(opening.position)) {
      position = opening.position
    } else {
      position = [0, 0]
    }
    objects.push({
      type: isWindow ? 'window' : 'door',
      position,
      width: opening.width ?? 1,
      height: opening.height ?? (isWindow ? 5 : wallHeight - 2),
    })
  })

  const rooms = Array.isArray(data.rooms) ? data.rooms : []
  rooms.forEach((room: any) => {
    const polygon = Array.isArray(room.polygon)
      ? room.polygon
      : room.corners
    if (!polygon) return
    objects.push({
      type: 'room',
      corners: polygon,
      height: wallHeight,
      name: room.name,
    })
  })

  return { objects }
}