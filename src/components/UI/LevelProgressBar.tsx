import { ChevronLeft, ChevronRight, Meh, Smile } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "~/utils/cn";
import { useIntlayer } from "react-intlayer";

interface LevelProgressBarProps {
  level: number;
  showNextLevelButton: boolean;
  nextLevelButtonText?: string;
}

const TOTAL_LEVELS = 9;

export function LevelProgressBar({
  level,
  showNextLevelButton,
  nextLevelButtonText,
}: LevelProgressBarProps) {
  const navigate = useNavigate();
  const { levelProgressBar: content } = useIntlayer("app");

  const handleNextLevel = () => {
    if (level === 7) {
      navigate("/finish");
      return;
    }
    navigate(`/level/${level + 1}`);
  };

  return (
    <div
      className="flex border-t w-full items-center justify-center py-2 gap-2"
      id="level-progress-bar"
    >
      <button
        disabled={level === -1}
        onClick={() => navigate(`/level/${level - 1}`)}
        className="flex items-center border rounded pr-2 mr-4"
      >
        <ChevronLeft size={25} />
        Previous Level
      </button>
      {[...Array(TOTAL_LEVELS)].map((_, index) => {
        let backgroundColor = "bg-gray-500";
        if (index < level + 1) {
          backgroundColor = "bg-teal-500";
        } else if (index === level + 1) {
        backgroundColor = "bg-indigo-500";
        }
        return (
          <div
            key={index}
            className={cn(
              "rounded-full w-8 h-8 flex items-center justify-center",
              backgroundColor
            )}
          >
            {index < level + 1 && <Smile color="white" />}
            {index === level + 1 && <Meh color="white" />}
          </div>
        );
      })}
      {/* {showNextLevelButton && (
          <button
            className="bg-blue-500 text-white p-2 rounded ml-auto"
            onClick={handleNextLevel}
          >
            {nextLevelButtonText || content.nextLevelButtonText}
          </button>
        )} */}
      <button
        onClick={handleNextLevel}
        className={cn(
          "flex items-center border rounded pl-2 ml-4",
          showNextLevelButton ? "visible" : "invisible"
        )}
      >
        {nextLevelButtonText || content.nextLevelButtonText}
        <ChevronRight size={25} />
      </button>
    </div>
  );
}
