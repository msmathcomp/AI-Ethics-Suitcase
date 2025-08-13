import { LevelProgressBar } from "~/components/UI/LevelProgressBar";
import Nav from "~/components/layout/Nav";
import { ClassificationVisualizer } from "~/components/ClassificationVisualizer";
import { useState } from "react";
import { Legend } from "~/components/UI/Legend";
import { ClassificationResults } from "~/components/UI/ClassificationResults";
import type { DataPoint, ClassificationCounts } from "~/types";
import { useIntlayer } from "react-intlayer";

const data: DataPoint[] = [
  { study_time: 100, screen_time: 300, type: "Fail" },
  { study_time: 350, screen_time: 300, type: "Fail" },
  { study_time: 100, screen_time: 150, type: "Pass" },
  { study_time: 350, screen_time: 150, type: "Pass" },
];

export default function Level0() {
  const level = 0;
  const [stage, setStage] = useState(0);
  const [results, setResults] = useState<ClassificationCounts>({
    TP: 0,
    TN: 0,
    FP: 0,
    FN: 0,
  });
  const { level0: content, common } = useIntlayer("app");

  return (
    <main className="h-screen w-screen flex flex-col items-center p-4">
      <Nav />
      <div className="flex w-full flex-1">
        <div className="h-full w-[30%] flex flex-col p-4 border-r-1">
          <LevelProgressBar level={level} showNextLevelButton={stage === 4} />
          <Legend />
          {stage === 4 && (
            <ClassificationResults classificationCounts={results} />
          )}
        </div>
        <div className="flex-1 h-full flex flex-col items-center">
          <div
            className="flex p-4 border-b-1 w-full h-[100px] justify-center"
            id="instruction"
          >
            <h2 className="text-xl font-medium mb-2 break-words flex-1">
              {
                content.stages[
                  Math.min(stage, 4).toString() as keyof typeof content.stages
                ].value
              }
            </h2>
            <div className="w-24 h-full">
              {stage === 3 && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded my-auto"
                  onClick={() => setStage(4)}
                >
                  {content.buttons.next?.value || common.buttons.next.value}
                </button>
              )}
            </div>
          </div>
          <div className="h-[600px] w-full flex items-center justify-center relative py-10">
            <ClassificationVisualizer
              data={data}
              stage={stage}
              setStage={setStage}
              setResults={setResults}
              bestClassifier={{ line: [], originIsPass: true }} // irrelevant for this level
            />
          </div>
        </div>
      </div>
    </main>
  );
}
