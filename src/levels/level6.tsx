import { ClassificationVisualizer } from "~/components/ClassificationVisualizer";
import { useMemo, useState, useEffect } from "react";
import { ClassificationResults } from "~/components/UI/ClassificationResults";
import type { ClassificationCounts, DataPoint, LevelJsonShape } from "~/types";
import { useClassificationResults } from "~/context/ClassificationResultsContext";
import level6Json from "@/data/level6.json";
import { useIntlayer } from "react-intlayer";
import LevelLayout from "~/components/layout/levelLayout";

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
    if (stage === 4 && results.TP + results.TN + results.FP + results.FN > 0) {
      recordLevelResult(level, "user", results);
    } else if (
      stage === 5 &&
      bestResults.TP + bestResults.TN + bestResults.FP + bestResults.FN > 0
    ) {
      recordLevelResult(level, "best", bestResults);
    } else if (
      stage === 6 &&
      unseenResults.TP +
        unseenResults.TN +
        unseenResults.FP +
        unseenResults.FN >
        0
    ) {
      recordLevelResult(level, "unseen", unseenResults);
      recordLevelResult(level, "unseenBest", unseenBestResults);
    }
  }, [
    stage,
    recordLevelResult,
    level,
    results,
    bestResults,
    unseenResults,
    unseenBestResults,
  ]);

  return (
    <LevelLayout
      goalElement={"Level 6: Test your classifier on unseen data!"}
      classificationVisualizer={
        <ClassificationVisualizer
          key={`visualizer-${level}`}
          seenData={levelJson.data}
          unseenData={levelJson.testData}
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
      }
      instruction={
        content.stages[stage.toString() as keyof typeof content.stages].value
      }
      instructionButton={
        <div className="h-8 w-full flex justify-end">
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
      }
      classificationResults={
        <>
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
        </>
      }
      level={level}
      showNextLevelButton={stage === 6}
    />
  );
}
