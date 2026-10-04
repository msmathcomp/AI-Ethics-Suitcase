import { useIntlayer } from "react-intlayer";
import { useLevelData } from "~/context/LevelDataContext";
import { cn } from "~/utils/cn";

export default function DataSelector({ level }: { level: number }) {
  const { classificationVisualizer: content } = useIntlayer("app");

  const { getVisualizerData, modifyVisualizerData } = useLevelData();
  const visualizerData = getVisualizerData(level);

  const toggleShow = (property: "showSeenData" | "showUnseenData") => {
    modifyVisualizerData(level, (data) => ({
      ...data,
      [property]: !data[property],
    }));
  };

  return (
    <div className="rounded p-1 grid grid-cols-2 gap-2 bg-stone-200 dark:bg-stone-700">
      {(
        [
          ["seenData", "showSeenData"],
          ["unseenData", "showUnseenData"],
        ] as const
      ).map(([text, property]) => (
        <button
          key={property}
          className={cn(
            "p-1 rounded border flex items-center justify-center gap-2",
            visualizerData[property]
              ? "bg-emerald-200 dark:bg-emerald-900 text-black dark:text-white dark:border-transparent"
              : "text-black dark:text-stone-100 dark:border-stone-100",
          )}
          onClick={() => toggleShow(property)}
          type="button"
        >
          <input
            id={property}
            type="checkbox"
            checked={visualizerData[property]}
            onChange={() => toggleShow(property)}
            className="accent-emerald-200 dark:accent-emerald-800 h-4 aspect-square pointer-events-none"
          />
          <label htmlFor={property} className="pointer-events-none">
            {content[text]}
          </label>
        </button>
      ))}
    </div>
  );
}
