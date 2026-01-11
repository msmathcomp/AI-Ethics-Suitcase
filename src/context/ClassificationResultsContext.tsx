import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ClassificationCounts, ClickCoordinates } from "~/types";

// Define the shape of data stored for each level
export interface LevelData {
  stage: number;
  completed: boolean;
  user?: ClassificationCounts;
  best?: ClassificationCounts;
  unseen?: ClassificationCounts;
  unseenBest?: ClassificationCounts;
  visualizerData: VisualizerData;
}

export interface VisualizerData {
  clickCoords?: ClickCoordinates[];
  areaColorsAssigned: boolean;
  showBestLine: boolean;
  showSeenData: boolean;
  showUnseenData: boolean;
  originIsPass: boolean | null;
}

const defaultVisualizerData: VisualizerData = {
  areaColorsAssigned: false,
  showBestLine: false,
  showSeenData: true,
  showUnseenData: false,
  originIsPass: null,
};

interface LevelDataContextValue {
  dataByLevel: Map<number, LevelData>;
  recordLevelResult: (
    level: number,
    type: "user" | "best" | "unseen" | "unseenBest",
    counts: ClassificationCounts,
    overwrite?: boolean
  ) => void;
  getStage: (level: number) => number;
  setStage: (level: number, stage: number) => void;
  isLevelCompleted: (level: number) => boolean;
  markLevelCompleted: (level: number) => void;
  getVisualizerData: (level: number) => VisualizerData;
  setVisualizerData: (
    level: number,
    data: VisualizerData
  ) => void;
  modifyVisualizerData: (
    level: number,
    modifyFn: (data: VisualizerData) => VisualizerData
  ) => void;
  resetLevelData: (level: number) => void;
  reset: () => void;
}

const LevelDataContext = createContext<
  LevelDataContextValue | undefined
>(undefined);

export function LevelDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // init Map state
  const [dataByLevel, setDataByLevel] = useState<
    Map<number, LevelData>
  >(() => new Map());

  const recordLevelResult = useCallback<
    LevelDataContextValue["recordLevelResult"]
  >((level, type, counts, overwrite = false) => {
    setDataByLevel((prev) => {
      const existing = prev.get(level) || {
        stage: 0,
        completed: true,
        visualizerData: defaultVisualizerData,
      };
      const updated = {
        ...existing,
        completed: true,
        [type]: counts,
      };
      if (overwrite || !prev.has(level) || !existing[type]) {
        return new Map(prev).set(level, updated);
      }
      return prev;
    });
  }, []);

  const markLevelCompleted = useCallback((level: number) => {
    setDataByLevel((prev) => {
      const existing = prev.get(level) || {
        stage: 0,
        completed: false,
        visualizerData: defaultVisualizerData,
      };
      const updated = {
        ...existing,
        completed: true,
      };
      return new Map(prev).set(level, updated);
    });
  }, []);

  const getStage = useCallback((level: number) => {
    const levelData = dataByLevel.get(level);
    return levelData ? levelData.stage : 0;
  }, [dataByLevel]);

  const setStage = useCallback((level: number, stage: number) => {
    setDataByLevel((prev) => {
      const existing = prev.get(level) || {
        stage: 0,
        completed: false,
        visualizerData: defaultVisualizerData,
      };
      const updated = {
        ...existing,
        stage,
      };
      return new Map(prev).set(level, updated);
    });
  }, [])

  const isLevelCompleted = useCallback((level: number) => {
    const levelData = dataByLevel.get(level);
    return levelData ? levelData.completed : false;
  }, [dataByLevel]);

  const getVisualizerData = useCallback((level: number) => {
    const levelData = dataByLevel.get(level);
    return levelData ? levelData.visualizerData : defaultVisualizerData;
  }, [dataByLevel]);
  
  const setVisualizerData = useCallback((level: number, data: VisualizerData) => {
    setDataByLevel((prev) => {
      const existing = prev.get(level) || {
        stage: 0,
        completed: false,
      };
      const updated = {
        ...existing,
        visualizerData: data,
      };
      return new Map(prev).set(level, updated);
    });
  }, []);

  const modifyVisualizerData = useCallback((level: number, modifyFn: (data: VisualizerData) => VisualizerData) => {
    setDataByLevel((prev) => {
      const existing = prev.get(level) || {
        stage: 0,
        completed: false,
        visualizerData: defaultVisualizerData,
      }
      const currentData = existing.visualizerData;
      const newData = modifyFn(currentData);
      const updated = {
        ...existing,
        visualizerData: newData,
      };
      return new Map(prev).set(level, updated);
    });
  }, []);

  const resetLevelData = useCallback((level: number) => {
    setDataByLevel((prev) => {
      const newMap = new Map(prev);
      newMap.delete(level);
      return newMap;
    });
  }, []);

  const reset = useCallback(() => {
    setDataByLevel(new Map());
  }, []);

  const value = useMemo<LevelDataContextValue>(
    () => ({ 
      dataByLevel,
      recordLevelResult,
      getStage, setStage,
      isLevelCompleted,
      markLevelCompleted,
      getVisualizerData,
      setVisualizerData,
      modifyVisualizerData,
      resetLevelData,
      reset
    }),
    [dataByLevel, recordLevelResult, getStage, setStage, isLevelCompleted, markLevelCompleted, getVisualizerData, setVisualizerData, modifyVisualizerData, reset]
  );

  return (
    <LevelDataContext.Provider value={value}>
      {children}
    </LevelDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLevelData() {
  const ctx = useContext(LevelDataContext);
  if (!ctx)
    throw new Error(
      "useClassificationResults must be used within a ClassificationResultsProvider"
    );
  return ctx;
}
