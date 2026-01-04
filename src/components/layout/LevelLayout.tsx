import type { ReactNode } from "react";
import { LevelProgressBar } from "~/components/ui/LevelProgressBar";
import { Legend } from "~/components/ui/Legend";
import { cn } from "~/utils/cn";
import { useIntlayer } from "react-intlayer";
import { LanguageSwitch } from "~/components/ui/LanguageSwitch";

interface Props {
  goalElement: ReactNode;
  classificationVisualizer: ReactNode;
  instruction: string;
  instructionButton: string | null;
  instructionButtonCallback?: () => void;
  classificationResults: ReactNode;
  level: number;
  stage: number;
}

export default function LevelLayout({
  goalElement,
  classificationVisualizer,
  instruction,
  instructionButtonCallback,
  instructionButton,
  classificationResults,
  level,
  stage,
}: Props) {
  const { title: title } = useIntlayer("app");

  return (
    <main className="h-screen w-screen flex flex-col px-4 pt-4 overflow-hidden dark:bg-stone-900 dark:text-white">
      <nav className="w-full h-14 flex items-center justify-between border-b z-50">
        <h1 className="text-3xl">{title}</h1>
        <LanguageSwitch />
      </nav>
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
              "h-8 self-end bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-900 hover:dark:bg-emerald-800 text-black dark:text-white rounded px-3 mt-1",
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
          stage={stage}
        />
      </div>
      <div className="h-2 w-full" />
    </main>
  );
}
