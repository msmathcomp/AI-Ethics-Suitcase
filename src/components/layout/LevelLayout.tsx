import { useEffect, type ReactNode } from "react";
import { LevelProgressBar } from "~/components/ui/LevelProgressBar";
import { Legend } from "~/components/ui/Legend";
import { cn } from "~/utils/cn";
import { useIntlayer } from "react-intlayer";

interface Props {
  levelName: string;
  goalElement: ReactNode;
  classificationVisualizer: ReactNode;
  instruction: string;
  instructionButton: string | null;
  instructionButtonCallback?: () => void;
  classificationResults?: ReactNode;
  showResults?: boolean;
  level: number;
  showNextLevelButton: boolean;
  showLegend?: boolean;
}

export default function LevelLayout({
  levelName,
  goalElement,
  classificationVisualizer,
  instruction,
  instructionButtonCallback,
  instructionButton,
  classificationResults = null,
  showResults = true,
  level,
  showNextLevelButton,
  showLegend = false,
}: Props) {
  const { classificationResults: classification } = useIntlayer("app");

  // Prevent touchmove scrolling on mobile device
  // This is to prevent the page from "spring scrolling"
  useEffect(() => {
    const el = document.querySelector("main");
    if (!el) return;

    const blockTouch = (e: TouchEvent) => e.preventDefault();

    el.addEventListener('touchmove', blockTouch, { passive: false });

    return () => {
      el.removeEventListener('touchmove', blockTouch);
    };
  }, []);

  return (
    <main className="h-screen w-screen flex flex-col px-4 pt-2 overflow-hidden dark:bg-stone-900 dark:text-white">
      <div className="w-full flex-col flex-none mb-2 px-4">
        <h1 className="text-3xl font-bold mt-4">{levelName}</h1>
        <h2 className="text-xl mt-1">{goalElement}</h2>
      </div>
      <div className="flex flex-1 min-h-0 overflow-auto pt-5">
        <div className="w-full flex-1 relative flex items-center justify-center">
          {classificationVisualizer}
        </div>
        <div className="h-full w-[320px] xl:w-[400px] flex flex-col py-3 justify-start space-y-2 overflow-hidden">
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

          <Legend startOpen={showLegend} />

          {showResults && (
            <div className="overflow-auto flex flex-col">
              <div
                className="flex justify-between w-full px-2 py-1 bg-stone-200 dark:bg-stone-700 rounded-t-md"
              >
                <h3 className="text-lg font-semibold text-start">{classification.title}</h3>
              </div>
              <div className="overflow-auto flex flex-col space-y-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-b-md divide-stone-900 dark:divide-stone-500 divide-y">
                {classificationResults}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="pt-1 w-full flex flex-none items-center justify-center">
        <LevelProgressBar
          level={level}
          showNextLevelButton={showNextLevelButton}
        />
      </div>
    </main>
  );
}
