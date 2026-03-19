import type { DataPoint, ClickCoordinates, ClassificationResult, ClassificationCounts } from '~/types';
import { getLineNormal, onLine, sameSide } from './geometry';

// Classifies a single data point as TP, TN, FP, FN or null based on its position relative to a reference line and origin.
export const getPointClassification = (
  point: DataPoint,
  lineCoords: ClickCoordinates[],
  originIsPass: boolean | null,
  areaColorsAssigned: boolean
): ClassificationResult | null => {
  if (!areaColorsAssigned || lineCoords.length !== 2 || originIsPass === null) {
    return null;
  }

  const p = { x: point.study_time, y: point.screen_time };

  // Determine if the point is on the same side of the line as the origin 
  // If the origin is on the line, use the line normal to determine sides instead
  let pointIsOnOriginSide: boolean;
  if (onLine({ x: 0, y: 0 }, lineCoords)) {
    const lineNormal = getLineNormal(lineCoords[0].graph, lineCoords[1].graph);
    pointIsOnOriginSide = sameSide(lineNormal, p, lineCoords);
  } 
  else {
    pointIsOnOriginSide = sameSide(p, { x: 0, y: 0 }, lineCoords)
  }

  const classifiedAsPass = pointIsOnOriginSide ? originIsPass : !originIsPass;

  const actuallyPass = point.type === "Pass";

  if (actuallyPass && classifiedAsPass) return "TP";
  if (!actuallyPass && !classifiedAsPass) return "TN";
  if (!actuallyPass && classifiedAsPass) return "FP";
  if (actuallyPass && !classifiedAsPass) return "FN";
  return null;
};

// Aggregates classification counts (TP, TN, FP, FN) for a dataset using getPointClassification.
export const getClassificationCounts = (
  data: DataPoint[],
  lineCoords: ClickCoordinates[],
  originIsPass: boolean | null,
  areaColorsAssigned: boolean
): ClassificationCounts => {
  const counts = { TP: 0, TN: 0, FP: 0, FN: 0 };

  data.forEach((point) => {
    const classification = getPointClassification(
      point,
      lineCoords,
      originIsPass,
      areaColorsAssigned
    );
    if (classification) {
      counts[classification as keyof typeof counts]++;
    }
  });

  return counts;
};
