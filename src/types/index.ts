export interface DataPoint {
  study_time: number;
  screen_time: number;
  type: "a" | "b";
}

export type Point = { x: number; y: number };

export type ClickCoordinates = { 
  graph: Point; 
  overlay: Point; 
};

export type AreaPolygons = {
  area1: Point[];
  area2: Point[];
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