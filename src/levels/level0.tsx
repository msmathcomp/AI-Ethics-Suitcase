import { ClassificationVisualizer } from "~/components/ClassificationVisualizer";
import { useEffect, useState } from "react";
import { ClassificationResults } from "~/components/ui/ClassificationResults";
import type { DataPoint, ClassificationCounts } from "~/types";
import { useIntlayer } from "react-intlayer";
import LevelLayout from "~/components/layout/LevelLayout";
import { useLevelData } from "~/context/LevelDataContext";

const data: DataPoint[] = [
  { study_time: 100, screen_time: 300, type: "Fail" },
  { study_time: 350, screen_time: 300, type: "Fail" },
  { study_time: 100, screen_time: 150, type: "Pass" },
  { study_time: 350, screen_time: 150, type: "Pass" },
];

export default function Level0() {
  const level = 0;
  const [results, setResults] = useState<ClassificationCounts>({
    TP: 0,
    TN: 0,
    FP: 0,
    FN: 0,
  });
  const { level0: content, common: commonContent } = useIntlayer("app");

  const {
    markLevelCompleted,
    getStage, setStage: setLevelStage,
    getVisualizerData,
    modifyVisualizerData
  } = useLevelData();

  const stage = getStage(1);
  const setStage = (newStage: number) => {
    setLevelStage(1, newStage);
  }

  useEffect(() => {
    if (stage === 4) {
      markLevelCompleted(level);
    }
  }, [stage, markLevelCompleted, level]);

  return (
    <LevelLayout
      goalElement={content.goal.value}
      classificationVisualizer={
        <ClassificationVisualizer
          key={`visualizer-${level}`}
          seenData={data}
          visualizerData={getVisualizerData(level)}
          stage={stage}
          setStage={setStage}
          setResults={setResults}
          modifyVisualizerData={(modifyFn) =>
            modifyVisualizerData(level, modifyFn)
          }
          bestClassifier={{ line: [], originIsPass: true }} // irrelevant for this level
        />
      }
      instruction={
        content.stages[
          Math.min(stage, 4).toString() as keyof typeof content.stages
        ].value
      }
      instructionButton={stage === 3 ? commonContent.buttons.next.value : null}
      instructionButtonCallback={() => setStage(4)}
      classificationResults={
        stage === 4 ? (
          <ClassificationResults classificationCounts={results} />
        ) : null
      }
      level={level}
      showNextLevelButton={stage === 4}
    />
  );
}
