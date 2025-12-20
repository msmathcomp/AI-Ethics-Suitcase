import { ChevronLeft, ChevronRight, Meh, Smile, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { cn } from "~/utils/cn";
import { useIntlayer } from "react-intlayer";
import { useEffect, useRef, useState } from "react";

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

  // Restart button popup menu state
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
      window.location.reload();
    } else if (option === "app") {
      navigate(`/`);
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
      className="flex border-t w-full items-center justify-center py-2 gap-2 relative"
      id="level-progress-bar"
    >
      <button
        disabled={level === -1}
        onClick={() => navigate(`/level/${level - 1}`)}
        className="flex items-center border rounded pr-2 mr-4"
      >
        <ChevronLeft size={25} />
        {content.previousLevel}
      </button>
      {[...Array(TOTAL_LEVELS)].map((_, index) => {
        let backgroundColor = "bg-gray-500";
        if (index <= level) {
          backgroundColor = "bg-teal-500";
        } else if (index === level + 1) {
          backgroundColor = "bg-indigo-500";
        }
        if (index <= level) {
          return (
            <Link to={`/level/${index - 1}`}>
              <div
                key={index}
                className={cn(
                  "rounded-full w-8 h-8 flex items-center justify-center",
                  backgroundColor
                )}
              >
                {<Smile color="white" />}
              </div>
            </Link>
          );
        }
        return (
          <div
            key={index}
            className={cn(
              "rounded-full w-8 h-8 flex items-center justify-center",
              backgroundColor
            )}
          >
            {index === level + 1 && <Meh color="white" />}
          </div>
        );
      })}
      <button
        id="next-level-button"
        onClick={handleNextLevel}
        disabled={!showNextLevelButton}
        className={cn(
          "flex items-center ml-2 bg-blue-500 text-white rounded px-2 border-blue-500 border",
          // showNextLevelButton ? "visible" : "invisible"
        )
      }
      >
        {nextLevelButtonText || content.nextLevelButtonText}
        <ChevronRight size={25} />
      </button>
      <button
        id="reset-button"
        ref={buttonRef}
        onClick={() => setShowMenu((v) => !v)}
        className={cn(
          "absolute right-0 top-0 hover:bg-gray-100 items-center mr-2 mt-2 text-black rounded p-1 ",
        )}
      >
        <RotateCcw size={30} />
      </button>
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 bottom-14 bg-white border rounded shadow-lg z-50 flex flex-col min-w-[150px]"
        >
          <button
            className="px-4 py-2 hover:bg-gray-100 text-left"
            onClick={() => handleMenuOption("app")}
          >
            {content.restartApp}
          </button>
          <button
            className="px-4 py-2 hover:bg-gray-100 text-left"
            onClick={() => handleMenuOption("level")}
          >
            {content.restartLevel}
          </button>
        </div>
      )}
    </div>
  );
}
