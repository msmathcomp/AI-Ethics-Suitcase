import { ChevronLeft, ChevronRight, Meh, Smile, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { cn } from "~/utils/cn";
import { useIntlayer } from "react-intlayer";
import { useEffect, useRef, useState } from "react";
import Dialog from "./Dialog";
import ThemeSwitch from "./ThemeSwitch";
import { useLevelData } from "~/context/LevelDataContext";
import { LanguageSwitch } from "./LanguageSwitch";

interface LevelProgressBarProps {
  level: number;
  showNextLevelButton: boolean;
}

const TOTAL_LEVELS = 9;

export function LevelProgressBar({
  level,
  showNextLevelButton,
}: LevelProgressBarProps) {
  const navigate = useNavigate();
  const { levelProgressBar: content } = useIntlayer("app");

  // Result 
  const { isLevelCompleted, resetLevelData, reset } = useLevelData();

  // Restart button popup menu state
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Effect to handle clicks outside the menu to close it
  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleMenuOption = (option: "app" | "level") => {
    setShowMenu(false);

    if (option === "level") {
      resetLevelData(level);
    } else if (option === "app") {
      setIsDialogOpen(true);
    }
  };

  const handleNextLevel = () => {
    if (level === 7) {
      navigate("/finish");
      return;
    }
    navigate(`/level/${level + 1}`);
  };

  return (
    <div
      className="flex w-full items-center justify-center gap-2 relative pb-6 pt-4 rounded-t-xl bg-stone-200 dark:bg-stone-700"
      id="level-progress-bar"
    >
      <div className="absolute left-0 top-0 px-2 py-4">
        <LanguageSwitch />
      </div>
      <button
        disabled={level === -1}
        onClick={() => navigate(`/level/${level - 1}`)}
        className="flex items-center border rounded-xl pr-5 pl-2 py-2 mr-4 hover:bg-stone-200 dark:hover:bg-stone-800 border-stone-600 dark:border-stone-400"
      >
        <ChevronLeft size={25} />
        {content.previousLevel}
      </button>
      {[...Array(TOTAL_LEVELS)].map((_, index) => {
        const isCompleted = isLevelCompleted(index - 1);
        if (index === level + 1) {
          return (
            <div
              key={`level-button-${index}`}
              className={cn(
                "rounded-full w-8 h-8 flex items-center justify-center",
                "bg-indigo-500"
              )}
            >
              <Meh color="white" />
            </div>
          );
        }
        return (
          <Link
            to={`/level/${index - 1}`}
            key={`level-button-${index}`}
          >
            <div
              className={cn(
                "rounded-full w-8 h-8 flex items-center justify-center",
                isCompleted ? "bg-teal-500" : "bg-stone-400 dark:bg-stone-600 hover:bg-stone-500"
              )}
            >
              {isCompleted && <Smile color="white" />}
            </div>
          </Link>
        );
      })}
      <button
        id="next-level-button"
        onClick={handleNextLevel}
        className={showNextLevelButton 
          ? cn(
            "flex items-center ml-2 bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-800 hover:dark:bg-emerald-700",
            "text-black dark:text-white rounded-xl pl-5 pr-2 py-2 border-emerald-200 dark:border-emerald-900 border ",
          )
          : "flex items-center border rounded-xl pl-5 pr-2 py-2 mr-4 hover:bg-stone-200 dark:hover:bg-stone-800 border-stone-600 dark:border-stone-400"
        }
      >
        {showNextLevelButton ? content.nextLevelButtonText : content.skipLevelButtonText}
        <ChevronRight size={25} />
      </button>
      <div className="absolute right-0 top-0 flex items-center justify-center px-2 py-5">
        {level !== -1 && level !== 1 && (
          <button
            id="reset-button"
            ref={buttonRef}
            onClick={() => setShowMenu((v) => !v)}
            className={cn(
              "hover:bg-stone-200 dark:hover:bg-stone-800 items-center rounded p-1 ",
            )}
          >
            <RotateCcw size={30} />
          </button>
        )}
        <ThemeSwitch />
      </div>
      <Dialog
        open={isDialogOpen}
        title={content.restartDialogTitle.value}
        message={content.restartDialogMessage.value}
        onYes={() => {
          reset();
          navigate(`/`);
        }}
        onNo={() => setIsDialogOpen(false)}
      />
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 bottom-14 bg-white dark:bg-stone-900 border rounded shadow-lg z-50 flex flex-col min-w-[150px]"
        >
          <button
            className="px-4 py-2 hover:bg-stone-200 dark:hover:bg-stone-800 text-left"
            onClick={() => handleMenuOption("app")}
          >
            {content.restartApp}
          </button>
          <button
            className="px-4 py-2 hover:bg-stone-200 dark:hover:bg-stone-800 text-left"
            onClick={() => handleMenuOption("level")}
          >
            {content.restartLevel}
          </button>
        </div>
      )}
    </div>
  );
}
