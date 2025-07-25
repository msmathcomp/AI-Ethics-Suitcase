import seedrandom from "seedrandom";
import { randomNormal } from "d3-random";
import type { DataPoint } from "../types";


interface GenerateParams {
  samples: number;
  meanX: number;
  stdX: number;
  meanY: number;
  stdY: number;
  outlierRatio: number;
  passThreshold: number;
  seed?: number;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function generateDataPoints(params: GenerateParams): DataPoint[] {
  const {
    samples,
    meanX,
    stdX,
    meanY,
    stdY,
    outlierRatio,
    passThreshold,
    seed = 42,
  } = params;

  const rng = seedrandom(seed.toString());
  const normalX = randomNormal.source(rng)(meanX, stdX);
  const normalY = randomNormal.source(rng)(meanY, stdY);

  const points: DataPoint[] = [];
  const numOutliers = Math.floor(outlierRatio * samples);

  for (let i = 0; i < samples; i++) {
    let studyTime: number;
    let screenTime: number;

    if (i < numOutliers) {
      studyTime = 500 * rng();
      screenTime = 500 * rng();
    } else {
      studyTime = Math.min(500, Math.max(0, normalX()));
      screenTime = Math.min(500, Math.max(0, normalY()));
    }

    const score = studyTime - screenTime;
    const passProb = sigmoid((score - (passThreshold - 250)) / 40);
    const type: "a" | "b" = rng() < passProb ? "a" : "b";

    points.push({ study_time: studyTime, screen_time: screenTime, type });
  }

  return points;
}
