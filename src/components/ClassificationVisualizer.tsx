import { useState, useRef, useEffect, useCallback, useMemo } from "react";
// ClassificationVisualizer: Interactive chart for visualizing and manipulating classification boundaries
// Handles user input, area selection, and classifier evaluation stages

import type {
  ClickCoordinates,
  AreaPolygons,
  Point,
  DataPoint,
  ClassificationCounts,
} from "~/types";
import { getClassificationCounts } from "~/utils/classification";
import {
  getAreaPolygons,
  getExtendedLinePoints,
  findIntersections,
  findIntersectionsForDrag,
} from "~/utils/geometry";
import { Chart } from "./chart/Chart";
import { ClassificationAreas } from "./chart/ClassificationAreas";
import { ExtendedLinePoints } from "./chart/ExtendedLinePoints";
import Toggle from "./ui/Toggle";
import { useIntlayer } from "react-intlayer";
import { cn } from "~/utils/cn";
import { type VisualizerData } from "~/context/ClassificationResultsContext";

// Props for ClassificationVisualizer
interface Props {
  seenData: DataPoint[];
  unseenData?: DataPoint[];
  visualizerData: VisualizerData;
  stage: number;
  setStage: (stage: number) => void;
  setResults: (results: ClassificationCounts) => void;
  setBestResults?: (results: ClassificationCounts) => void;
  setUnseenResults?: (results: ClassificationCounts) => void;
  setUnseenBestResults?: (results: ClassificationCounts) => void;
  modifyVisualizerData: (modifyFn: (data: VisualizerData) => VisualizerData) => void;
  bestClassifier: {
    line: Point[];
    originIsPass: boolean;
  };
}

// Main component definition
export const ClassificationVisualizer = ({
  seenData,
  unseenData,
  visualizerData,
  stage,
  setStage,
  setResults,
  setBestResults,
  setUnseenResults,
  setUnseenBestResults,
  modifyVisualizerData,
  bestClassifier,
}: Props) => {

// Chart and overlay refs for DOM access
const chartContainerRef = useRef<HTMLDivElement>(null);
const overlayRef = useRef<HTMLDivElement>(null);
const areaPolygonsRef = useRef<HTMLDivElement>(null);
const extendedLinePointsRef = useRef<HTMLDivElement>(null);

const [chartReady, setChartReady] = useState(false);
const [overlayReady, setOverlayReady] = useState(false);
  
// State for current classifier line endpoints
const [lineCoords, setLineCoords] = useState<ClickCoordinates[]>([]);
  
// State for best classifier line endpoints
const [bestLineCoords, setBestLineCoords] = useState<ClickCoordinates[]>([]);

// State for user click coordinates (used to define line)
const clickCoords = useMemo(() => {
  return visualizerData.clickCoords || [];
}, [visualizerData.clickCoords]);

const setClickCoords = (newClickCoords: ClickCoordinates[]) => {
  modifyVisualizerData((data) => ({
    ...data,
    clickCoords: newClickCoords,
  }));
};

// State for polygons representing classified areas
const [areaPolygons, setAreaPolygons] = useState<AreaPolygons>({
  area1: {
    graph: [],
    overlay: [],
  },
  area2: {
    graph: [],
    overlay: [],
  },
});

// State for polygons for best classifier
const [bestAreaPolygons, setBestAreaPolygons] = useState<AreaPolygons>({
  area1: {
    graph: [],
    overlay: [],
  },
  area2: {
    graph: [],
    overlay: [],
  },
});

// State for extended line endpoints (for dragging)
const [extendedLinePoints, setExtendedLinePoints] = useState<
    ClickCoordinates[]
  >([]);

// Whether area colors have been assigned (pass/fail)
const areaColorsAssigned = useMemo(() => {
  return visualizerData.areaColorsAssigned;
}, [visualizerData.areaColorsAssigned]);
const setAreaColorsAssigned = (newValue: boolean) => {
  modifyVisualizerData((data) => ({
    ...data,
    areaColorsAssigned: newValue,
  }));
};

// Whether to show best classifier line or user's line
const showBestLine = visualizerData.showBestLine;
const setShowBestLine = (newValue: boolean) => {
  modifyVisualizerData((data) => ({
    ...data,
    showBestLine: newValue,
  }));
};

// const [showSeenData, setShowSeenData] = useState(true);
// Whether to show seen data points
const showSeenData = visualizerData.showSeenData;
const setShowSeenData = (updateFn: (old: boolean) => boolean) => {
  modifyVisualizerData((data) => ({
    ...data,
    showSeenData: updateFn(data.showSeenData),
  }));
};
// const [showUnseenData, setShowUnseenData] = useState(false);
// Whether to show unseen data points
const showUnseenData = visualizerData.showUnseenData;
const setShowUnseenData = (updateFn: (old: boolean) => boolean) => {
  modifyVisualizerData((data) => ({
    ...data,
    showUnseenData: updateFn(data.showUnseenData),
  }));
};

// Dragging state for moving line endpoints
const [isDragging, setIsDragging] = useState(false);
// Index of the point being dragged
const [dragPointIndex, setDragPointIndex] = useState<number | null>(null);
// Offset between mouse and dragged point
const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
// Used to prevent immediate click after drag
const [dragJustEnded, setDragJustEnded] = useState(false);
// Whether the origin area is classified as pass
// const [originIsPass, setOriginIsPass] = useState<boolean | null>(null);
const originIsPass = visualizerData.originIsPass;
const setOriginIsPass = (newValue: boolean | null | ((old: boolean | null) => boolean | null)) => {
  modifyVisualizerData((data) => ({
    ...data,
    originIsPass: typeof newValue === "function" ? newValue(data.originIsPass) : newValue,
  }));
};

// Memoized data points to display (seen/unseen)
const data = useMemo(() => {
  const data = [];
  if (showSeenData) {
    data.push(...seenData);
  }
  if (stage === 6 && showUnseenData && unseenData) {
    data.push(...unseenData);
  }
  return data;
}, [showSeenData, stage, showUnseenData, unseenData, seenData]);

// Intlayer content

// UI content from intlayer (localization)
const { classificationVisualizer: content } = useIntlayer("app");

// Memoized classification counts for current classifier
const classificationCounts = useMemo(() => {
  return getClassificationCounts(
    seenData,
    lineCoords,
    originIsPass,
    areaColorsAssigned
  );
}, [seenData, lineCoords, originIsPass, areaColorsAssigned]);

// Memoized classification counts for unseen data
const unseenClassificationCounts = useMemo(() => {
  if (!unseenData) {
    return { TP: 0, TN: 0, FP: 0, FN: 0 };
  }
  return getClassificationCounts(
    unseenData,
    lineCoords,
    originIsPass ?? null,
    areaColorsAssigned
  );
}, [unseenData, lineCoords, originIsPass, areaColorsAssigned]);

// Converts graph coordinates to overlay coordinates
const graphToOverlayCoords = useCallback((graphCoords: Point): Point => {
  if (!overlayRef.current || !chartContainerRef.current)
    throw new Error("Refs not set");
  const overlayRect = overlayRef.current.getBoundingClientRect();
  const graphElement = chartContainerRef.current.querySelector(
    ".recharts-cartesian-grid"
  ) as SVGElement | null;

  if (!graphElement) {
    console.log("chartContainerRef: ", chartContainerRef.current);
    throw new Error("Graph element not found");
  }

  const graphRect = graphElement.getBoundingClientRect();

  const normalize_y = graphRect.height / 500;
  const normalize_x = graphRect.width / 500;

  const overlayX =
    graphRect.left + graphCoords.x * normalize_x - overlayRect.left;
  const overlayY =
    graphRect.top + (500 - graphCoords.y) * normalize_y - overlayRect.top;

  return { x: overlayX, y: overlayY };
}, []);

// TODO: FIX this
// Handles user click on overlay to set line endpoints
const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
  if (isDragging || dragJustEnded || stage >= 5) {
    return;
  }

  if (!overlayRef.current || !chartContainerRef.current) return;
  const overlayRect = overlayRef.current.getBoundingClientRect();
  const graphElement = chartContainerRef.current.querySelector(
    ".recharts-cartesian-grid"
  ) as SVGElement | null;

  if (!graphElement) {
    return;
  }

  const graphRect = graphElement.getBoundingClientRect();

  const clickX = event.clientX - overlayRect.left;
  const clickY = event.clientY - overlayRect.top;

  const normalize_y = graphRect.height / 500;
  const normalize_x = graphRect.width / 500;

  const graph_x = (event.clientX - graphRect.left) / normalize_x;
  const graph_y = 500 - (event.clientY - graphRect.top) / normalize_y;

  if (clickCoords.length == 2 || clickCoords.length == 0) {
    setAreaColorsAssigned(false);
    setOriginIsPass(null);

    setClickCoords([
      {
        graph: { x: graph_x, y: graph_y },
        overlay: { x: clickX, y: clickY },
      },
    ]);
  } else if (clickCoords.length == 1) {
    setClickCoords([
      clickCoords[0],
      {
        graph: { x: graph_x, y: graph_y },
        overlay: { x: clickX, y: clickY },
      },
    ]);
  }
};

// Handles mouse down on extended line points for dragging
const handleExtendedPointMouseDown = (
  event: React.MouseEvent<HTMLDivElement>,
  pointIndex: number
) => {
  event.stopPropagation();
  if (!overlayRef.current) return;

  const overlayRect = overlayRef.current.getBoundingClientRect();
  const mouseX = event.clientX - overlayRect.left;
  const mouseY = event.clientY - overlayRect.top;

  const extendedPoint = extendedLinePoints[pointIndex];
  setDragOffset({
    x: mouseX - extendedPoint.overlay.x,
    y: mouseY - extendedPoint.overlay.y,
  });

  setDragPointIndex(pointIndex);
  setIsDragging(true);
};

// Handles mouse movement for dragging line endpoints
const handleOverlayMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
  if (
    !isDragging ||
    dragPointIndex === null ||
    !overlayRef.current ||
    !chartContainerRef.current
  ) {
    return;
  }

  const overlayRect = overlayRef.current.getBoundingClientRect();
  const graphElement = chartContainerRef.current.querySelector(
    ".recharts-cartesian-grid"
  ) as SVGElement | null;

  if (!graphElement) return;

  const graphRect = graphElement.getBoundingClientRect();
  const normalize_y = graphRect.height / 500;
  const normalize_x = graphRect.width / 500;

  const mouseX = event.clientX - overlayRect.left;
  const mouseY = event.clientY - overlayRect.top;

  const newOverlayX = mouseX - dragOffset.x;
  const newOverlayY = mouseY - dragOffset.y;

  const newGraphX =
    (overlayRect.left + newOverlayX - graphRect.left) / normalize_x;
  const newGraphY =
    500 - (overlayRect.top + newOverlayY - graphRect.top) / normalize_y;

  const newExtendedPoints = [...extendedLinePoints];
  newExtendedPoints[dragPointIndex] = {
    graph: { x: newGraphX, y: newGraphY },
    overlay: { x: newOverlayX, y: newOverlayY },
  };

  const otherExtendedPoint = extendedLinePoints[1 - dragPointIndex];
  const draggedPoint = newExtendedPoints[dragPointIndex];

  const dx = draggedPoint.graph.x - otherExtendedPoint.graph.x;
  const dy = draggedPoint.graph.y - otherExtendedPoint.graph.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return;

  const unitX = dx / length;
  const unitY = dy / length;

  const extraLength = 500;

  const p1 = {
    x: draggedPoint.graph.x - unitX * extraLength,
    y: draggedPoint.graph.y - unitY * extraLength,
  };
  const p2 = {
    x: otherExtendedPoint.graph.x + unitX * extraLength,
    y: otherExtendedPoint.graph.y + unitY * extraLength,
  };

  const intersections = findIntersectionsForDrag(p1, p2);

  if (intersections.length >= 2) {
    const newLineCoords = [
      {
        graph: intersections[0],
        overlay: graphToOverlayCoords(intersections[0]),
      },
      {
        graph: intersections[1],
        overlay: graphToOverlayCoords(intersections[1]),
      },
    ];

    setLineCoords(newLineCoords);
    setExtendedLinePoints(newExtendedPoints);
  }
};

// Handles mouse up event to finish dragging
const handleOverlayMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragPointIndex(null);
      setDragOffset({ x: 0, y: 0 });
      setDragJustEnded(true);

      setTimeout(() => {
        setDragJustEnded(false);
      }, 300);
    }
  };

// Handles area selection (pass/fail) by user
const handleAreaSelection = (
  event: React.MouseEvent<SVGPolygonElement>,
  originIsPass: boolean
) => {
  event.stopPropagation();

  if (areaColorsAssigned) return;

  // Since area1 is always pass and area2 is always fail,
  // we set area1IsRed to true (pass areas are red)
  setOriginIsPass(originIsPass);
  setAreaColorsAssigned(true);
};

useEffect(() => {
  const container = chartContainerRef.current;
  if (!container) return;

  const observer = new MutationObserver(() => {
    const graphElement = container.querySelector(
      ".recharts-cartesian-grid"
    ) as SVGElement | null;

    if (graphElement) {
      setChartReady(true);
      observer.disconnect(); // stop once found
    }
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}, []);

useEffect(() => {
  if (overlayRef.current) {
    setOverlayReady(true);
  } else {
    setOverlayReady(false);
  }
}, [overlayRef.current]);

// Effect: Update lineCoords when clickCoords change
// Effect: Update areaPolygons when lineCoords change
// Effect: Update bestAreaPolygons when bestLineCoords change
// Effect: Update extendedLinePoints when lineCoords change
// Effect: Advance stage based on user actions
// Effect: Update results when stage and areaColorsAssigned change
// Effect: Update unseen results when stage and areaColorsAssigned change
// Effect: Create best classifier line and results when entering stage 5
// Effect: Adjust z-index for overlay and area polygons based on state
useEffect(() => {
  if (!chartReady || !overlayReady) return;  

  if (clickCoords.length == 2) {
    const [p1, p2] = [clickCoords[0].graph, clickCoords[1].graph];

    const intersections = findIntersections(p1, p2);

    if (intersections.length < 2) {
      alert(content.alerts.invalidIntersection);
      setLineCoords([]);
    } else {
      setLineCoords([
        {
          graph: intersections[0],
          overlay: graphToOverlayCoords(intersections[0]),
        },
        {
          graph: intersections[1],
          overlay: graphToOverlayCoords(intersections[1]),
        },
      ]);
    }
  } else {
    setLineCoords([]);
  }
   
}, [clickCoords, graphToOverlayCoords, chartReady, overlayReady]);

useEffect(() => {
  if (lineCoords.length < 2) {
    setAreaPolygons({
      area1: { graph: [], overlay: [] },
      area2: { graph: [], overlay: [] },
    });
    return;
  }
  const polygons = getAreaPolygons(lineCoords, graphToOverlayCoords);
  setAreaPolygons(polygons);
}, [lineCoords, graphToOverlayCoords, originIsPass]);

useEffect(() => {
  if (bestLineCoords.length < 2) {
    setBestAreaPolygons({
      area1: { graph: [], overlay: [] },
      area2: { graph: [], overlay: [] },
    });
    return;
  }
  const polygons = getAreaPolygons(bestLineCoords, graphToOverlayCoords);
  setBestAreaPolygons(polygons);
}, [bestLineCoords, graphToOverlayCoords, originIsPass]);

useEffect(() => {
  if (lineCoords.length === 2) {
    const extended = getExtendedLinePoints(lineCoords, graphToOverlayCoords);
    setExtendedLinePoints(extended);
  } else {
    setExtendedLinePoints([]);
  }
}, [lineCoords, graphToOverlayCoords]);

useEffect(() => {
  if (clickCoords.length === 1 && stage == 0) {
    setStage(1);
  } else if (clickCoords.length === 2 && stage == 1) {
    setStage(2);
  } else if (areaColorsAssigned && stage == 2) {
    setStage(3);
  }
}, [clickCoords, stage, setStage, areaColorsAssigned]);

useEffect(() => {
  if (stage >= 4 && areaColorsAssigned) {
    setResults(classificationCounts);
  }
}, [stage, areaColorsAssigned, classificationCounts, setResults]);

// Handle unseen data results
useEffect(() => {
  if (stage >= 6 && setUnseenResults && areaColorsAssigned && unseenData) {
    setUnseenResults(unseenClassificationCounts);
  }
}, [
  stage,
  areaColorsAssigned,
  unseenClassificationCounts,
  setUnseenResults,
  unseenData,
]);

// Create best classifier line when entering stage 5
useEffect(() => {
  if (!chartReady || !overlayReady) return;

  if (stage >= 5 && bestLineCoords.length < 2) {
    const bestLineCoords2 = [
      {
        graph: bestClassifier.line[0],
        overlay: graphToOverlayCoords(bestClassifier.line[0]),
      },
      {
        graph: bestClassifier.line[1],
        overlay: graphToOverlayCoords(bestClassifier.line[1]),
      },
    ];

    setBestLineCoords(bestLineCoords2);

    // Calculate best classifier results
    const bestClassificationCounts = getClassificationCounts(
      seenData,
      bestLineCoords2,
      bestClassifier.originIsPass,
      true
    );

    if (setBestResults) {
      setBestResults(bestClassificationCounts);
    }

    // Calculate best classifier results on unseen data
    if (unseenData && setUnseenBestResults) {
      const bestUnseenClassificationCounts = getClassificationCounts(
        unseenData,
        bestLineCoords2,
        bestClassifier.originIsPass,
        true
      );

      setUnseenBestResults(bestUnseenClassificationCounts);
    }
  }
}, [
  stage,
  bestLineCoords,
  bestClassifier,
  seenData,
  graphToOverlayCoords,
  originIsPass,
  setBestResults,
  setUnseenBestResults,
  unseenData,
  chartReady,
  overlayReady,
]);

useEffect(() => {
  const overlayElement = overlayRef.current;
  const areaPolygonsElement = areaPolygonsRef.current;

  if (!chartContainerRef.current || !overlayElement || !areaPolygonsElement)
    return;

  const graphElement = chartContainerRef.current.querySelector(
    ".recharts-cartesian-grid"
  ) as SVGElement | null;

  if (!graphElement) {
    return;
  }

  if (
    overlayElement &&
    areaPolygonsElement &&
    clickCoords.length == 2 &&
    !areaColorsAssigned
  ) {
    areaPolygonsElement.style.zIndex = "20";
  } else if (areaColorsAssigned && areaPolygonsElement && overlayElement) {
    areaPolygonsElement.style.zIndex = "5";
    overlayElement.style.zIndex = "10";
  }
}, [clickCoords, areaColorsAssigned]);

// Render component UI
return (
    <>
      <Chart
        data={data}
        lineCoords={stage >= 5 && showBestLine ? bestLineCoords : lineCoords}
        originIsPass={
          stage >= 5 && showBestLine
            ? bestClassifier.originIsPass
            : originIsPass
        }
        areaColorsAssigned={areaColorsAssigned || (stage >= 5 && showBestLine)}
        stage={stage}
        chartContainerRef={chartContainerRef}
      />

      <div
        className="w-full h-full absolute top-0 left-0 cursor-crosshair bg-transparent z-10"
        ref={overlayRef}
        onClick={handleOverlayClick}
        onPointerMove={handleOverlayMouseMove}
        onPointerUp={handleOverlayMouseUp}
      >
        {areaColorsAssigned && (
          <ExtendedLinePoints
            elementRef={extendedLinePointsRef}
            extendedLinePoints={
              stage >= 5 && showBestLine ? [] : extendedLinePoints
            }
            lineCoords={
              stage >= 5 && showBestLine ? bestLineCoords : lineCoords
            }
            onExtendedPointMouseDown={
              stage < 5 || !showBestLine
                ? handleExtendedPointMouseDown
                : () => {}
            }
          />
        )}
      </div>

      {clickCoords.length === 1 && (
        <div
          className={cn("absolute bg-emerald-500 w-3 h-3 rounded-full")}
          style={{
            top: clickCoords[0].overlay.y - 6,
            left: clickCoords[0].overlay.x - 6,
          }}
        />
      )}

      <div className="flex flex-col absolute top-3 left-0 z-20 gap-2 text-xs w-24 xl:text-sm xl:w-32">
        {areaColorsAssigned && (
          <button
            className="border rounded px-2 py-1"
            onClick={() =>
              setOriginIsPass((prev) => (prev !== null ? !prev : null))
            }
            disabled={[5, 6].includes(stage) && showBestLine}
          >
            {content.flipButton}
          </button>
        )}
        <Toggle
          leftOption={content.toggles.yourClassifier}
          rightOption={content.toggles.bestClassifier}
          value={showBestLine}
          onChange={setShowBestLine}
          className={cn([5, 6].includes(stage) ? "visible" : "invisible")}
        />
        {stage === 6 && (
          <div className="border rounded p-1 space-y-2">
            <div className="flex items-center justify-between">
              <label>{content.seenData}</label>
              <input
                type="checkbox"
                checked={showSeenData}
                onChange={() => setShowSeenData((prev) => !prev)}
                className="accent-emerald-200 dark:accent-emerald-900"
              />
            </div>
            <div className="flex items-center justify-between">
              <label>{content.unseenData}</label>
              <input
                type="checkbox"
                checked={showUnseenData}
                onChange={() => setShowUnseenData((prev) => !prev)}
                className="accent-emerald-200 dark:accent-emerald-900"
              />
            </div>
          </div>
        )}
      </div>

      <div
        className="absolute inset-0"
        ref={areaPolygonsRef}
        onPointerMove={handleOverlayMouseMove}
        onPointerUp={handleOverlayMouseUp}
      >
        <ExtendedLinePoints
          elementRef={extendedLinePointsRef}
          extendedLinePoints={
            stage >= 5 && showBestLine ? [] : extendedLinePoints
          }
          lineCoords={stage >= 5 && showBestLine ? bestLineCoords : lineCoords}
          onExtendedPointMouseDown={
            stage < 5 || !showBestLine ? handleExtendedPointMouseDown : () => {}
          }
        />
        {lineCoords.length === 2 &&
          areaPolygons.area1.overlay.length > 0 &&
          areaPolygons.area2.overlay.length > 0 &&
          stage < 5 && (
            <ClassificationAreas
              areaPolygons={areaPolygons}
              originIsPass={originIsPass}
              areaColorsAssigned={areaColorsAssigned}
              onAreaSelection={handleAreaSelection}
            />
          )}

        {stage >= 5 &&
          showBestLine &&
          bestLineCoords.length === 2 &&
          bestAreaPolygons.area1.overlay.length > 0 &&
          bestAreaPolygons.area2.overlay.length > 0 && (
            <ClassificationAreas
              areaPolygons={bestAreaPolygons}
              originIsPass={bestClassifier.originIsPass}
              areaColorsAssigned={true}
              onAreaSelection={() => {}}
            />
          )}

        {stage >= 5 &&
          !showBestLine &&
          lineCoords.length === 2 &&
          areaPolygons.area1.overlay.length > 0 &&
          areaPolygons.area2.overlay.length > 0 && (
            <ClassificationAreas
              areaPolygons={areaPolygons}
              originIsPass={originIsPass}
              areaColorsAssigned={areaColorsAssigned}
              onAreaSelection={() => {}} // No area selection in stage 5+
            />
          )}
      </div>

    </>
  );
};
