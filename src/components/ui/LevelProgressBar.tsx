import { ChevronLeft, ChevronRight, RotateCcw, Home } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useIntlayer } from "react-intlayer";
import { useEffect, useRef, useState } from "react";
import Dialog from "./Dialog";
import { useLevelData } from "~/context/LevelDataContext";
import { LanguageSwitch } from "./LanguageSwitch";
import { Button } from "./Button";
import { SmileIcon } from "./SmileIcon";

interface LevelProgressBarProps {
  level: number;
  showNextLevelButton: boolean;
}

const TOTAL_LEVELS = 8;

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
    if ([-1, 6, 7].includes(level)) return navigate("/home");
    if (level === 8) {
      navigate("/finish");
      return;
    }
    navigate(`/level/${level + 1}`);
  };

  // don't show previous/next buttons on levels 7 and 8
  const showBackButton = ![7, 8].includes(level);

  return (
    <div
      className="flex w-full items-center justify-between gap-2 relative pb-6 pt-4 px-4 rounded-t-xl bg-stone-200 dark:bg-stone-700"
      id="level-progress-bar"
    >
      <div className="flex gap-4">
        <Link to="/home">
          <Button>
            <Home /> {content.home}
          </Button>
        </Link>
        <LanguageSwitch />
      </div>
      <div className="flex items-center justify-center gap-4">
        {showBackButton && (
          <Button
            disabled={level === -1}
            onClick={() => {
              if (level === 0) navigate("/tutorial");
              else navigate(`/level/${level - 1}`);
            }}
          >
            <ChevronLeft size={25} />
            {content.previousLevel}
          </Button>
        )}
        <div className="flex gap-1">
          {[...Array(TOTAL_LEVELS)].map((_, index) => {
            const isCompleted = isLevelCompleted(index - 1);
            if (index === level + 1)
              return <SmileIcon key={index} state="inProgress" />;
            return (
              <Link
                to={index === 0 ? "/tutorial" : `/level/${index - 1}`}
                key={index}
              >
                <SmileIcon state={isCompleted ? "complete" : "incomplete"} />
              </Link>
            );
          })}
        </div>
        <Button
          id="next-level-button"
          onClick={handleNextLevel}
          buttonType={showNextLevelButton ? "primary" : "secondary"}
        >
          {(() => {
            if (!showNextLevelButton) return content.skipLevelButtonText;
            if (level === -1) return content.endTutorial;
            if (level === 7) return content.backToHome;
            if (level === 8) return content.finish;
            return content.nextLevelButtonText;
          })()}
          <ChevronRight size={25} />
        </Button>
      </div>
      <div className="flex items-center justify-center">
        {level !== -1 && level !== 1 && (
          <Button ref={buttonRef} onClick={() => setShowMenu((v) => !v)}>
            {content.restartButton}
            <RotateCcw />
          </Button>
        )}
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
          className="absolute right-3 bottom-18 bg-white dark:bg-stone-900 border rounded shadow-lg z-50 flex flex-col min-w-[150px]"
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
