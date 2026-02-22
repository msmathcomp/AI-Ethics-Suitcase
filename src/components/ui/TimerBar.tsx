import React, { useEffect, useRef, useState } from "react";

interface TimerBarProps extends React.HTMLAttributes<HTMLDivElement> {
  maximumTime: number; // seconds
  pause?: boolean;
  onFinish?: () => void;
  className?: string;
  style?: React.CSSProperties;
  resetKey: number;
}

export default function TimerBar({
  maximumTime,
  pause = false,
  onFinish,
  className = "",
  style,
  resetKey,
  ...rest
}: TimerBarProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setElapsed(0);
  }, [resetKey]);

  useEffect(() => {
    if (elapsed >= maximumTime) {
      if (onFinish) onFinish();
      return;
    }
    if (pause) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 0.1 >= maximumTime) {
          clearInterval(intervalRef.current!);
          return maximumTime;
        }
        return prev + 0.1;
      });
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [elapsed, maximumTime, onFinish]);

  const progress = Math.max(0, 1 - elapsed / maximumTime);

  return (
    <div
      className={`relative w-full bg-gray-200 rounded overflow-hidden ${className}`}
      style={style}
      {...rest}
    >
      <div
        className="absolute right-0 h-full transition-all duration-100 z-10 bg-gray-200"
        style={{
          width: `${(1 - progress) * 100}%`,
        }}
      />
      <div 
        className="absolute h-full w-full"
        style={{
          background: "linear-gradient(90deg, #f97316 0%, #0d9488 100%)",
        }}
      />
    </div>
  );
};
