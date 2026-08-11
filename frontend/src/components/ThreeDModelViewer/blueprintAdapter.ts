// blueprintAdapter.js
//
// Converts the "blueprint_json" architectural schema (walls / rooms / openings,
// with fractional door positions along a wall) into a flat array of render-ready
// primitives that ThreeDModelViewer.jsx can draw directly.
//
// Why this exists: an LLM generating floor-plan JSON should only ever produce
// ONE representation (the blueprint). Deriving the render objects here means
// there is a single source of truth and nothing can drift out of sync.

const DEFAULT_WALL_HEIGHT = 9;
const DEFAULT_WALL_THICKNESS = 0.5;
const DEFAULT_WINDOW_SILL = 3; // feet from floor to bottom of a window opening

const FLOOR_MATERIAL_COLORS = {
  wood: 0x9c7a54,
  carpet: 0x8993a4,
  tile: 0xc9c9c9,
  concrete: 0xa9a9a9,
  default: 0xabb8c3,
};

/**
 * Build a lookup of wallId -> wall definition for fast opening resolution.
 */
function indexWallsById(walls) {
  const map = new Map();
  for (const wall of walls) map.set(wall.id, wall);
  return map;
}

/**
 * Given a wall and the openings that belong to it, compute the 1D "void"
 * intervals (in local wall-length coordinate `u`, plus a vertical y-range)
 * that should NOT be filled with wall material.
 */
function computeVoids(wall, wallOpenings) {
  const dx = wall.end[0] - wall.start[0];
  const dz = wall.end[1] - wall.start[1];
  const length = Math.hypot(dx, dz);
  const wallHeight = wall.height ?? DEFAULT_WALL_HEIGHT;

  const voids = wallOpenings
    .map((op) => {
      const width = op.width ?? 3;
      const center = (op.position ?? 0.5) * length;
      const u0 = Math.max(0, center - width / 2);
      const u1 = Math.min(length, center + width / 2);

      let yBottom = 0;
      let yTop = op.height ?? 7;
      if (op.type === "window") {
        yBottom = op.sill ?? DEFAULT_WINDOW_SILL;
        yTop = yBottom + (op.height ?? 3);
      }
      yTop = Math.min(yTop, wallHeight);

      return { id: op.id, type: op.type, u0, u1, yBottom, yTop };
    })
    .sort((a, b) => a.u0 - b.u0);

  return { voids, length, wallHeight, dx, dz };
}

/**
 * Split one wall into solid box segments that route around every opening,
 * plus separate opening "fill" objects (door panel / window pane) so the
 * gap is visually explained rather than just an empty hole.
 */
function expandWall(wall, wallOpenings) {
  const thickness = wall.thickness ?? DEFAULT_WALL_THICKNESS;
  const { voids, length, wallHeight, dx, dz } = computeVoids(wall, wallOpenings);
  const dirX = length ? dx / length : 0;
  const dirZ = length ? dz / length : 0;

  const segments = [];
  const fills = [];
  let cursor = 0;

  const pushSegment = (u0, u1, yBottom, yTop) => {
    if (u1 - u0 <= 0.001 || yTop - yBottom <= 0.001) return;
    const midU = (u0 + u1) / 2;
    const midY = (yBottom + yTop) / 2;
    segments.push({
      type: "wallSegment",
      position: [wall.start[0] + dirX * midU, midY, wall.start[1] + dirZ * midU],
      rotationY: Math.atan2(-dz, dx),
      length: u1 - u0,
      height: yTop - yBottom,
      thickness,
    });
  };

  for (const v of voids) {
    // wall material before this opening, full height
    if (v.u0 > cursor) pushSegment(cursor, v.u0, 0, wallHeight);

    // sliver of wall below the opening (e.g. under a window sill)
    if (v.yBottom > 0) pushSegment(v.u0, v.u1, 0, v.yBottom);
    // header above the opening (e.g. above a door, or above a window)
    if (v.yTop < wallHeight) pushSegment(v.u0, v.u1, v.yTop, wallHeight);

    // the opening fill itself (door panel or glass pane)
    const midU = (v.u0 + v.u1) / 2;
    const worldPos = [wall.start[0] + dirX * midU, (v.yBottom + v.yTop) / 2, wall.start[1] + dirZ * midU];
    fills.push({
      type: v.type === "window" ? "window" : "door",
      id: v.id,
      position: worldPos,
      rotationY: Math.atan2(-dz, dx),
      width: v.u1 - v.u0,
      height: v.yTop - v.yBottom,
      thickness,
    });

    cursor = v.u1;
  }

  if (cursor < length) pushSegment(cursor, length, 0, wallHeight);

  return { segments, fills };
}

/**
 * Convert a room (or the exterior outline) polygon into a flat floor mesh spec.
 */
function expandRoomFloor(room) {
  return {
    type: "roomFloor",
    corners: room.polygon,
    color: FLOOR_MATERIAL_COLORS[room.floorMaterial] ?? FLOOR_MATERIAL_COLORS.default,
    label: room.name,
    labelPosition: room.labelPosition ?? centroid(room.polygon),
  };
}

function centroid(points) {
  const n = points.length;
  const sum = points.reduce((acc, [x, z]) => [acc[0] + x, acc[1] + z], [0, 0]);
  return [sum[0] / n, sum[1] / n];
}

/**
 * Main entry point: blueprint_json -> flat objects[] for the renderer.
 */
export function expandBlueprint(blueprint) {
  const objects = [];

  // Base slab under the whole footprint
  if (blueprint.floor?.outline?.length >= 3) {
    objects.push({
      type: "siteFloor",
      corners: blueprint.floor.outline,
    });
  }

  const wallsById = indexWallsById(blueprint.walls ?? []);
  const openingsByWall = new Map();
  for (const op of blueprint.openings ?? []) {
    if (!wallsById.has(op.wallId)) {
      console.warn(`Opening ${op.id} references unknown wallId ${op.wallId}`);
      continue;
    }
    if (!openingsByWall.has(op.wallId)) openingsByWall.set(op.wallId, []);
    openingsByWall.get(op.wallId).push(op);
  }

  for (const wall of blueprint.walls ?? []) {
    const wallOpenings = openingsByWall.get(wall.id) ?? [];
    const { segments, fills } = expandWall(wall, wallOpenings);
    objects.push(...segments, ...fills);
  }

  for (const room of blueprint.rooms ?? []) {
    objects.push(expandRoomFloor(room));
  }

  return objects;
}

export default expandBlueprint;
