export interface DataPoint {
  study_time: number;
  screen_time: number;
  type: "Pass" | "Fail";
}

export type Point = { x: number; y: number };

export type ClickCoordinates = {
  graph: Point;
  overlay: Point;
};

export type AreaPolygons = {
  area1: {
    graph: Point[];
    overlay: Point[];
  }
  area2: {
    graph: Point[];
    overlay: Point[];
  }
};

export type ClassificationResult = "TP" | "TN" | "FP" | "FN";

export type ClassificationCounts = {
  TP: number;
  TN: number;
  FP: number;
  FN: number;
};

export interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: DataPoint;
}

export interface ClassificationVisualizerProps {
  data: DataPoint[];
}

export interface LevelJsonShape {
  data: DataPoint[];
  best: { x: number; y: number }[];
  originIsPass: boolean;
  testData?: DataPoint[];
}

// class Coordinate {
//   public graph: Point;
//   public overlay: Point;
//   public graphToOverlay: (point: Point) => Point;
//   public overlayToGraph: (point: Point) => Point;

//   constructor(graph: Point, overlay: Point, graphToOverlay: (point: Point) => Point, overlayToGraph: (point: Point) => Point) {
//     this.graph = graph;
//     this.overlay = overlay;
//     this.graphToOverlay = graphToOverlay;
//     this.overlayToGraph = overlayToGraph;
//   }

//   static fromGraph(graph: Point, graphToOverlay: (point: Point) => Point, overlayToGraph: (point: Point) => Point): Coordinate {
//     const overlay = graphToOverlay(graph);
//     const coordinate = new Coordinate(graph, overlay, graphToOverlay, overlayToGraph);
//     coordinate.graphToOverlay = graphToOverlay;
//     return coordinate;
//   }

//   static fromOverlay(overlay: Point, graphToOverlay: (point: Point) => Point, overlayToGraph: (point: Point) => Point): Coordinate {
//     const graph = overlayToGraph(overlay);
//     const coordinate = new Coordinate(graph, overlay, graphToOverlay, overlayToGraph);
//     coordinate.overlayToGraph = overlayToGraph;
//     return coordinate;
//   }
// }