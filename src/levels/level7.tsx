import { LevelProgressBar } from "~/components/UI/LevelProgressBar";
import Nav from "~/components/layout/Nav";
import { useMemo, useState, useEffect } from "react";
import { Legend } from "~/components/UI/Legend";
import { ClassificationResults } from "~/components/UI/ClassificationResults";
import type { ClassificationCounts, DataPoint, LevelJsonShape } from "~/types";
import { CurveVisualizer } from "~/components/CurveVisualizer";
import { useClassificationResults } from "~/context/ClassificationResultsContext";
import level7Json from "@/data/level7.json";
import { useIntlayer } from "react-intlayer";

export default function Level7() {
  const level = 7;
  const { level7: content } = useIntlayer("app");

  const [stage, setStage] = useState(0);

  const [results, setResults] = useState<ClassificationCounts>({
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

  const levelJson = useMemo(() => {
    return level7Json as LevelJsonShape & { testData: DataPoint[] };
  }, []);

  const { recordLevelResult } = useClassificationResults();
  useEffect(() => {
    if (stage === 4) {
      recordLevelResult({ level, user: results, unseen: unseenResults });
    }
  }, [stage, level, results, unseenResults, recordLevelResult]);

  return (
    <main className="h-screen w-screen flex flex-col items-center p-4">
      <Nav />
      <div className="flex w-full flex-1">
        <div className="h-full w-[30%] flex flex-col p-4 border-r-1">
          <LevelProgressBar
            level={level}
            showNextLevelButton={stage === 4}
            nextLevelButtonText="Finish"
          />
          <Legend />
          {stage >= 3 && (
            <ClassificationResults
              title={"Classification Results"}
              classificationCounts={results}
            />
          )}
          {stage === 4 && (
            <ClassificationResults
              title="Performance on Unseen Data"
              classificationCounts={unseenResults}
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
              {(stage === 2 || stage === 3) && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded my-auto"
                  onClick={() => setStage((prev) => prev + 1)}
                >
                  Next
                </button>
              )}
            </div>
          </div>
          <div
            className="h-[600px] w-full flex items-center justify-center relative py-10"
            style={{ touchAction: "none" }}
          >
            <CurveVisualizer
              data={levelJson.data}
              testData={levelJson.testData}
              stage={stage}
              setStage={setStage}
              setResults={setResults}
              setUnseenResults={setUnseenResults}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
