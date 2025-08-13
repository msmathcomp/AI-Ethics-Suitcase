import type { Point, ClickCoordinates, AreaPolygons } from '~/types';

export const getAreaPolygons = (
  lineCoords: ClickCoordinates[],
  graphToOverlayCoords: (point: Point) => Point,
): AreaPolygons => {
  if (lineCoords.length !== 2) return {
    area1: {
      graph: [],
      overlay: [],
    }, area2: { graph: [], overlay: [] }
  };

  const [p1, p2] = lineCoords.map((coord) => coord.graph);
  const origin = { x: 0, y: 0 };

  const cornersExceptOrigin = [
    { x: 500, y: 0 },
    { x: 500, y: 500 },
    { x: 0, y: 500 },
  ];

  const createPolygon = (hasOrigin: boolean): Point[] => {
    const polygon: Point[] = [];

    polygon.push(p1, p2);

    if (hasOrigin) {
      polygon.push(origin);
    }

    for (const corner of cornersExceptOrigin) {
      if (sameSide(corner, origin, lineCoords) === hasOrigin) {
        polygon.push(corner);
      }
    }

    const centroidX = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length;
    const centroidY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;

    return polygon.sort((a, b) => {
      const angleA = Math.atan2(a.y - centroidY, a.x - centroidX);
      const angleB = Math.atan2(b.y - centroidY, b.x - centroidX);
      return angleA - angleB;
    });
  };

  try {
    const area1 = createPolygon(true);
    const area2 = createPolygon(false);

    console.log("Area 1:", area1);
    console.log("Area 2:", area2);

    const area1OverlayCoords = area1.map((coord) => graphToOverlayCoords(coord));
    const area2OverlayCoords = area2.map((coord) => graphToOverlayCoords(coord));

    return {
      area1: {
        graph: area1, // area1 is always the pass area
        overlay: area1OverlayCoords,
      }, // area1 is always the pass area
      area2: {
        graph: area2,
        overlay: area2OverlayCoords,
      }, // area2 is always the fail area
    };
  } catch (error) {
    console.error("Error converting coordinates:", error);
    return { area1: { graph: [], overlay: [] }, area2: { graph: [], overlay: [] } };
  }
};

export const getExtendedLinePoints = (
  lineCoords: ClickCoordinates[],
  graphToOverlayCoords: (point: Point) => Point
): ClickCoordinates[] => {
  if (lineCoords.length !== 2) return [];

  const [p1, p2] = lineCoords.map((coord) => coord.graph);

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const length = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / length;
  const unitY = dy / length;

  const extendedP1 = {
    x: p1.x - unitX * 30,
    y: p1.y - unitY * 30,
  };

  const extendedP2 = {
    x: p2.x + unitX * 30,
    y: p2.y + unitY * 30,
  };

  try {
    return [
      {
        graph: extendedP1,
        overlay: graphToOverlayCoords(extendedP1),
      },
      {
        graph: extendedP2,
        overlay: graphToOverlayCoords(extendedP2),
      },
    ];
  } catch (error) {
    console.error("Error converting extended coordinates:", error);
    return [];
  }
};

export const findIntersections = (point1: Point, point2: Point): Point[] => {
  const intersections: Point[] = [];
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  if (Math.abs(dx) < 1e-10) {
    if (point1.x >= 0 && point1.x <= 500) {
      if (dy !== 0) {
        intersections.push({ x: point1.x, y: 0 });
        intersections.push({ x: point1.x, y: 500 });
      }
    }
  } else {
    const slope = dy / dx;
    const intercept = point1.y - slope * point1.x;

    const yAtLeft = intercept;
    if (yAtLeft >= 0 && yAtLeft <= 500) {
      intersections.push({ x: 0, y: yAtLeft });
    }

    const yAtRight = slope * 500 + intercept;
    if (yAtRight >= 0 && yAtRight <= 500) {
      intersections.push({ x: 500, y: yAtRight });
    }

    if (Math.abs(slope) > 1e-10) {
      const xAtBottom = -intercept / slope;
      if (xAtBottom >= 0 && xAtBottom <= 500) {
        intersections.push({ x: xAtBottom, y: 0 });
      }
    }

    if (Math.abs(slope) > 1e-10) {
      const xAtTop = (500 - intercept) / slope;
      if (xAtTop >= 0 && xAtTop <= 500) {
        intersections.push({ x: xAtTop, y: 500 });
      }
    }
  }

  const uniqueIntersections = intersections.filter(
    (intersection, index) => {
      return !intersections
        .slice(0, index)
        .some(
          (prev) =>
            Math.abs(prev.x - intersection.x) < 1e-6 &&
            Math.abs(prev.y - intersection.y) < 1e-6
        );
    }
  );

  return uniqueIntersections;
};

export const findIntersectionsForDrag = (point1: Point, point2: Point): Point[] => {
  const intersections: Point[] = [];
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  if (Math.abs(dx) < 1e-10) {
    if (point1.x >= 0 && point1.x <= 500) {
      intersections.push({ x: point1.x, y: 0 });
      intersections.push({ x: point1.x, y: 500 });
    }
  } else {
    const slope = dy / dx;
    const intercept = point1.y - slope * point1.x;

    const candidates = [
      { x: 0, y: intercept },
      { x: 500, y: slope * 500 + intercept },
      { x: -intercept / slope, y: 0 },
      { x: (500 - intercept) / slope, y: 500 },
    ];

    candidates.forEach((candidate) => {
      if (
        candidate.x >= -1e-6 &&
        candidate.x <= 500 + 1e-6 &&
        candidate.y >= -1e-6 &&
        candidate.y <= 500 + 1e-6
      ) {
        intersections.push({
          x: Math.max(0, Math.min(500, candidate.x)),
          y: Math.max(0, Math.min(500, candidate.y)),
        });
      }
    });
  }

  return intersections.filter((intersection, index) => {
    return !intersections
      .slice(0, index)
      .some(
        (prev) =>
          Math.abs(prev.x - intersection.x) < 1e-6 &&
          Math.abs(prev.y - intersection.y) < 1e-6
      );
  });
};

export function sameSide(a: Point, b: Point, line: ClickCoordinates[]): boolean {
  if (line.length !== 2) return false;

  const [p1, p2] = line.map(coord => coord.graph);
  const side1 = (p2.x - p1.x) * (a.y - p1.y) - (p2.y - p1.y) * (a.x - p1.x) >= 0;
  const side2 = (p2.x - p1.x) * (b.y - p1.y) - (p2.y - p1.y) * (b.x - p1.x) >= 0;

  return side1 === side2;
}