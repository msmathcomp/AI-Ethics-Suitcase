import type { ReactNode } from "react";
import Nav from "./Nav";
import { LevelProgressBar } from "~/components/UI/LevelProgressBar";
import { Legend } from "~/components/UI/Legend";
import { cn } from "~/utils/cn";

interface Props {
  goalElement: ReactNode;
  classificationVisualizer: ReactNode;
  instruction: string;
  instructionButton: string | null;
  instructionButtonCallback?: () => void;
  classificationResults: ReactNode;
  level: number;
  showNextLevelButton: boolean;
}

export default function LevelLayout({
  goalElement,
  classificationVisualizer,
  instruction,
  instructionButtonCallback,
  instructionButton,
  classificationResults,
  level,
  showNextLevelButton,
}: Props) {
  return (
    <main className="h-screen w-screen flex flex-col px-4 pt-4 overflow-hidden">
      <Nav />
      <div className="flex flex-1">
        <div className="flex flex-1 flex-col">
          <h1 className="text-xl xl:text-2xl mt-4">{goalElement}</h1>
          <div className="w-full flex-1 relative flex items-center justify-center">
            {classificationVisualizer}
          </div>
        </div>
        <div className="h-full w-[320px] xl:w-[400px] flex flex-col py-3 justify-start">
          <h2
            className="text-lg xl:text-xl font-medium break-words"
            id="instruction"
          >
            {instruction}
          </h2>

          <button
            className={cn(
              "h-8 self-end bg-blue-500 text-white rounded px-3 mt-1",
              instructionButton === null && "invisible"
            )}
            onClick={instructionButtonCallback}
          >
            {instructionButton}
          </button>

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
      <div className="h-2 w-full" />
    </main>
  );
}
