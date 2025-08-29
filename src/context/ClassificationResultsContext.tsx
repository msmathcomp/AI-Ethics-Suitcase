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
  user: ClassificationCounts;
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
        user: { TP: 0, TN: 0, FP: 0, FN: 0 },
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

  const hasLevelResult = useCallback(
    (level: number) => resultsByLevel.has(level),
    [resultsByLevel]
  );

  const reset = useCallback(() => {
    setResultsByLevel(new Map());
  }, []);

  const value = useMemo<ClassificationResultsContextValue>(
    () => ({ resultsByLevel, recordLevelResult, hasLevelResult, reset }),
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
