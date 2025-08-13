import type {
  DataPoint,
  ClassificationResult,
  ClassificationCounts,
  AreaPolygons,
} from "~/types";
import { isPointInPolygon } from "./geometry_curve";

export const getPointClassification_Curve = (
  point: DataPoint,
  areaPolygons: AreaPolygons,
  area1IsRed: boolean | null
): ClassificationResult | null => {
  if (area1IsRed === null || areaPolygons.area1.graph.length === 0) return null;

  let classifiedAsPass = false;


  if (isPointInPolygon({
    x: point.study_time,
    y: point.screen_time
  }, areaPolygons.area1.graph) && area1IsRed) {
    classifiedAsPass = true;
  } else if (isPointInPolygon({
    x: point.study_time,
    y: point.screen_time
  }, areaPolygons.area2.graph) && !area1IsRed) {
    classifiedAsPass = true;
  }

  const actuallyPass = point.type === "Pass";

  if (actuallyPass && classifiedAsPass) return "TP";
  if (!actuallyPass && !classifiedAsPass) return "TN";
  if (!actuallyPass && classifiedAsPass) return "FP";
  if (actuallyPass && !classifiedAsPass) return "FN";
  return null;
};

export const getClassificationCounts_Curve = (
  data: DataPoint[],
  areaPolygons: AreaPolygons,
  area1IsRed: boolean | null
): ClassificationCounts => {
  const counts = { TP: 0, TN: 0, FP: 0, FN: 0 };

  console.log("Debug", areaPolygons, area1IsRed)

  data.forEach((point) => {
    const classification = getPointClassification_Curve(
      point,
      areaPolygons,
      area1IsRed
    );
    if (classification) {
      counts[classification as keyof typeof counts]++;
    }
  });

  return counts;
};
