import nlFlag from "../../assets/nl.svg";
import ukFlag from "../../assets/uk.svg";
import { ClassificationVisualizer } from "../components/ClassificationVisualizer";
import { useState } from "react";
import { Legend } from "../components/UI/Legend";
import { ClassificationResults } from "../components/UI/ClassificationResults";
import type { DataPoint, ClassificationCounts } from "../types";
import { useNavigate } from "react-router";

interface ResultsData {
  accuracy: string | null;
  counts: ClassificationCounts;
}

const instructions = [
  "Click to select the first point",
  "Click to select the second point to draw a line",
  "Drag the black circles to adjust the line, then click an area to classify as Pass",
  "Adjust your classifier by rotating the line or creating a new one. When satisfied, click 'Next' to continue.",
  "Complete! You can now see the classification results.",
];

const data: DataPoint[] = [
  { study_time: 100, screen_time: 300, type: "b" },
  { study_time: 350, screen_time: 300, type: "b" },
  { study_time: 100, screen_time: 150, type: "a" },
  { study_time: 350, screen_time: 150, type: "a" },
];

export default function Level0() {
  const navigate = useNavigate();
  const level = 0;
  const [stage, setStage] = useState(0);
  const [results, setResults] = useState<ResultsData>({
    accuracy: null,
    counts: {
      TP: 0,
      TN: 0,
      FP: 0,
      FN: 0,
    },
  });

  const handleSetResults = (newResults: ResultsData) => {
    console.log("Setting results:", newResults);
    setResults(newResults);
  };

  return (
    <main className="h-screen w-screen flex flex-col items-center p-4">
      <nav className="w-full h-14 flex items-center px-2 justify-between border-b-1">
        <h1 className="text-2xl">AI Ethics Suitcase</h1>
        <div className="flex items-center">
          <button className="flex items-center cursor-pointer">
            <img src={ukFlag} alt="English" className="h-6" />
            <span className="ml-1">English</span>
          </button>
          <hr className="inline-block h-6 w-px bg-black m-2" />
          <button className="flex items-center cursor-pointer">
            <img src={nlFlag} alt="Nederlands" className="h-6" />
            <span className="ml-1">Nederlands</span>
          </button>
        </div>
      </nav>
      <div className="flex w-full flex-1">
        <div className="h-full w-[30%] flex flex-col p-4 border-r-1">
          <div id="level-progress-bar" className="mb-10">
            <h3 className="text-xl">Level {level}</h3>
            <div className="flex gap-2">
              {[...Array(10)].map((_, index) => {
                let backgroundColor = "gray";
                if (index < level + 1) {
                  backgroundColor = "green";
                } else if (index === level + 1) {
                  backgroundColor = "blue";
                }
                return (
                  <div
                    key={index}
                    className="rounded-full w-5 h-5"
                    style={{
                      backgroundColor: backgroundColor,
                    }}
                  />
                );
              })}
              {stage === 4 && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                  onClick={() => navigate("/AI-Ethics-Suitcase/level/1")}
                >
                  Next Level
                </button>
              )}
            </div>
          </div>
          <Legend />
          {stage === 4 && (
            <ClassificationResults
              classificationCounts={results.counts}
              accuracy={results.accuracy}
            />
          )}
        </div>
        <div className="flex-1 h-full flex flex-col items-center">
          <div
            className="flex p-4 border-b-1 w-full h-[100px] justify-center"
            id="instruction"
          >
            <h2 className="text-xl font-medium mb-2 break-words flex-1">
              {instructions[Math.min(stage, instructions.length - 1)]}
            </h2>
            <div className="w-24 h-full">
              {stage === 3 && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded my-auto"
                  onClick={() => setStage(4)}
                >
                  Next
                </button>
              )}
            </div>
          </div>
          <div className="h-[600px] w-full flex items-center justify-center relative py-10">
            <ClassificationVisualizer
              data={data}
              stage={stage}
              setStage={setStage}
              setResults={handleSetResults}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
