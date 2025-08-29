import type { ReactNode } from "react";
import Nav from "./Nav";
import { LevelProgressBar } from "~/components/UI/LevelProgressBar";
import { Legend } from "~/components/UI/Legend";

interface Props {
  goalElement: ReactNode;
  classificationVisualizer: ReactNode;
  instruction: string;
  instructionButton: ReactNode;
  classificationResults: ReactNode;
  level: number;
  showNextLevelButton: boolean;
}

export default function LevelLayout({
  goalElement,
  classificationVisualizer,
  instruction,
  instructionButton,
  classificationResults,
  level,
  showNextLevelButton,
}: Props) {
  return (
    <main className="h-screen w-screen flex flex-col px-4 pt-4">
      <Nav />
      <div className="flex flex-1">
        <div className="flex flex-1 flex-col">
          <h1 className="text-2xl mt-4">{goalElement}</h1>
          <div className="w-full flex-1 relative flex items-center justify-center">
            {classificationVisualizer}
          </div>
        </div>
        <div className="h-full w-1/3 flex flex-col p-3 justify-start">
          <h2 className="text-xl font-medium break-words" id="instruction">
            {instruction}
          </h2>

          <div className="h-8 w-full flex justify-end">{instructionButton}</div>
          <Legend />
          {classificationResults}
        </div>
      </div>
      <div className="py-1 w-full flex items-center justify-center">
        <LevelProgressBar
          level={level}
          showNextLevelButton={showNextLevelButton}
        />
      </div>
    </main>
  );
}
