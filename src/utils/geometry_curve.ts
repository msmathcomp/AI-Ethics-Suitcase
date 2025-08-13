import type { AreaPolygons, ClickCoordinates, Point } from "~/types";

// // Given three collinear points p, q, r, the function checks if
// // point q lies on line segment 'pr'
function onSegment(p: Point, q: Point, r: Point): boolean {
  if (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  ) {
    return true;
  }
  return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p: Point, q: Point, r: Point): number {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val === 0) return 0; // Collinear
  return val > 0 ? 1 : 2; // Clockwise or Counterclockwise
}

// // The main function that returns true if line segment 'p1q1'
// // and 'p2q2' intersect.
function segmentsIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
  // Find the four orientations needed for general and special cases
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  // General case
  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  // Special Cases
  // p1, q1 and p2 are collinear and p2 lies on segment p1q1
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;

  // p1, q1 and q2 are collinear and q2 lies on segment p1q1
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;

  // p2, q2 and p1 are collinear and p1 lies on segment p2q2
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;

  // p2, q2 and q1 are collinear and q1 lies on segment p2q2
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;

  return false; // Doesn't fall in any of the above cases
}

// export function checkSelfIntersection(path: Point[]): boolean {
//   const n = path.length;
//   if (n < 4) {
//     return false;
//   }

//   for (let i = 0; i < n - 1; i++) {
//     for (let j = i + 2; j < n - 1; j++) {
//       if (segmentsIntersect(path[i], path[i + 1], path[j], path[j + 1])) {
//         return true;
//       }
//     }
//   }
//   return false;
// }

function distancePointToSegment(p: Point, v: Point, w: Point): number {
  // squared distance
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y); // v == w
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}

function segmentsIntersectWithTolerance(
  p1: Point, q1: Point, p2: Point, q2: Point, tolerance: number
): boolean {
  if (!segmentsIntersect(p1, q1, p2, q2)) return false;

  // Check if intersection is "big enough"
  const dist1 = distancePointToSegment(p1, p2, q2);
  const dist2 = distancePointToSegment(q1, p2, q2);
  const dist3 = distancePointToSegment(p2, p1, q1);
  const dist4 = distancePointToSegment(q2, p1, q1);

  const minDist = Math.min(dist1, dist2, dist3, dist4);
  return minDist > tolerance;
}

export function checkSelfIntersection(path: Point[], tolerance = 5): boolean {
  const n = path.length;
  if (n < 4) {
    return false;
  }

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 2; j < n - 1; j++) {
      // Skip adjacent segments sharing a point
      if (i === 0 && j === n - 2) continue; // optional: ignore closing loop
      if (segmentsIntersectWithTolerance(path[i], path[i + 1], path[j], path[j + 1], tolerance)) {
        return true;
      }
    }
  }
  return false;
}

export function cleanSmallIntersections(path: Point[], threshold = 5): Point[] {
  let cleaned = [...path];
  let changed = true;

  while (changed) {
    changed = false;
    const n = cleaned.length;

    for (let i = 0; i < n - 1 && !changed; i++) {
      for (let j = i + 2; j < n - 1 && !changed; j++) {
        if (i === 0 && j === n - 2) continue;

        // Small intersection?
        if (segmentsIntersect(cleaned[i], cleaned[i + 1], cleaned[j], cleaned[j + 1])) {
          const dist1 = distancePointToSegment(cleaned[i], cleaned[j], cleaned[j + 1]);
          const dist2 = distancePointToSegment(cleaned[i + 1], cleaned[j], cleaned[j + 1]);
          const dist3 = distancePointToSegment(cleaned[j], cleaned[i], cleaned[i + 1]);
          const dist4 = distancePointToSegment(cleaned[j + 1], cleaned[i], cleaned[i + 1]);
          const minDist = Math.min(dist1, dist2, dist3, dist4);

          if (minDist <= threshold) {
            // Remove loop: keep everything up to i, then from j+1 onwards
            cleaned = [...cleaned.slice(0, i + 1), ...cleaned.slice(j + 1)];
            changed = true;
          }
        }
      }
    }
  }

  return cleaned;
}



export function isPointInBounds(
  point: Point,
  bounds: { top: number; bottom: number; left: number; right: number }
): boolean {
  return (
    point.x >= bounds.left &&
    point.x <= bounds.right &&
    point.y >= bounds.top &&
    point.y <= bounds.bottom
  );
}

// Finds intersection of a line segment (p1, p2) with a line (y = c or x = c)
function intersectLine(
  p1: Point,
  p2: Point,
  val: number,
  axis: "x" | "y"
): Point | null {
  if (axis === "y") {
    if ((p1.y - val) * (p2.y - val) < 0) {
      const x = p1.x + ((p2.x - p1.x) * (val - p1.y)) / (p2.y - p1.y);
      return { x, y: val };
    }
  } else {
    if ((p1.x - val) * (p2.x - val) < 0) {
      const y = p1.y + ((p2.y - p1.y) * (val - p1.x)) / (p2.x - p1.x);
      return { x: val, y };
    }
  }
  return null;
}

export function getCurveIntersections(
  path: Point[],
  bounds: { top: number; bottom: number; left: number; right: number }
): Point[] {
  const intersections: Point[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    let intersection;

    intersection = intersectLine(p1, p2, bounds.top, "y");
    if (intersection) intersections.push(intersection);
    intersection = intersectLine(p1, p2, bounds.bottom, "y");
    if (intersection) intersections.push(intersection);
    intersection = intersectLine(p1, p2, bounds.left, "x");
    if (intersection) intersections.push(intersection);
    intersection = intersectLine(p1, p2, bounds.right, "x");
    if (intersection) intersections.push(intersection);
  }
  return intersections;
}

const onBoundary = (p1: Point, p2: Point): boolean => {
  if (p1.x === p2.x && (p1.x === 0 || p1.x === 500)) return true;
  if (p1.y === p2.y && (p1.y === 0 || p1.y === 500)) return true;
  return false;
}



export const getAreaPolygons = (
  lineCoords: ClickCoordinates[],
  graphToOverlayCoords: (coords: Point) => Point
): AreaPolygons => {

  if (lineCoords.length < 2) return { area1: { graph: [], overlay: [] }, area2: { graph: [], overlay: [] } };

  console.log("Line coordinates:", lineCoords);


  const [p1, ...others] = lineCoords.map(coord => coord.graph);
  const p2 = others.pop() as Point;

  const isLeftOfLine = (point: Point): boolean => {
    return (
      (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x) > 0
    );
  };

  const corners = [
    { x: 0, y: 0 },
    { x: 500, y: 0 },
    { x: 500, y: 500 },
    { x: 0, y: 500 },
  ];

  const createPolygon = (isLeftSide: boolean): Point[] => {
    let polygon: Point[] = [];

    polygon.push(p1, p2);

    if (onBoundary(p1, p2)) {
      if (isLeftSide) {
        if (p1.x === p2.x && p1.x === 0) {
          if (p1.y < p2.y) {
            polygon = [
              p1, ...others, p2, { x: 0, y: 500 }, { x: 500, y: 500 }, { x: 500, y: 0 }, { x: 0, y: 0 }
            ]
          } else {
            polygon = [
              p1, ...others, p2, { x: 0, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 500 }, { x: 0, y: 500 }
            ]
          }
        } else if (p1.x === p2.x && p1.x === 500) {
          if (p1.y < p2.y) {
            polygon = [
              p1, ...others, p2, { x: 500, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 500 }, { x: 500, y: 500 }
            ]
          } else {
            polygon = [
              p1, ...others, p2, { x: 500, y: 500 }, { x: 0, y: 500 }, { x: 0, y: 0 }, { x: 500, y: 0 }
            ]
          }
        } else if (p1.y === p2.y && p1.y === 0) {
          if (p1.x < p2.x) {
            polygon = [
              p1, ...others, p2, { x: 500, y: 0 }, { x: 500, y: 500 }, { x: 0, y: 500 }, { x: 0, y: 0 }
            ]
          } else {
            polygon = [
              p1, ...others, p2, { x: 0, y: 0 }, { x: 0, y: 500 }, { x: 500, y: 500 }, { x: 500, y: 0 }
            ]
          }
        } else if (p1.y === p2.y && p1.y === 500) {
          if (p1.x < p2.x) {
            polygon = [
              p1, ...others, p2, { x: 0, y: 500 }, { x: 0, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 500 }
            ]
          } else {
            polygon = [
              p1, ...others, p2, { x: 500, y: 500 }, { x: 500, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 500 }
            ]
          }
        }
        return polygon;
      } else {
        return [p1, ...others, p2]
      }
    }
    else {
      corners.forEach((corner) => {
        if (isLeftOfLine(corner) === isLeftSide) {
          polygon.push(corner);
        }
      });
    }


    const centroidX = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length;
    const centroidY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;

    polygon.sort((a, b) => {
      const angleA = Math.atan2(a.y - centroidY, a.x - centroidX);
      const angleB = Math.atan2(b.y - centroidY, b.x - centroidX);
      return angleA - angleB;
    });

    // find the index of p1
    const p1Index = polygon.findIndex((p) => p === p1);
    const p2Index = polygon.findIndex((p) => p === p2);

    console.log('Polygon with line: ', p1Index, p2Index, polygon);

    if (p1Index === p2Index - 1) {
      polygon = [
        ...polygon.slice(0, p1Index + 1),
        ...others,
        ...polygon.slice(p1Index + 1),
      ];
    } else if (p2Index === p1Index - 1) {
      polygon = [
        ...polygon.slice(0, p2Index + 1),
        ...others.reverse(),
        ...polygon.slice(p2Index + 1),
      ];
    } else if (p1Index === 0 && p2Index === polygon.length - 1) {
      polygon = [...polygon, ...others.reverse()]
    } else if (p2Index === 0 && p1Index === polygon.length - 1) {
      polygon = [...others, ...polygon]
    }

    console.log(polygon);

    return polygon;
  };

  const area1GraphCoords = createPolygon(true);
  const area2GraphCoords = createPolygon(false);

  return {
    area1: {
      graph: area1GraphCoords,
      overlay: area1GraphCoords.map(graphToOverlayCoords),
    },
    area2: {
      graph: area2GraphCoords,
      overlay: area2GraphCoords.map(graphToOverlayCoords),
    },
  };
};

export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    // Check if the edge crosses the horizontal ray from point
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}