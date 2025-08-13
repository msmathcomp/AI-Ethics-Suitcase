import { LevelProgressBar } from "~/components/UI/LevelProgressBar";
import Nav from "~/components/layout/Nav";
import { ClassificationVisualizer } from "~/components/ClassificationVisualizer";
import { useState, useMemo, useEffect } from "react";
import { Legend } from "~/components/UI/Legend";
import { ClassificationResults } from "~/components/UI/ClassificationResults";
import type { ClassificationCounts, LevelJsonShape, Point } from "~/types";
import { useClassificationResults } from "~/context/ClassificationResultsContext";

// Static JSON imports for levels 2-5
import level2Json from "@/data/level2.json";
import level3Json from "@/data/level3.json";
import level4Json from "@/data/level4.json";
import level5Json from "@/data/level5.json";
import { useIntlayer } from "react-intlayer";

// const instructions = [
//   "Click to select the first point",
//   "Click to select the second point to draw a line",
//   "Drag the black circles to adjust the line, then click an area to classify as Pass",
//   "Adjust your classifier by rotating the line or creating a new one. When satisfied, click 'Next' to continue.",
//   "Complete! You can now see the classification results. You can compare your classifier with the best one.",
//   "Compare your classifier with the best solution. Both results are shown side by side.",
// ];

export default function Level2_5({ level }: { level: number }) {
  const { level2_5: content } = useIntlayer("app");
  const [stage, setStage] = useState(0);
  const [results, setResults] = useState<ClassificationCounts>({
    TP: 0,
    TN: 0,
    FP: 0,
    FN: 0,
  });
  const [bestResults, setBestResults] = useState<ClassificationCounts>({
    TP: 0,
    TN: 0,
    FP: 0,
    FN: 0,
  });
  const { recordLevelResult } = useClassificationResults();

  const rawJson: LevelJsonShape = useMemo(() => {
    const mapping: Record<number, LevelJsonShape> = {
      2: level2Json as LevelJsonShape,
      3: level3Json as LevelJsonShape,
      4: level4Json as LevelJsonShape,
      5: level5Json as LevelJsonShape,
    };
    return mapping[level] ?? (level2Json as LevelJsonShape);
  }, [level]);

  useEffect(() => {
    if (stage === 4) {
      recordLevelResult({ level, user: results, best: bestResults });
    }
  }, [stage, recordLevelResult, level, results, bestResults]);

  return (
    <main className="h-screen w-screen flex flex-col items-center p-4">
      <Nav />
      <div className="flex w-full flex-1">
        <div className="h-full w-[30%] flex flex-col p-4 border-r-1">
          <LevelProgressBar level={level} showNextLevelButton={stage === 5} />
          <Legend />
          {stage >= 4 && (
            <ClassificationResults
              classificationCounts={results}
              bestClassificationCounts={stage === 5 ? bestResults : undefined}
            />
          )}
        </div>
        <div className="flex-1 h-full flex flex-col items-center">
          <div
            className="flex p-4 border-b-1 w-full h-[100px] justify-center"
            id="instruction"
          >
            <h2 className="text-xl font-medium mb-2 break-words flex-1">
              {
                content.stages[
                  Math.min(stage, 4).toString() as keyof typeof content.stages
                ].value
              }
            </h2>
            <div className="w-24 h-full">
              {stage === 3 && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded my-auto"
                  onClick={() => setStage(4)}
                >
                  Next
                </button>
              )}
              {stage === 4 && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded my-auto"
                  onClick={() => setStage(5)}
                >
                  Compare
                </button>
              )}
            </div>
          </div>
          <div className="h-[600px] w-full flex items-center justify-center relative py-10">
            <ClassificationVisualizer
              key={`visualizer-${level}`}
              data={rawJson.data}
              stage={stage}
              setStage={setStage}
              setResults={setResults}
              setBestResults={setBestResults}
              bestClassifier={{
                line: rawJson.best as Point[],
                originIsPass: rawJson.originIsPass,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
