import { useMemo, useState, useEffect } from "react";
import { ClassificationResults } from "~/components/UI/ClassificationResults";
import type { ClassificationCounts, DataPoint, LevelJsonShape } from "~/types";
import { CurveVisualizer } from "~/components/CurveVisualizer";
import { useClassificationResults } from "~/context/ClassificationResultsContext";
import level7Json from "@/data/level7.json";
import { useIntlayer } from "react-intlayer";
import LevelLayout from "~/components/layout/levelLayout";

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
    if (stage === 3 && results.TP + results.TN + results.FP + results.FN > 0) {
      recordLevelResult(level, "user", results);
    } else if (
      stage === 4 &&
      unseenResults.TP +
        unseenResults.TN +
        unseenResults.FP +
        unseenResults.FN >
        0
    ) {
      recordLevelResult(level, "unseen", unseenResults);
    }
  }, [stage, recordLevelResult, level, results, unseenResults]);

  return (
    <LevelLayout
      goalElement={<span>Level 7: Classifying using a curve!</span>}
      classificationVisualizer={
        <CurveVisualizer
          key={`visualizer-${level}`}
          seenData={levelJson.data}
          unseenData={levelJson.testData}
          stage={stage}
          setStage={setStage}
          setResults={setResults}
          setUnseenResults={setUnseenResults}
        />
      }
      instruction={
        content.stages[stage.toString() as keyof typeof content.stages].value
      }
      instructionButton={
        <div className="h-8 w-full flex justify-end">
          {[2, 3].includes(stage) && (
            <button
              className="bg-blue-500 text-white rounded w-20 h-full"
              onClick={() => setStage((prev) => prev + 1)}
            >
              Next
            </button>
          )}
        </div>
      }
      classificationResults={
        <>
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
        </>
      }
      level={level}
      showNextLevelButton={stage === 4}
    />
  );
}
