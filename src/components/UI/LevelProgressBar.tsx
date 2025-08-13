import { Meh, Smile } from "lucide-react";
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
    <div id="level-progress-bar" className="mb-10">
      <h3 className="text-xl">
        {content.levelLabel} {level === -1 ? content.introLabel : level}
      </h3>
      <div className="flex gap-2 items-center">
        {[...Array(TOTAL_LEVELS)].map((_, index) => {
          let backgroundColor = "bg-gray-500";
          if (index < level + 1) {
            backgroundColor = "bg-green-500";
          } else if (index === level + 1) {
            backgroundColor = "bg-blue-500";
          }
          return (
            <div
              key={index}
              className={cn(
                "rounded-full w-5 h-5 flex items-center justify-center",
                backgroundColor
              )}
            >
              {index < level + 1 && (
                <Smile color="white" className="w-4.5 h-4.5" />
              )}
              {index === level + 1 && (
                <Meh color="white" className="w-4.5 h-4.5" />
              )}
            </div>
          );
        })}
        {showNextLevelButton && (
          <button
            className="bg-blue-500 text-white p-2 rounded ml-auto"
            onClick={handleNextLevel}
          >
            {nextLevelButtonText || content.nextLevelButtonText}
          </button>
        )}
      </div>
    </div>
  );
}
