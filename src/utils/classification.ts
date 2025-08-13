import type { DataPoint, ClickCoordinates, ClassificationResult, ClassificationCounts } from '~/types';
import { sameSide } from './geometry';

export const getPointClassification = (
  point: DataPoint,
  lineCoords: ClickCoordinates[],
  originIsPass: boolean | null,
  areaColorsAssigned: boolean
): ClassificationResult | null => {
  if (!areaColorsAssigned || lineCoords.length !== 2 || originIsPass === null) {
    return null;
  }

  const pointIsOnOriginSide = sameSide({ x: point.study_time, y: point.screen_time }, { x: 0, y: 0 }, lineCoords);

  // If point is on same side as origin, use originIsPass to determine classification
  const classifiedAsPass = pointIsOnOriginSide ? originIsPass : !originIsPass;

  const actuallyPass = point.type === "Pass";

  if (actuallyPass && classifiedAsPass) return "TP";
  if (!actuallyPass && !classifiedAsPass) return "TN";
  if (!actuallyPass && classifiedAsPass) return "FP";
  if (actuallyPass && !classifiedAsPass) return "FN";
  return null;
};

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
