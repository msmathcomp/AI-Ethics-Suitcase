import { ClassificationVisualizer } from "~/components/ClassificationVisualizer";
import { useState, useMemo, useEffect } from "react";
import { ClassificationResults } from "~/components/UI/ClassificationResults";
import type { ClassificationCounts, LevelJsonShape, Point } from "~/types";
import { useClassificationResults } from "~/context/ClassificationResultsContext";

// Static JSON imports for levels 2-5
import level2Json from "@/data/level2.json";
import level3Json from "@/data/level3.json";
import level4Json from "@/data/level4.json";
import level5Json from "@/data/level5.json";
import { useIntlayer } from "react-intlayer";
import LevelLayout from "~/components/layout/levelLayout";

export default function Level2_5({ level }: { level: 2 | 3 | 4 | 5 }) {
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
  const { recordLevelResult, reset } = useClassificationResults();

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
    if (level === 2) reset();
  }, [level, reset]);

  useEffect(() => {
    if (stage === 4 && results.TP + results.TN + results.FP + results.FN > 0) {
      recordLevelResult(level, "user", results);
    } else if (
      stage === 5 &&
      bestResults.TP + bestResults.TN + bestResults.FP + bestResults.FN > 0
    ) {
      recordLevelResult(level, "best", bestResults);
    }
  }, [stage, recordLevelResult, level, results, bestResults]);

  const goals = {
    2: "Level 2: Can you achieve 100% accuracy?",
    3: "Level 3: Can you still achieve 100% accuracy?",
    4: "Level 4: Try to achieve maximum possible accuracy!",
    5: "Level 5: Try to achieve maximum possible accuracy!",
  };

  return (
    <LevelLayout
      goalElement={<span>{goals[level!]}</span>}
      classificationVisualizer={
        <ClassificationVisualizer
          key={`visualizer-${level}`}
          seenData={rawJson.data}
          stage={stage}
          setStage={setStage}
          setResults={setResults}
          setBestResults={setBestResults}
          bestClassifier={{
            line: rawJson.best as Point[],
            originIsPass: rawJson.originIsPass,
          }}
        />
      }
      instruction={
        content.stages[
          Math.min(stage, 4).toString() as keyof typeof content.stages
        ].value
      }
      instructionButton={
        <div className="h-8 w-full flex justify-end">
          {(stage === 3 || stage === 4) && (
            <button
              className="bg-blue-500 text-white rounded w-20 h-full"
              onClick={() => setStage((prev) => prev + 1)}
            >
              {stage === 3 ? "Next" : "Compare"}
            </button>
          )}
        </div>
      }
      classificationResults={
        stage >= 4 ? (
          <ClassificationResults
            classificationCounts={results}
            bestClassificationCounts={stage === 5 ? bestResults : undefined}
          />
        ) : null
      }
      level={level}
      showNextLevelButton={stage === 5}
    />
  );
}
