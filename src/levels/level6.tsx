import { ClassificationVisualizer } from "~/components/ClassificationVisualizer";
import { useMemo, useState, useEffect } from "react";
import { ClassificationResults } from "~/components/ui/ClassificationResults";
import type { ClassificationCounts, DataPoint, LevelJsonShape } from "~/types";
import { useLevelData } from "~/context/ClassificationResultsContext";
import level6Json from "@/data/level6.json";
import { useIntlayer } from "react-intlayer";
import LevelLayout from "~/components/layout/LevelLayout";

export default function Level6() {
  const level = 6;
  const {
    level6: content,
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

  const { recordLevelResult, getVisualizerData, modifyVisualizerData } = useLevelData();

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
      goalElement={content.goal.value}
      classificationVisualizer={
        <ClassificationVisualizer
          key={`visualizer-${level}`}
          seenData={levelJson.data}
          unseenData={levelJson.testData}
          visualizerData={getVisualizerData(level)}
          stage={stage}
          setStage={setStage}
          setResults={(res) => setResults(res)}
          setBestResults={(res) => setBestResults(res)}
          setUnseenResults={(res) => setUnseenResults(res)}
          setUnseenBestResults={(res) => setUnseenBestResults(res)}
          modifyVisualizerData={(modifyFn) =>
            modifyVisualizerData(level, modifyFn)
          }
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
        [3, 5].includes(stage)
          ? commonContent.buttons.next.value
          : stage === 4
          ? commonContent.buttons.compare.value
          : null
      }
      instructionButtonCallback={() => {
        if (stage === 3) setStage(4);
        else if (stage === 4) setStage(5);
        else if (stage === 5) setStage(6);
      }}
      classificationResults={
        <>
          {stage >= 4 && (
            <ClassificationResults
              title={
                stage === 6
                  ? content.titles.trainingPerformance.value
                  : classifcationResultsContent.title.value
              }
              classificationCounts={results}
              bestClassificationCounts={stage >= 5 ? bestResults : undefined}
            />
          )}
          {stage === 6 && (
            <ClassificationResults
              title={content.titles.unseenPerformance.value}
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
