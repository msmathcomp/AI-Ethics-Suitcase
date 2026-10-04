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
  const ToggleButton = ({ isLeft }: { isLeft: boolean }) => (
    <button
      className={cn(
        "px-1 py-1 rounded border flex-grow",
        isLeft !== value
          ? "bg-emerald-200 dark:bg-emerald-900 text-black dark:text-white dark:border-transparent"
          : "text-black dark:text-stone-100 dark:border-stone-100",
      )}
      onClick={() => onChange(!isLeft)}
      type="button"
    >
      {isLeft ? leftOption : rightOption}
    </button>
  );

  return (
    <div
      className={cn(
        "relative flex rounded bg-stone-200 dark:bg-stone-700 p-1 justify-center gap-2",
        className
      )}
    >
      <ToggleButton isLeft={true} />
      <hr className="w-[1px] h-full bg-black dark:bg-stone-100" />
      <ToggleButton isLeft={false} />
    </div>
  );
}
