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