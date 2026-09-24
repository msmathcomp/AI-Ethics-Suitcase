import React from "react";
import { cn } from "~/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: "primary" | "secondary" | "destructive";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, buttonType = "secondary", ...props }, ref) => {
    return (
      <button
        className={cn(
          "flex gap-2 items-center border rounded-xl px-3 py-2 hover:bg-stone-200 dark:hover:bg-stone-800 border-stone-600 dark:border-stone-400",
          buttonType === "primary" &&
            "bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-800 hover:dark:bg-emerald-700 border-emerald-200 dark:border-emerald-900 text-black dark:text-white",
          buttonType === "secondary" &&
			"hover:bg-stone-200 dark:hover:bg-stone-800 border-stone-600 dark:border-stone-400",
		buttonType === "destructive" &&
            "bg-red-500 hover:bg-red-400 dark:bg-red-800 hover:dark:bg-red-700 border-red-200 dark:border-red-900 text-white",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);
