import React, { useEffect, useRef } from "react";
import { cn } from "~/utils/cn";

interface TimerBarProps extends React.HTMLAttributes<HTMLDivElement> {
  maximumTime: number; // seconds
  pause?: boolean;
  onFinish?: () => void;
  resetKey: number;
}

export default function TimerBar({
  maximumTime,
  pause = false,
  onFinish,
  className = "",
  resetKey,
  ...rest
}: TimerBarProps) {
  const elapsed = useRef(0);
  const onFinishRef = useRef(onFinish);
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => { onFinishRef.current = onFinish });

  // reset
  useEffect(() => {
    elapsed.current = 0;
  }, [resetKey]);

  useEffect(() => {
    // update progress
    const render = () => {
      if (!coverRef.current) return;
      const remaining = maximumTime <= 0 ? 1 : Math.min(elapsed.current / maximumTime);
      coverRef.current.style.width = `${remaining * 100}%`;
    }
    render();

    if (pause || elapsed.current >= maximumTime) return;
    
    let requestHandle: number;
    let lastTimestamp = performance.now();

    // run tick function every animation frame
    const tick = (timestamp: number) => {
      elapsed.current = Math.min(maximumTime, elapsed.current + (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;
      render();
      // call finish callback when finished
      if (elapsed.current >= maximumTime) return onFinishRef.current?.();
      // request next frame
      requestHandle = requestAnimationFrame(tick);
    }
    // kickstart requestAnimationFrame loop
    tick(lastTimestamp);

    // return cleanup function so the loop stops
    return () => cancelAnimationFrame(requestHandle);
  }, [pause, maximumTime, resetKey]);

  return (
    <div
      className={cn("relative w-full bg-gray-200 rounded overflow-hidden", className)}
      {...rest}
    >
      <div
        ref={coverRef}
        className="absolute right-0 h-full z-10 bg-gray-200"
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
