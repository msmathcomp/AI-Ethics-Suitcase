import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ClassificationCounts } from "~/types";

export interface LevelResult {
  level: number;
  completed: boolean;
  user?: ClassificationCounts;
  best?: ClassificationCounts;
  unseen?: ClassificationCounts;
  unseenBest?: ClassificationCounts;
}

interface ClassificationResultsContextValue {
  resultsByLevel: Map<number, LevelResult>;
  recordLevelResult: (
    level: number,
    type: "user" | "best" | "unseen" | "unseenBest",
    counts: ClassificationCounts,
    overwrite?: boolean
  ) => void;
  markLevelCompleted: (level: number) => void;
  hasLevelResult: (level: number) => boolean;
  reset: () => void;
}

const ClassificationResultsContext = createContext<
  ClassificationResultsContextValue | undefined
>(undefined);

export function ClassificationResultsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // init Map state
  const [resultsByLevel, setResultsByLevel] = useState<
    Map<number, LevelResult>
  >(() => new Map());

  const recordLevelResult = useCallback<
    ClassificationResultsContextValue["recordLevelResult"]
  >((level, type, counts, overwrite = false) => {
    setResultsByLevel((prev) => {
      const existing = prev.get(level) || {
        level,
        completed: true,
      };
      const updated = {
        ...existing,
        [type]: counts,
      };
      if (overwrite || !prev.has(level) || !existing[type]) {
        return new Map(prev).set(level, updated);
      }
      return prev;
    });
  }, []);

  const markLevelCompleted = useCallback((level: number) => {
    setResultsByLevel((prev) => {
      const existing = prev.get(level) || {
        level,
        completed: false,
      };
      const updated = {
        ...existing,
        completed: true,
      };
      return new Map(prev).set(level, updated);
    });
  }, []);

  const hasLevelResult = useCallback(
    (level: number) => resultsByLevel.has(level),
    [resultsByLevel]
  );

  const reset = useCallback(() => {
    setResultsByLevel(new Map());
  }, []);

  const value = useMemo<ClassificationResultsContextValue>(
    () => ({ resultsByLevel, recordLevelResult, markLevelCompleted, hasLevelResult, reset }),
    [resultsByLevel, recordLevelResult, hasLevelResult, reset]
  );

  return (
    <ClassificationResultsContext.Provider value={value}>
      {children}
    </ClassificationResultsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useClassificationResults() {
  const ctx = useContext(ClassificationResultsContext);
  if (!ctx)
    throw new Error(
      "useClassificationResults must be used within a ClassificationResultsProvider"
    );
  return ctx;
}
