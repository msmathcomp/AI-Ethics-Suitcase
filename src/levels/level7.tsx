import { useMemo, useState, useEffect } from "react";
import { ClassificationResults } from "~/components/ui/ClassificationResults";
import type { ClassificationCounts, DataPoint, LevelJsonShape } from "~/types";
import { CurveVisualizer } from "~/components/CurveVisualizer";
import { useClassificationResults } from "~/context/ClassificationResultsContext";
import level7Json from "@/data/level7.json";
import { useIntlayer } from "react-intlayer";
import LevelLayout from "~/components/layout/LevelLayout";

export default function Level7() {
  const level = 7;
  const {
    level7: content,
    common: commonContent,
    classificationResults: classifcationResultsContent,
  } = useIntlayer("app");

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
      goalElement={content.goal.value}
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
        [2, 3].includes(stage) ? commonContent.buttons.next.value : null
      }
      instructionButtonCallback={() => setStage((prev) => prev + 1)}
      classificationResults={
        <>
          {stage >= 3 && (
            <ClassificationResults
              title={classifcationResultsContent.title.value}
              classificationCounts={results}
            />
          )}
          {stage === 4 && (
            <ClassificationResults
              title={content.titles.unseenPerformance.value}
              classificationCounts={unseenResults}
            />
          )}
        </>
      }
      level={level}
      stage={stage}
    />
  );
}
