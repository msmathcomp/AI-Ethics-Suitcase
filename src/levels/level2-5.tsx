import { ClassificationVisualizer } from "~/components/ClassificationVisualizer";
import { useState, useMemo, useEffect } from "react";
import { ClassificationResultsEntry } from "~/components/ui/ClassificationResultsEntry";
import type { ClassificationCounts, LevelJsonShape, Point } from "~/types";
import { useLevelData } from "~/context/LevelDataContext";

// Static JSON imports for levels 2-5
import level2Json from "@/data/level2.json";
import level3Json from "@/data/level3.json";
import level4Json from "@/data/level4.json";
import level5Json from "@/data/level5.json";
import { useIntlayer } from "react-intlayer";
import LevelLayout from "~/components/layout/LevelLayout";

export default function Level2_5({ level }: { level: 2 | 3 | 4 | 5 }) {
  const { level2_5: content, common: commonContent } = useIntlayer("app");
  // const [stage, setStage] = useState(0);

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
    if (stage === 4 && results.TP + results.TN + results.FP + results.FN > 0) {
      recordLevelResult(level, "user", results);
    } else if (
      stage === 5 &&
      bestResults.TP + bestResults.TN + bestResults.FP + bestResults.FN > 0
    ) {
      recordLevelResult(level, "best", bestResults);
      markLevelCompleted(level);
    }
  }, [stage, recordLevelResult, level, results, bestResults]);

  return (
    <LevelLayout
      goalElement={
        content.goals[level.toString() as keyof typeof content.goals].value
      }
      classificationVisualizer={
        <ClassificationVisualizer
          key={`visualizer-${level}`}
          seenData={rawJson.data}
          visualizerData={getVisualizerData(level)}
          stage={stage}
          setStage={setStage}
          setResults={setResults}
          setBestResults={setBestResults}
          modifyVisualizerData={(modifyFn) =>
            modifyVisualizerData(level, modifyFn)
          }
          bestClassifier={{
            line: rawJson.best as Point[],
            originIsPass: rawJson.originIsPass,
          }}
        />
      }
      instruction={
        content.stages[stage.toString() as keyof typeof content.stages].value
      }
      instructionButton={
        stage === 3
          ? commonContent.buttons.next.value
          : stage === 4
          ? commonContent.buttons.compare.value
          : null
      }
      instructionButtonCallback={
        stage === 3 || stage === 4
          ? () => setStage((prev) => prev + 1)
          : undefined
      }
      classificationResults={
        stage >= 4 ? (
          <ClassificationResultsEntry
            classificationCounts={results}
            bestClassificationCounts={stage === 5 ? bestResults : undefined}
          />
        ) : null
      }
      showResults={stage >= 4}
      level={level}
      showNextLevelButton={stage === 5}
    />
  );
}
