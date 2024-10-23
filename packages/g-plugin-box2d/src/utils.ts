/**
 * @see https://stackoverflow.com/questions/45660743/sort-points-in-counter-clockwise-in-javascript
 */
export function sortPointsInCCW(
  pts: ([number, number] | [number, number, number])[],
): [number, number][] {
  const points = pts.map(([x, y]) => ({
    x,
    y,
    angle: 0,
  }));

  points.sort((a, b) => a.y - b.y);

  // Get center y
  const cy = (points[0].y + points[points.length - 1].y) / 2;

  // Sort from right to left
  points.sort((a, b) => b.x - a.x);

  // Get center x
  const cx = (points[0].x + points[points.length - 1].x) / 2;

  // Center point
  const center = { x: cx, y: cy };

  // Pre calculate the angles as it will be slow in the sort
  // As the points are sorted from right to left the first point
  // is the rightmost

  // Starting angle used to reference other angles
  let startAng: number;
  points.forEach((point) => {
    let ang = Math.atan2(point.y - center.y, point.x - center.x);
    if (!startAng) {
      startAng = ang;
    } else if (ang < startAng) {
      // ensure that all points are clockwise of the start point
      ang += Math.PI * 2;
    }
    point.angle = ang; // add the angle to the point
  });

  // Sort clockwise;
  points.sort((a, b) => a.angle - b.angle);

  return points.map(({ x, y }) => [x, y]);
}

/**
 * @see https://github.com/Birch-san/box2d-wasm/blob/c04514c040/demo/svelte-rollup-ts/src/helpers.ts#L52-L65
 */
export function createPolygonShape(
  box2D: typeof Box2D & EmscriptenModule,
  vertices: Box2D.b2Vec2[],
): Box2D.b2PolygonShape {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { _malloc, b2Vec2, b2PolygonShape, HEAPF32, wrapPointer } = box2D;
  const shape = new b2PolygonShape();
  const buffer = _malloc(vertices.length * 8);
  let offset = 0;
  for (let i = 0; i < vertices.length; i++) {
    HEAPF32[(buffer + offset) >> 2] = vertices[i].get_x();
    HEAPF32[(buffer + (offset + 4)) >> 2] = vertices[i].get_y();
    offset += 8;
  }
  const ptr_wrapped = wrapPointer(buffer, b2Vec2);
  shape.Set(ptr_wrapped, vertices.length);
  return shape;
}

export function createChainShape(
  box2D: typeof Box2D & EmscriptenModule,
  vertices: Box2D.b2Vec2[],
  closedLoop: boolean,
  prev?: Box2D.b2Vec2,
  next?: Box2D.b2Vec2,
): Box2D.b2ChainShape {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { _malloc, b2Vec2, b2ChainShape, HEAPF32, wrapPointer } = box2D;
  const shape = new b2ChainShape();
  const buffer = _malloc(vertices.length * 8);
  let offset = 0;
  for (let i = 0; i < vertices.length; i++) {
    HEAPF32[(buffer + offset) >> 2] = vertices[i].get_x();
    HEAPF32[(buffer + (offset + 4)) >> 2] = vertices[i].get_y();
    offset += 8;
  }
  const ptr_wrapped = wrapPointer(buffer, b2Vec2);
  if (closedLoop) {
    shape.CreateLoop(ptr_wrapped, vertices.length);
  } else {
    shape.CreateChain(ptr_wrapped, vertices.length, prev, next);
  }
  return shape;
}
