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

  const overlayToGraphCoords = useCallback((overlayPoint: Point): Point => {
    if (!overlayRef.current || !chartContainerRef.current)
      throw new Error("Refs not set");
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const graphElement = chartContainerRef.current.querySelector(
      ".recharts-cartesian-grid"
    ) as SVGElement | null;
    if (!graphElement) throw new Error("Graph element not found");
    const graphRect = graphElement.getBoundingClientRect();

    const graphRectInOverlay = {
      left: graphRect.left - overlayRect.left,
      top: graphRect.top - overlayRect.top,
      right: graphRect.right - overlayRect.left,
      bottom: graphRect.bottom - overlayRect.top,
      width: graphRect.width,
      height: graphRect.height,
    };

    const normalize_x = graphRectInOverlay.width / 500;
    const normalize_y = graphRectInOverlay.height / 500;

    const graphX = (overlayPoint.x - graphRectInOverlay.left) / normalize_x;
    const graphY =
      500 - (overlayPoint.y - graphRectInOverlay.top) / normalize_y;

    return { x: graphX, y: graphY };
  }, []);

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
    if (event.pressure === 0) return;
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

    // Optional: If you want to prevent scroll and get better control
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blockTouch = (e: any) => e.preventDefault();

    el.addEventListener('touchstart', blockTouch, { passive: false });
    el.addEventListener('touchmove', blockTouch, { passive: false });

    return () => {
      el.removeEventListener('touchstart', blockTouch);
      el.removeEventListener('touchmove', blockTouch);
    };
  }, []);


  useEffect(() => {
    if (overlayCurve.length > 1 && isDrawing === false && stage === 1) {
      if (!overlayRef.current || !chartContainerRef.current) return;

      const overlayRect = overlayRef.current.getBoundingClientRect();
      const graphElement = chartContainerRef.current.querySelector(
        ".recharts-cartesian-grid"
      ) as SVGElement | null;
      if (!graphElement) return;
      const graphRect = graphElement.getBoundingClientRect();

      const graphBounds = {
        left: graphRect.left - overlayRect.left,
        top: graphRect.top - overlayRect.top,
        right: graphRect.right - overlayRect.left,
        bottom: graphRect.bottom - overlayRect.top,
      };

      // Validate start and end points
      const startPoint = overlayCurve[0];
      const endPoint = overlayCurve[overlayCurve.length - 1];
      if (
        isPointInBounds(startPoint, graphBounds) ||
        isPointInBounds(endPoint, graphBounds)
      ) {
        alert("Please start and end drawing outside the graph area.");
        reset();
        return;
      }

      // Validate self-intersection
      if (checkSelfIntersection(overlayCurve)) {
        alert("The curve cannot intersect itself.");
        reset();
        return;
      }

      const intersections = getCurveIntersections(overlayCurve, graphBounds);
      if (intersections.length !== 2) {
        alert(
          "The curve must start and end outside the graph area. Please try again."
        );
        reset();
        return;
      }

      let startIndex = -1,
        endIndex = -1;
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
        setStage(2);
        return;
      }

      const curveInside = overlayCurve.slice(startIndex, endIndex + 1);
      const finalCurve = [
        intersections[0],
        ...curveInside,
        intersections[intersections.length - 1],
      ];

      setGraphCurve(finalCurve.map(overlayToGraphCoords));
    }
  }, [stage, overlayCurve, overlayToGraphCoords, isDrawing, setStage]);

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
      areaPolygonsElement.style.zIndex = "100";
      overlayElement.style.zIndex = "51";
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
        className="absolute top-0 left-0 w-full h-full cursor-crosshair select-none z-50"
        ref={overlayRef}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onPointerLeave={handleMouseUp}
        // onTouchStart={handleMouseDown}
        // onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {isDrawing && overlayCurve.length > 0 && (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <polyline
              points={overlayCurve.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="black"
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
        className="w-full h-full z-9 absolute top-0 left-0 bg-transparent"
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
    </>
  );
};
