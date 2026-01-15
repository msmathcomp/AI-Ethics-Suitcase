import { useMemo, useState, useEffect } from "react";
import { ClassificationResultsEntry } from "~/components/ui/ClassificationResultsEntry";
import type { ClassificationCounts, DataPoint, LevelJsonShape } from "~/types";
import { CurveVisualizer } from "~/components/CurveVisualizer";
import { useLevelData } from "~/context/LevelDataContext";
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

  const {
    getStage,
    setStage: setStageByLevel,
    recordLevelResult,
    getVisualizerData,
    modifyVisualizerData,
    markLevelCompleted,
  } = useLevelData();

  const stage = getStage(level);
  const setStage = (newStage: number | ((old: number) => number)) => {
    setStageByLevel(level, typeof newStage === "number" ? newStage : newStage(stage));
  };

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
      markLevelCompleted(level);
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
          visualizerData={getVisualizerData(level)}
          stage={stage}
          setStage={setStage}
          setResults={setResults}
          setUnseenResults={setUnseenResults}
          modifyVisualizerData={(modifyFn) =>
            modifyVisualizerData(level, modifyFn)
          }
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
            <ClassificationResultsEntry
              title={classifcationResultsContent.title.value}
              classificationCounts={results}
            />
          )}
          {stage === 4 && (
            <ClassificationResultsEntry
              title={content.titles.unseenPerformance.value}
              classificationCounts={unseenResults}
            />
          )}
        </>
      }
      showResults={stage >= 3}
      level={level}
      showNextLevelButton={stage === 4}
    />
  );
}
