import type { Point, ClickCoordinates, AreaPolygons } from "~/types";

export const getAreaPolygons = (
  lineCoords: ClickCoordinates[],
  graphToOverlayCoords: (point: Point) => Point
): AreaPolygons => {
  if (lineCoords.length !== 2)
    return {
      area1: {
        graph: [],
        overlay: [],
      },
      area2: { graph: [], overlay: [] },
    };

  const [p1, p2] = lineCoords.map((coord) => coord.graph);
  const refCorner = { x: 500, y: 0 };

  const cornersExceptRefCorner = [
    { x: 0, y: 0 },
    { x: 500, y: 500 },
    { x: 0, y: 500 },
  ];

  const createPolygon = (hasRefCorner: boolean): Point[] => {
    const polygon: Point[] = [];

    polygon.push(p1, p2);

    if (hasRefCorner) {
      polygon.push(refCorner);
    }

    for (const corner of cornersExceptRefCorner) {
      if (sameSide(corner, refCorner, lineCoords) === hasRefCorner) {
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

    const area1OverlayCoords = area1.map((coord) =>
      graphToOverlayCoords(coord)
    );
    const area2OverlayCoords = area2.map((coord) =>
      graphToOverlayCoords(coord)
    );

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
    return {
      area1: { graph: [], overlay: [] },
      area2: { graph: [], overlay: [] },
    };
  }
};

export const getExtendedLinePoints = (
  graphToOverlayCoords: (point: Point) => Point,
  lineCoords: [Point, Point],
  boundingBox: [Point, Point] = [{ x: 0, y: 0 }, { x: 500, y: 500 }],
  extendedBoxOffset: number = 30
): ClickCoordinates[] => {
  if (lineCoords.length !== 2) return [];

  const [p1, p2] = lineCoords;

  const [extendedP1, extendedP2] = findIntersectionsWithSquare(
    p1, p2,
    {
      x: boundingBox[0].x - extendedBoxOffset,
      y: boundingBox[0].y - extendedBoxOffset,
    },
    {
      x: boundingBox[1].x + extendedBoxOffset,
      y: boundingBox[1].y + extendedBoxOffset,
    }
  );

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

  const uniqueIntersections = intersections.filter((intersection, index) => {
    return !intersections
      .slice(0, index)
      .some(
        (prev) =>
          Math.abs(prev.x - intersection.x) < 1e-6 &&
          Math.abs(prev.y - intersection.y) < 1e-6
      );
  });

  return uniqueIntersections;
};

export const findIntersectionsWithSquare = (
  point1: Point,
  point2: Point,
  squareCorner1: Point = { x: 0, y: 0 },
  squareCorner2: Point = { x: 500, y: 500 }
): Point[] => {
  const intersections: Point[] = [];
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  const lenSq = dx * dx + dy * dy;
  const paramT = (p: Point) =>
    ((p.x - point1.x) * dx + (p.y - point1.y) * dy) / lenSq;

  const sq1 = squareCorner1;
  const sq2 = squareCorner2;

  if (Math.abs(dx) < 1e-10) {
    if (point1.x >= sq1.x && point1.x <= sq2.x) {
      intersections.push({ x: point1.x, y: sq1.y });
      intersections.push({ x: point1.x, y: sq2.y });
    }
  } else {
    const slope = dy / dx;
    const intercept = point1.y - slope * point1.x;

    const candidates = [
      { x: sq1.x, y: slope * sq1.y + intercept },
      { x: sq2.x, y: slope * sq2.y + intercept },
      { x: (sq1.x - intercept) / slope, y: sq1.y },
      { x: (sq2.x - intercept) / slope, y: sq2.y },
    ];

    candidates.forEach((candidate) => {
      if (
        candidate.x >= sq1.x - 1e-6 &&
        candidate.x <= sq2.x + 1e-6 &&
        candidate.y >= sq1.y - 1e-6 &&
        candidate.y <= sq2.y + 1e-6
      ) {
        intersections.push({
          x: Math.max(sq1.x, Math.min(sq2.x, candidate.x)),
          y: Math.max(sq1.y, Math.min(sq2.y, candidate.y)),
        });
      }
    });
  }

  return intersections
    .filter((intersection, index) => {
      return !intersections
        .slice(0, index)
        .some(
          (prev) =>
            Math.abs(prev.x - intersection.x) < 1e-6 &&
            Math.abs(prev.y - intersection.y) < 1e-6
        );
    })
    .sort((a, b) => paramT(a) - paramT(b));
};

export function sameSide(
  a: Point,
  b: Point,
  line: ClickCoordinates[]
): boolean {
  if (line.length !== 2) return false;

  const [p1, p2] = line.map((coord) => coord.graph);
  const side1 =
    (p2.x - p1.x) * (a.y - p1.y) - (p2.y - p1.y) * (a.x - p1.x) >= 0;
  const side2 =
    (p2.x - p1.x) * (b.y - p1.y) - (p2.y - p1.y) * (b.x - p1.x) >= 0;

  return side1 === side2;
}

export function graphToOverlayCoords(
  overlayRef: React.RefObject<HTMLDivElement | null>,
  chartContainerRef: React.RefObject<HTMLDivElement | null>,
  point: Point
): Point {
  if (!overlayRef.current || !chartContainerRef.current)
    throw new Error("Refs not set");
  const overlayRect = overlayRef.current.getBoundingClientRect();
  const graphElement = chartContainerRef.current.querySelector(
    ".recharts-cartesian-grid"
  ) as SVGElement | null;

  if (!graphElement) {
    throw new Error("Graph element not found");
  }

  const graphRect = graphElement.getBoundingClientRect();

  const normalize_y = graphRect.height / 500;
  const normalize_x = graphRect.width / 500;

  const overlayX = graphRect.left + point.x * normalize_x - overlayRect.left;
  const overlayY =
    graphRect.top + (500 - point.y) * normalize_y - overlayRect.top;

  return { x: overlayX, y: overlayY };
}
