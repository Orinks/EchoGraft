import { syngen } from '../engine/syngen.js'

function fallbackVector({ x = 0, y = 0, z = 0 } = {}) {
  return {
    x,
    y,
    z,
    add: (vector = {}) => fallbackVector({ x: x + (vector.x ?? 0), y: y + (vector.y ?? 0), z: z + (vector.z ?? 0) }),
    distance: (vector = {}) => Math.hypot(x - (vector.x ?? 0), y - (vector.y ?? 0), z - (vector.z ?? 0)),
    scale: (scalar = 0) => fallbackVector({ x: x * scalar, y: y * scalar, z: z * scalar }),
    subtract: (vector = {}) => fallbackVector({ x: x - (vector.x ?? 0), y: y - (vector.y ?? 0), z: z - (vector.z ?? 0) }),
  }
}

function vector3d(position = {}) {
  const value = {
    x: position.x ?? 0,
    y: position.y ?? 0,
    z: position.z ?? 0,
  }

  return syngen?.tool?.vector3d?.create
    ? syngen.tool.vector3d.create(value)
    : fallbackVector(value)
}

function deterministicNoise(seed = 'echograft-world') {
  return {
    value(x = 0, y = 0) {
      const text = `${seed}:${Math.round(x * 1000)}:${Math.round(y * 1000)}`
      let hash = 0
      for (let index = 0; index < text.length; index += 1) {
        hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0
      }
      return (Math.abs(hash) % 1000) / 1000
    },
  }
}

function createLayoutNoise(seed = 'echograft-world') {
  return {
    line: syngen?.tool?.noise?.create ? syngen.tool.noise.create(seed, 'line') : deterministicNoise(`${seed}:line`),
    field: syngen?.tool?.perlin2d?.create ? syngen.tool.perlin2d.create(seed, 'field') : deterministicNoise(`${seed}:field`),
  }
}

function fallbackTree(points = []) {
  return {
    find(query = {}, radius = Infinity) {
      return points
        .filter((point) => point !== query)
        .map((point) => ({ point, distance: Math.hypot(point.x - (query.x ?? 0), point.y - (query.y ?? 0)) }))
        .filter((item) => item.distance <= radius)
        .sort((a, b) => a.distance - b.distance)[0]?.point
    },
    retrieve(rect = {}) {
      const east = (rect.x ?? 0) + (rect.width ?? 0)
      const north = (rect.y ?? 0) + (rect.height ?? 0)
      return points.filter((point) => point.x >= (rect.x ?? 0) && point.x <= east && point.y >= (rect.y ?? 0) && point.y <= north)
    },
  }
}

function createSpatialTree(points = []) {
  const bounds = {
    height: 80,
    maxItems: 8,
    width: 80,
    x: 0,
    y: -20,
  }

  return syngen?.tool?.quadtree?.from
    ? syngen.tool.quadtree.from(points, bounds)
    : fallbackTree(points)
}

function createChunkGenerator(noise, scale = 12) {
  const generator = (x = 0, y = 0) => ({
    density: Number(noise.field.value(x / 3, y / 3).toFixed(3)),
    resonance: Number(noise.line.value(x + y).toFixed(3)),
    text: `World chunk ${x}, ${y}: generated resonance field.`,
  })

  return syngen?.tool?.generator2d?.create
    ? syngen.tool.generator2d.create({ generator, radius: 1, scale })
    : { generate: generator, radius: 1, scale }
}

const systemRows = new Map([
  ['Intake', 0],
  ['Navigation', 1],
  ['Water', 2],
  ['Canopy', 3],
  ['Rootworks', 4],
  ['Memory', 5],
  ['Verdancy Heart', 6],
  ['Conservatory', 7],
])

export function worldLayoutPoint(chamber = {}, index = 0, noise = createLayoutNoise()) {
  const start = vector3d({ ...chamber.start, z: chamber.season ?? 1 })
  const target = vector3d({ ...chamber.target, z: chamber.season ?? 1 })
  const midpoint = start.add(target).scale(0.5)
  const row = systemRows.get(chamber.system) ?? systemRows.size
  const season = chamber.season ?? Math.floor(index / 8) + 1
  const field = noise.field.value(season + midpoint.x / 10, row + midpoint.y / 10)
  const world = vector3d({
    x: season * 10 + midpoint.x,
    y: row * 8 + midpoint.y,
    z: Number((field * 4).toFixed(2)),
  })

  return {
    chamber,
    chamberId: chamber.id,
    distanceFromStart: Number(start.distance(target).toFixed(2)),
    field: Number(field.toFixed(3)),
    season,
    system: chamber.system,
    text: `${chamber.title}: world ${world.x.toFixed(1)}, ${world.y.toFixed(1)}, field ${field.toFixed(2)}.`,
    x: world.x,
    y: world.y,
    z: world.z,
  }
}

export function createWorldLayoutIndex(chambers = [], seed = 'echograft-world') {
  const noise = createLayoutNoise(seed)
  const points = chambers.map((chamber, index) => worldLayoutPoint(chamber, index, noise))
  const tree = createSpatialTree(points)
  const generator = createChunkGenerator(noise)

  return {
    chunkAt(position = {}) {
      const x = Math.round((position.x ?? 0) / generator.scale)
      const y = Math.round((position.y ?? 0) / generator.scale)
      return {
        x,
        y,
        ...generator.generate(x, y),
      }
    },
    nearestTo(position = {}, radius = Infinity) {
      return tree.find(position, radius)
    },
    points,
    retrieve(rect = {}) {
      return tree.retrieve(rect)
    },
    text: `World layout index: ${points.length} chamber point(s) indexed with Syngen vector, quadtree, generator, and noise tools.`,
  }
}
