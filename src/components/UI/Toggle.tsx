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
        "relative flex flex-col rounded border bg-white overflow-hidden p-1 justify-center gap-2",
        className
      )}
    >
      <button
        className={cn(
          "px-1 py-1 rounded whitespace-nowrap",
          !value ? "bg-blue-500 text-white" : "text-black",
          value ? "border" : ""
        )}
        onClick={() => onChange(false)}
        type="button"
      >
        {leftOption}
      </button>
      <hr className="h-[1px] w-full bg-black" />
      <button
        className={cn(
          "px-1 py-1 rounded whitespace-nowrap",
          value ? "bg-blue-500 text-white" : "text-black",
          value ? "" : "border"
        )}
        onClick={() => onChange(true)}
        type="button"
      >
        {rightOption}
      </button>
    </div>
  );
}
