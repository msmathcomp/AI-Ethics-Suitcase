import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type {
  Point,
  DataPoint,
  AreaPolygons,
  ClassificationCounts,
} from "~/types";
import {
  checkSelfIntersection,
  cleanSmallIntersections,
  getCurveIntersections,
  isPointInBounds,
} from "~/utils/geometry_curve";
import { getAreaPolygons } from "~/utils/geometry_curve";
import { ClassificationAreas } from "./chart/ClassificationAreas";
import { getClassificationCounts_Curve } from "~/utils/classification_curve";
import { CurveChart } from "./chart/ChartCurve";
import { useIntlayer } from "react-intlayer";
import type { VisualizerData } from "~/context/LevelDataContext";
import Dialog from "./ui/Dialog";

interface Props {
  seenData: DataPoint[];
  unseenData?: DataPoint[];
  visualizerData: VisualizerData;
  stage: number;
  setStage: (stage: number) => void;
  setResults: (results: ClassificationCounts) => void;
  setUnseenResults?: (results: ClassificationCounts) => void;
  modifyVisualizerData: (modifyFn: (data: VisualizerData) => VisualizerData) => void;
}

interface BoxInfo {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export const CurveVisualizer = ({
  seenData,
  unseenData,
  visualizerData,
  stage,
  setStage,
  setResults,
  setUnseenResults,
  modifyVisualizerData,
}: Props) => {

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const areaPolygonsRef = useRef<HTMLDivElement>(null);

  const [chartReady, setChartReady] = useState(false);
  const [overlayReady, setOverlayReady] = useState(false);

  const [overlayCurve, setOverlayCurve] = useState<Point[]>([]);

  const graphCurve = useMemo(() => {
    return visualizerData.graphCurve || [];
  }, [visualizerData.graphCurve]);
  const setGraphCurve = (newClickCoords: Point[]) => {
    modifyVisualizerData((data) => ({
      ...data,
      graphCurve: newClickCoords,
    }));
  };

  const [isDrawing, setIsDrawing] = useState(false);

  const [areaPolygons, setAreaPolygons] = useState<AreaPolygons>({
    area1: { graph: [], overlay: [] },
    area2: { graph: [], overlay: [] },
  });

  const originIsPass = visualizerData.originIsPass;
  const setOriginIsPass = (newValue: boolean | null | ((old: boolean | null) => boolean | null)) => {
    modifyVisualizerData((data) => ({
      ...data,
      originIsPass: typeof newValue === "function" ? newValue(data.originIsPass) : newValue,
    }));
  };

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

  // Whether to show seen data points
  const showSeenData = visualizerData.showSeenData;
  const setShowSeenData = (updateFn: (old: boolean) => boolean) => {
    modifyVisualizerData((data) => ({
      ...data,
      showSeenData: updateFn(data.showSeenData),
    }));
  };

  // Whether to show unseen data points
  const showUnseenData = visualizerData.showUnseenData;
  const setShowUnseenData = (updateFn: (old: boolean) => boolean) => {
    modifyVisualizerData((data) => ({
      ...data,
      showUnseenData: updateFn(data.showUnseenData),
    }));
  };

  const { classificationVisualizer: content } = useIntlayer("app");

  const data = useMemo(() => {
    const data = [];
    if (showSeenData) {
      data.push(...seenData);
    }
    if (stage === 4 && showUnseenData && unseenData) {
      data.push(...unseenData);
    }
    return data;
  }, [showSeenData, stage, showUnseenData, unseenData, seenData]);

  const graphInOverlay: BoxInfo = useMemo(() => {
    if (!chartReady || !overlayReady || !overlayRef.current || !chartContainerRef.current) {
      return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    }

    const overlayRect = overlayRef.current.getBoundingClientRect();
    const graphElement = chartContainerRef.current.querySelector(
      ".recharts-cartesian-grid"
    ) as SVGElement | null;
    if (!graphElement) return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    const graphRect = graphElement.getBoundingClientRect();

    return {
      left: graphRect.left - overlayRect.left,
      top: graphRect.top - overlayRect.top,
      right: graphRect.right - overlayRect.left,
      bottom: graphRect.bottom - overlayRect.top,
      width: graphRect.width,
      height: graphRect.height,
    };
  }, [chartReady, overlayReady, overlayRef.current, chartContainerRef.current]);

  const overlayToGraphCoords = useCallback((overlayPoint: Point): Point => {
    const graphRectInOverlay = graphInOverlay;
    const normalize_x = graphRectInOverlay.width / 500;
    const normalize_y = graphRectInOverlay.height / 500;

    const graphX = (overlayPoint.x - graphRectInOverlay.left) / normalize_x;
    const graphY =
      500 - (overlayPoint.y - graphRectInOverlay.top) / normalize_y;

    return { x: graphX, y: graphY };
  }, [graphInOverlay]);

  const graphToOverlayCoords = useCallback((graphCoords: Point): Point => {
    if (!overlayRef.current || !chartContainerRef.current)
      throw new Error("Refs not set");
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const graphElement = chartContainerRef.current.querySelector(
      ".recharts-cartesian-grid"
    ) as SVGElement | null;

    if (!graphElement) {
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

  const reset = () => {
    setOverlayCurve([]);
    setGraphCurve([]);
    setIsDrawing(false);
    setAreaPolygons({
      area1: { graph: [], overlay: [] },
      area2: { graph: [], overlay: [] },
    });
    setOriginIsPass(null);
    setAreaColorsAssigned(false);
    setStage(0);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isDrawing || !overlayRef.current || stage === 4) return;

    reset();
    setIsDrawing(true);
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const x = event.clientX - overlayRect.left;
    const y = event.clientY - overlayRect.top;
    setOverlayCurve([{ x, y }]);
  };

  const handleMouseMove = (event: React.PointerEvent<HTMLDivElement>) => {
    // if (event.pressure === 0) return;
    if (overlayCurve.length === 0 || !isDrawing) return;
    const overlayRect = overlayRef.current!.getBoundingClientRect();
    const x = event.clientX - overlayRect.left;
    const y = event.clientY - overlayRect.top;
    setOverlayCurve((prev) => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStage(1);
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

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    // To prevent scroll and get better control
    // On IPad kiosk browser lite, the page scrolls when trying to draw
    const blockTouch = (e: TouchEvent) => e.preventDefault();

    el.addEventListener('touchmove', blockTouch, { passive: false });

    return () => {
      el.removeEventListener('touchmove', blockTouch);
    };
  }, []);

  useEffect(() => {
    if (overlayCurve.length <= 1 || isDrawing !== false || stage !== 1) return;

    if (!overlayRef.current || !chartContainerRef.current) return;

    const graphBounds = {
      left: graphInOverlay.left,
      top: graphInOverlay.top,
      right: graphInOverlay.right,
      bottom: graphInOverlay.bottom,
    };

    // Validate start and end points
    const startPoint = overlayCurve[0];
    const endPoint = overlayCurve[overlayCurve.length - 1];
    if (
      isPointInBounds(startPoint, graphBounds) ||
      isPointInBounds(endPoint, graphBounds)
    ) {
      setDialogMessage(content.alerts.invalidBounds.value);
      setIsDialogOpen(true);
      return;
    }

    // Validate self-intersection
    if (checkSelfIntersection(overlayCurve)) {
      setDialogMessage(content.alerts.selfIntersection.value);
      setIsDialogOpen(true);
      return;
    }

    const intersections = getCurveIntersections(overlayCurve, graphBounds);
    if (intersections.length !== 2) {
      setDialogMessage(content.alerts.invalidIntersections.value);
      setIsDialogOpen(true);
      return;
    }

    let startIndex = -1, endIndex = -1;
    for (let i = 0; i < overlayCurve.length - 1; i++) {
      if (isPointInBounds(overlayCurve[i], graphBounds)) {
        if (startIndex === -1) {
          startIndex = i;
        }
        endIndex = i;
      }
    }

    if (startIndex === -1) {
      // Curve passes through bounds but has no points inside?
      // This can happen for very fast drawing.
      // We can just use the intersections.
      const finalCurve = [
        intersections[0],
        intersections[intersections.length - 1],
      ];
      const cleanedCurve = cleanSmallIntersections(finalCurve);
      setGraphCurve(cleanedCurve.map(overlayToGraphCoords));
      return;
    }

    const curveInside = overlayCurve.slice(startIndex, endIndex + 1);
    const finalCurve = [
      intersections[0],
      ...curveInside,
      intersections[intersections.length - 1],
    ];

    setGraphCurve(finalCurve.map(overlayToGraphCoords));
  }, [stage, overlayCurve, overlayToGraphCoords, isDrawing, graphInOverlay]);

  useEffect(() => {
    if (!chartReady || !overlayReady) return;  

    if (graphCurve.length > 1) {
      const polygons = getAreaPolygons(
        graphCurve.map((p) => ({ graph: p, overlay: graphToOverlayCoords(p) })),
        graphToOverlayCoords
      );
      setAreaPolygons(polygons);
    } else {
      setAreaPolygons({
        area1: { graph: [], overlay: [] },
        area2: { graph: [], overlay: [] },
      });
    }
  }, [stage, graphCurve, graphToOverlayCoords, chartReady, overlayReady]);

  const handleAreaSelection = (
    event: React.MouseEvent<SVGPolygonElement>,
    isArea1: boolean
  ) => {
    event.stopPropagation();
    if (areaColorsAssigned) return;
    setOriginIsPass(isArea1);
    setAreaColorsAssigned(true);
    setStage(2);
  };

  useEffect(() => {
    if (stage >= 3 && areaColorsAssigned) {
      const counts = getClassificationCounts_Curve(
        seenData,
        areaPolygons,
        originIsPass
      );
      setResults(counts);
    }
  }, [stage, seenData, graphCurve, originIsPass, areaPolygons, setResults]);

  useEffect(() => {
    if (stage === 4 && setUnseenResults && unseenData) {
      const counts = getClassificationCounts_Curve(
        unseenData,
        areaPolygons,
        originIsPass
      );
      setUnseenResults(counts);
    }
  }, [stage, unseenData, areaPolygons, originIsPass, setUnseenResults]);

  useEffect(() => {
    const overlayElement = overlayRef.current;
    const areaPolygonsElement = areaPolygonsRef.current;

    if (
      overlayElement &&
      areaPolygonsElement &&
      graphCurve.length > 0 &&
      !areaColorsAssigned
    ) {
      areaPolygonsElement.style.zIndex = "20";
    }
    else if (areaPolygonsElement && overlayElement && areaColorsAssigned) {
      areaPolygonsElement.style.zIndex = "5";
      overlayElement.style.zIndex = "10";
    } 
    else if (overlayElement && areaPolygonsElement) {
      overlayElement.style.zIndex = "";
      areaPolygonsElement.style.zIndex = "";
    }
  }, [graphCurve, areaColorsAssigned]);

  return (
    <>
      <CurveChart
        data={data}
        curveCoords={graphCurve}
        areaPolygons={areaPolygons}
        chartContainerRef={chartContainerRef}
        area1IsRed={originIsPass}
        isClassified={stage >= 3}
        areaColorsAssigned={areaColorsAssigned}
      />
      <div
        className="absolute top-0 left-0 w-full h-full cursor-crosshair select-none z-10"
        ref={overlayRef}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onPointerLeave={handleMouseUp}
      >
        {isDrawing && overlayCurve.length > 0 && (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <polyline
              points={overlayCurve.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--chart-stroke)"
              strokeWidth="2"
            />
          </svg>
        )}

        <div className="flex flex-col absolute top-3 left-0 z-20 gap-2 text-xs w-24 xl:text-sm xl:w-32">
          {areaColorsAssigned && (
            <button
              className="border rounded px-2 py-1"
              onClick={() =>
                setOriginIsPass((prev) => (prev !== null ? !prev : null))
              }
            >
              {content.flipButton}
            </button>
          )}
          {stage === 4 && (
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
      </div>

      <div
        className="w-full h-full absolute top-0 left-0 bg-transparent"
        ref={areaPolygonsRef}
      >
        {areaPolygons.area1.overlay.length > 0 &&
          areaPolygons.area2.overlay.length > 0 && (
            <ClassificationAreas
              areaPolygons={areaPolygons}
              originIsPass={originIsPass}
              areaColorsAssigned={areaColorsAssigned}
              onAreaSelection={handleAreaSelection}
            />
          )}
      </div>

      <Dialog
        choice={false}
        open={isDialogOpen}
        message={dialogMessage}
        onYes={() => {
          setIsDialogOpen(false);
          reset();
        }}
      />
      { stage === 0 && (
        <svg
          className="w-full h-full absolute top-0 left-0 z-0 pointer-events-none rounded-xl"
        >
          <defs>
            <pattern
              id="diagonalStripes"
              patternUnits="userSpaceOnUse"
              width="10"
              height="10"
              patternTransform="rotate(45)"
            >
              <rect width="5" height="10" fill="var(--guide-fill)" />
            </pattern>
          </defs>

          <rect
            x="3%" // leave some margin around the area
            y="0"
            width="94%"
            height="100%"
            fill="url(#diagonalStripes)"
          />
          <rect
            x={graphInOverlay.left}
            y={graphInOverlay.top}
            width={graphInOverlay.width}
            height={graphInOverlay.height}
            fill="var(--chart-bg)"
          />
        </svg>
      )}
    </>
  );
};
