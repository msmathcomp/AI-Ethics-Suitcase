import type { ReactNode } from "react";
import { cn } from "~/utils/cn";

interface ToggleProps {
  leftOption: ReactNode;
  rightOption: ReactNode;
  value: boolean;
  onChange: (newValue: boolean) => void;
  className?: string;
}

export default function Toggle({
  leftOption,
  rightOption,
  value,
  onChange,
  className,
}: ToggleProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded bg-stone-200 dark:bg-stone-700 overflow-hidden p-1 justify-center gap-2",
        className
      )}
    >
      <button
        className={cn(
          "px-1 py-1 rounded",
          !value ? "bg-emerald-200 dark:bg-emerald-900 text-black dark:text-white" : "text-black dark:text-stone-100",
          value ? "border dark:border-stone-100" : ""
        )}
        onClick={() => onChange(false)}
        type="button"
      >
        {leftOption}
      </button>
      <hr className="h-[1px] w-full bg-black dark:bg-stone-100" />
      <button
        className={cn(
          "px-1 py-1 rounded",
          value ? "bg-emerald-200 dark:bg-emerald-900 text-black dark:text-white" : "text-black dark:text-stone-100",
          value ? "" : "border dark:border-stone-100"
        )}
        onClick={() => onChange(true)}
        type="button"
      >
        {rightOption}
      </button>
    </div>
  );
}
