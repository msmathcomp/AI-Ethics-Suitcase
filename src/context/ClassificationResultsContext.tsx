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
  recordLevelResult: (result: LevelResult, overwrite?: boolean) => void;
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
  >((result, overwrite = false) => {
    setResultsByLevel((prev) => {
      if (prev.has(result.level) && !overwrite) return prev;
      const next = new Map(prev);
      next.set(result.level, {
        ...result,
      });
      return next;
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
