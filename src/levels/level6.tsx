import { LevelProgressBar } from "~/components/UI/LevelProgressBar";
import Nav from "~/components/layout/Nav";
import { ClassificationVisualizer } from "~/components/ClassificationVisualizer";
import { useMemo, useState, useEffect } from "react";
import { Legend } from "~/components/UI/Legend";
import { ClassificationResults } from "~/components/UI/ClassificationResults";
import type { ClassificationCounts, DataPoint, LevelJsonShape } from "~/types";
import { useClassificationResults } from "~/context/ClassificationResultsContext";
import level6Json from "@/data/level6.json";
import { useIntlayer } from "react-intlayer";

export default function Level6() {
  const level = 6;
  const { level6: content } = useIntlayer("app");
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
  const [unseenResults, setUnseenResults] = useState<ClassificationCounts>({
    TP: 0,
    TN: 0,
    FP: 0,
    FN: 0,
  });
  const [unseenBestResults, setUnseenBestResults] =
    useState<ClassificationCounts>({
      TP: 0,
      TN: 0,
      FP: 0,
      FN: 0,
    });

  const levelJson = useMemo(() => {
    return level6Json as LevelJsonShape & { testData: DataPoint[] };
  }, []);

  const { recordLevelResult } = useClassificationResults();

  useEffect(() => {
    if (stage === 6) {
      recordLevelResult({
        level,
        user: results,
        best: bestResults,
        unseen: unseenResults,
        unseenBest: unseenBestResults,
      });
    }
  }, [
    bestResults,
    recordLevelResult,
    results,
    stage,
    unseenBestResults,
    unseenResults,
  ]);

  return (
    <main className="h-screen w-screen flex flex-col items-center p-4">
      <Nav />
      <div className="flex w-full flex-1">
        <div className="h-full w-[30%] flex flex-col p-4 border-r-1">
          <LevelProgressBar level={level} showNextLevelButton={stage === 6} />
          <Legend />
          {stage >= 4 && (
            <ClassificationResults
              title={stage === 6 ? "Performance on Training Data" : undefined}
              classificationCounts={results}
              bestClassificationCounts={stage >= 5 ? bestResults : undefined}
            />
          )}
          {stage === 6 && (
            <ClassificationResults
              title="Performance on Unseen Data"
              classificationCounts={unseenResults}
              bestClassificationCounts={unseenBestResults}
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
              }{" "}
            </h2>
            <div className="h-full">
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
              {stage === 5 && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded my-auto"
                  onClick={() => setStage(6)}
                >
                  Next
                </button>
              )}
            </div>
          </div>
          <div className="h-[600px] w-full flex items-center justify-center relative py-10">
            <ClassificationVisualizer
              key={`visualizer-${level}`}
              data={levelJson.data}
              testData={levelJson.testData}
              stage={stage}
              setStage={setStage}
              setResults={(res) => setResults(res)}
              setBestResults={(res) => setBestResults(res)}
              setUnseenResults={(res) => setUnseenResults(res)}
              setUnseenBestResults={(res) => setUnseenBestResults(res)}
              bestClassifier={{
                line: level6Json.best,
                originIsPass: level6Json.originIsPass,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
