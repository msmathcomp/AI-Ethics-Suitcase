import { ClassificationVisualizer } from "~/components/ClassificationVisualizer";
import { useMemo, useState, useEffect } from "react";
import { ClassificationResultsEntry } from "~/components/ui/ClassificationResultsEntry";
import type { ClassificationCounts, LevelJsonShape } from "~/types";
import { useLevelData } from "~/context/LevelDataContext";
import { useIntlayer } from "react-intlayer";
import LevelLayout from "~/components/layout/LevelLayout";
import TimerBar from "~/components/ui/TimerBar";
import Dialog from "~/components/ui/Dialog";
import { cn } from "~/utils/cn";
import { Button } from "~/components/ui/Button";
import { EMPTY_COUNTS } from "~/utils/classification";

const DIFFICULTIES = {
  easy: 30,
  medium: 15,
  hard: 5
}

export default function LevelFreeplay() {
  const level = 8;
  const {
    levelfreeplay: content,
    common: commonContent,
    classificationResults: classifcationResultsContent,
  } = useIntlayer("app");

  const {
    dataByLevel,
    getStage,
    setStage: setStageByLevel,
    recordLevelResult,
    getVisualizerData,
    modifyVisualizerData,
    markLevelCompleted,
    resetLevelData,
  } = useLevelData();

  const stage = getStage(level);
  const setStage = (newStage: number | ((old: number) => number)) => {
    setStageByLevel(level, typeof newStage === "number" ? newStage : newStage(stage));
  };
  const resetCount = useMemo(() => dataByLevel.get(level)?.resetCount || 0, [dataByLevel, level]);

  const [results, setResults] = useState<ClassificationCounts>(EMPTY_COUNTS);
  const [bestResults, setBestResults] = useState<ClassificationCounts>(EMPTY_COUNTS);
  const [unseenResults, setUnseenResults] = useState<ClassificationCounts>(EMPTY_COUNTS);
  const [unseenBestResults, setUnseenBestResults] = useState<ClassificationCounts>(EMPTY_COUNTS);

  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(true);
  const [showTimerExpired, setShowTimerExpired] = useState(false);

  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTIES>("easy");
  const chooseDifficulty = (d: keyof typeof DIFFICULTIES) => {
    setDifficulty(d);
    setIsTutorialDialogOpen(false);
  }

  // Choose a random dataset from the freeplay folder
  const updateLevelJson = () => {
    const modules = import.meta.glob('/data/freeplay/*.json', {
      eager: true,
    });

    const values = Object.values(modules);
    const random = values[Math.floor(Math.random() * values.length)];
    const data = (random as { default: LevelJsonShape }).default;

    return data;
  };
  const levelJson: LevelJsonShape = useMemo(updateLevelJson, [ resetCount ]);

  useEffect(() => {
    resetLevelData(level);
  }, []);

  useEffect(() => {
    setResults(EMPTY_COUNTS);
    setBestResults(EMPTY_COUNTS);
    setUnseenResults(EMPTY_COUNTS);
    setUnseenBestResults(EMPTY_COUNTS);

    setIsTutorialDialogOpen(true);
    setShowTimerExpired(false);
    setStage(0);
  }, [resetCount]);

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
      markLevelCompleted(level);
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
      levelName={
        content.levelName.value +
        (isTutorialDialogOpen
          ? ""
          : ` - ${content.tutorialDialog.difficulty[difficulty].value} (${DIFFICULTIES[difficulty]}s)`)
      }
      goalElement={content.goal.value}
      classificationVisualizer={
        <ClassificationVisualizer
          key={`visualizer-${level}`}
          seenData={levelJson.data}
          unseenData={levelJson.testData}
          visualizerData={getVisualizerData(level)}
          stage={stage}
          setStage={setStage}
          setResults={setResults}
          setBestResults={setBestResults}
          setUnseenResults={setUnseenResults}
          setUnseenBestResults={setUnseenBestResults}
          modifyVisualizerData={(modifyFn) =>
            modifyVisualizerData(level, modifyFn)
          }
          bestClassifier={{
            line: levelJson.best,
            originIsPass: levelJson.originIsPass,
          }}
          canModify={stage < 4}
        />
      }
      instruction={
        content.stages[stage.toString() as keyof typeof content.stages].value
      }
      instructionButton={(() => {
        if (stage === 3) return commonContent.buttons.finish.value;
        if (stage === 4) return commonContent.buttons.compare.value;
        return null;
      })()}
      instructionButtonCallback={() => {
        if (stage === 3)
          setStage(6); // skip over stage 4, 5: automatically go to final comparison
        else if (stage === 4) setStage(6);
        else if (stage === 5) setStage(6);
      }}
      classificationResults={
        <>
          {stage >= 4 && (
            <ClassificationResultsEntry
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
            <ClassificationResultsEntry
              title={content.titles.unseenPerformance.value}
              classificationCounts={unseenResults}
              bestClassificationCounts={unseenBestResults}
            />
          )}
        </>
      }
      extraElement={
        <>
          <div>
            <TimerBar
              key={`timer-${level}`}
              maximumTime={DIFFICULTIES[difficulty]}
              onFinish={() => {
                if (stage < 6) setStage(6); // skip to final stage
                setShowTimerExpired(true);
              }}
              resetKey={resetCount}
              pause={stage > 3 || isTutorialDialogOpen}
              className="h-2"
            />
            <div
              className={cn(
                "text-red-500 font-bold mt-2",
                !showTimerExpired && "opacity-0",
              )}
            >
              {content.timeExpired.value}
            </div>
          </div>
          <Dialog
            key={level}
            choice={false}
            open={isTutorialDialogOpen}
            message={content.tutorialDialog.message.value}
            buttons={(
              ["easy", "medium", "hard"] as (keyof typeof DIFFICULTIES)[]
            ).map((d) => (
              <Button
                key={d}
                buttonType="primary"
                onClick={() => chooseDifficulty(d)}
              >
                {content.tutorialDialog.difficulty[d].value +
                  ` (${DIFFICULTIES[d]}s)`}
              </Button>
            ))}
          />
        </>
      }
      showResults={stage >= 4}
      level={level}
      showNextLevelButton={stage === 6}
    />
  );
}
