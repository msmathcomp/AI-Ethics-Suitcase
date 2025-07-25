import type { DataPoint, ClickCoordinates, ClassificationResult, ClassificationCounts } from '../types';

export const getPointClassification = (
  point: DataPoint,
  lineCoords: ClickCoordinates[],
  area1IsRed: boolean | null,
  areaColorsAssigned: boolean
): ClassificationResult | null => {
  if (!areaColorsAssigned || lineCoords.length !== 2 || area1IsRed === null) {
    return null;
  }

  const [p1, p2] = lineCoords.map((coord) => coord.graph);

  const isLeftOfLine =
    (p2.x - p1.x) * (point.screen_time - p1.y) -
      (p2.y - p1.y) * (point.study_time - p1.x) >
    0;

  const isInRedArea = area1IsRed ? isLeftOfLine : !isLeftOfLine;

  const actuallyPass = point.type === "a";
  const classifiedAsPass = isInRedArea;

  if (actuallyPass && classifiedAsPass) return "TP";
  if (!actuallyPass && !classifiedAsPass) return "TN";
  if (!actuallyPass && classifiedAsPass) return "FP";
  if (actuallyPass && !classifiedAsPass) return "FN";
  return null;
};

export const getClassificationCounts = (
  data: DataPoint[],
  lineCoords: ClickCoordinates[],
  area1IsRed: boolean | null,
  areaColorsAssigned: boolean
): ClassificationCounts => {
  const counts = { TP: 0, TN: 0, FP: 0, FN: 0 };

  data.forEach((point) => {
    const classification = getPointClassification(
      point,
      lineCoords,
      area1IsRed,
      areaColorsAssigned
    );
    if (classification) {
      counts[classification as keyof typeof counts]++;
    }
  });

  return counts;
};
