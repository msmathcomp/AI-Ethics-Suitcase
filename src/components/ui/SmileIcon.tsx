import { Meh, Smile } from "lucide-react";
import { cn } from "~/utils/cn";

export function SmileIcon({
  state,
}: {
  state: "incomplete" | "inProgress" | "complete";
}) {
  let Icon;
  if (state === "inProgress") Icon = Meh;
  if (state === "complete") Icon = Smile;

  return (
    <div
      className={cn(
        "rounded-full w-8 h-8",
        state === "incomplete" &&
          "bg-stone-400 dark:bg-stone-600 hover:bg-stone-500",
        state === "inProgress" && "bg-indigo-500",
        state === "complete" && "bg-teal-500",
      )}
    >
      {Icon && <Icon color="white" className="m-auto h-full" />}
    </div>
  );
}
