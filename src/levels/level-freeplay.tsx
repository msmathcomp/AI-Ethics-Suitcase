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

  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(true);
  const [showTimerExpired, setShowTimerExpired] = useState(false);

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
    setResults({ TP: 0, TN: 0, FP: 0, FN: 0 });
    setBestResults({ TP: 0, TN: 0, FP: 0, FN: 0 });
    setUnseenResults({ TP: 0, TN: 0, FP: 0, FN: 0 });
    setUnseenBestResults({ TP: 0, TN: 0, FP: 0, FN: 0 });
  }, []);

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
      levelName={`${commonContent.level.value} ${level}`}
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
            line: levelJson.best,
            originIsPass: !levelJson.originIsPass,
          }}
          canModify={stage < 3}
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
              maximumTime={30}
              onFinish={() => {
                if (stage < 3) setStage(3);
                setShowTimerExpired(true);
              }}
              resetKey={resetCount}
              pause={stage > 3 || isTutorialDialogOpen}
              className="h-2"
            />
            <div 
              className={cn(
                "text-red-500 font-bold mt-2",
                !showTimerExpired && "opacity-0"
              )}
            >
              {content.timeExpired.value}
            </div>
          </div>
          <Dialog
            key={`tutorial-dialog-${level}`}
            choice={false}
            open={isTutorialDialogOpen}
            message={content.tutorialDialog.message.value}
            onYes={() => {
              setIsTutorialDialogOpen(false);
            }}
          />
        </>
      }
      showResults={stage >= 4}
      level={level}
      showNextLevelButton={stage === 6}
    />
  );
}
