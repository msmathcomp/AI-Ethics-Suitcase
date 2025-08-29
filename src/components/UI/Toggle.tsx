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
        "relative flex rounded-md border bg-white text-sm overflow-hidden p-1",
        className
      )}
    >
      <button
        className={cn(
          "flex-1 px-2 py-1 rounded-md whitespace-nowrap",
          !value ? "bg-blue-500 text-white" : "text-black"
        )}
        onClick={() => onChange(false)}
        type="button"
      >
        {leftOption}
      </button>
      <button
        className={cn(
          "flex-1 px-2 py-1 rounded-md whitespace-nowrap",
          value ? "bg-blue-500 text-white" : "text-black"
        )}
        onClick={() => onChange(true)}
        type="button"
      >
        {rightOption}
      </button>
    </div>
  );
}
