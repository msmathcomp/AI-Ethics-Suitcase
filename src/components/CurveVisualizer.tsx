import { useState, useRef, useCallback, useEffect } from "react";
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
import Toggle from "./UI/Toggle";
import { CurveChart } from "./chart/ChartCurve";

interface Props {
  data: DataPoint[];
  testData?: DataPoint[];
  stage: number;
  setStage: (stage: number) => void;
  setResults: (results: ClassificationCounts) => void;
  setUnseenResults?: (results: ClassificationCounts) => void;
}

export const CurveVisualizer = ({
  data,
  testData,
  stage,
  setStage,
  setResults,
  setUnseenResults,
}: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const areaPolygonsRef = useRef<HTMLDivElement>(null);

  const [overlayCurve, setOverlayCurve] = useState<Point[]>([]);
  const [graphCurve, setGraphCurve] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const [areaPolygons, setAreaPolygons] = useState<AreaPolygons>({
    area1: { graph: [], overlay: [] },
    area2: { graph: [], overlay: [] },
  });
  const [area1IsRed, setArea1IsRed] = useState<boolean | null>(null);
  const [areaColorsAssigned, setAreaColorsAssigned] = useState(false);
  const [showUnseenData, setShowUnseenData] = useState(false);

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
    setArea1IsRed(null);
    setAreaColorsAssigned(false);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawing || !overlayRef.current || stage === 4) return;
    
    reset();
    setIsDrawing(true);
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const x = event.clientX - overlayRect.left;
    const y = event.clientY - overlayRect.top;
    setOverlayCurve([{ x, y }]);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (overlayCurve.length === 0 || !isDrawing) return;
    console.log("Mouse move)");
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
    if (overlayCurve.length > 1 && isDrawing === false && stage === 1) {
      if (!overlayRef.current || !chartContainerRef.current) return;

      console.log("Drawing done, processing curve...");

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
    if (graphCurve.length > 1) {
      const polygons = getAreaPolygons(
        graphCurve.map((p) => ({ graph: p, overlay: graphToOverlayCoords(p) })),
        graphToOverlayCoords
      );
      console.log("Area polygons:", polygons);
      setAreaPolygons(polygons);
    }
  }, [stage, graphCurve, graphToOverlayCoords]);

  const handleAreaSelection = (
    event: React.MouseEvent<SVGPolygonElement>,
    isArea1: boolean
  ) => {
    event.stopPropagation();
    if (areaColorsAssigned) return;
    setArea1IsRed(isArea1);
    setAreaColorsAssigned(true);
    setStage(2);
  };

  useEffect(() => {
    if (stage === 3) {
      const counts = getClassificationCounts_Curve(
        data,
        areaPolygons,
        area1IsRed
      );
      setResults(counts);
    }
  }, [stage, data, graphCurve, area1IsRed, areaPolygons, setResults]);

  useEffect(() => {
    if (stage === 4 && setUnseenResults && testData) {
      const counts = getClassificationCounts_Curve(
        testData,
        areaPolygons,
        area1IsRed
      );
      setUnseenResults(counts);
    }
  }, [stage, testData, areaPolygons, area1IsRed, setUnseenResults]);

  useEffect(() => {
    const overlayElement = overlayRef.current;
    const areaPolygonsElement = areaPolygonsRef.current;

    if (
      overlayElement &&
      areaPolygonsElement &&
      graphCurve.length > 0 &&
      !areaColorsAssigned
    ) {
      overlayElement.style.zIndex = "9";
      areaPolygonsElement.style.zIndex = "9";
    }
  }, [graphCurve, areaColorsAssigned]);

  useEffect(() => {
    const areaPolygonsElement = areaPolygonsRef.current;
    const overlayElement = overlayRef.current;
    if (areaPolygonsElement && overlayElement && areaColorsAssigned) {
      areaPolygonsElement.style.zIndex = "-50";
      overlayElement.style.zIndex = "10";
    }
  }, [areaColorsAssigned]);

  return (
    <>
      <CurveChart
        data={stage === 4 && showUnseenData && testData ? testData : data}
        curveCoords={graphCurve}
        areaPolygons={areaPolygons}
        chartContainerRef={chartContainerRef}
        area1IsRed={area1IsRed}
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
              stroke="black"
              strokeWidth="2"
            />
          </svg>
        )}

        {stage === 4 && (
          <Toggle
            leftOption="Training Data"
            rightOption="Test Data"
            value={showUnseenData}
            onChange={setShowUnseenData}
            className="absolute top-4 left-4 z-15"
          />
        )}
      </div>

      <div
        className="w-full h-full z-9 absolute top-0 left-0 bg-transparent"
        ref={areaPolygonsRef}
      >
        {areaPolygons.area1.overlay.length > 0 &&
          areaPolygons.area2.overlay.length > 0 && (
            <ClassificationAreas
              areaPolygons={areaPolygons}
              originIsPass={area1IsRed}
              areaColorsAssigned={areaColorsAssigned}
              onAreaSelection={handleAreaSelection}
            />
          )}
      </div>
    </>
  );
};
