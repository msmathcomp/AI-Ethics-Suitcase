import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type {
  ClickCoordinates,
  AreaPolygons,
  Point,
  DataPoint,
  ClassificationCounts,
} from "../types";
import { getClassificationCounts } from "../utils/classification";
import {
  getAreaPolygons,
  getExtendedLinePoints,
  findIntersections,
  findIntersectionsForDrag,
} from "../utils/geometry";
import { Chart } from "./Chart/Chart";
import { ClassificationAreas } from "./Chart/ClassificationAreas";
import { ExtendedLinePoints } from "./Chart/ExtendedLinePoints";

interface Props {
  data: DataPoint[];
  stage: number;
  setStage: (stage: number) => void;
  setResults?: (results: {
    accuracy: string | null;
    counts: ClassificationCounts;
  }) => void;
}

export const ClassificationVisualizer = ({
  data,
  stage,
  setStage,
  setResults,
}: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [lineCoords, setLineCoords] = useState<ClickCoordinates[]>([]);

  const [clickCoords, setClickCoords] = useState<ClickCoordinates[]>([]);
  const [areaPolygons, setAreaPolygons] = useState<AreaPolygons>({
    area1: [],
    area2: [],
  });

  const [extendedLinePoints, setExtendedLinePoints] = useState<
    ClickCoordinates[]
  >([]);

  const [areaColorsAssigned, setAreaColorsAssigned] = useState(false);
  const [area1IsRed, setArea1IsRed] = useState<boolean | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragJustEnded, setDragJustEnded] = useState(false);

  const classificationCounts = useMemo(() => {
    return getClassificationCounts(
      data,
      lineCoords,
      area1IsRed,
      areaColorsAssigned
    );
  }, [data, lineCoords, area1IsRed, areaColorsAssigned]);

  // const accuracy = useMemo(() => {
  //   return areaColorsAssigned
  //     ? (
  //         ((classificationCounts.TP + classificationCounts.TN) / data.length) *
  //         100
  //       ).toFixed(1)
  //     : null;
  // }, [areaColorsAssigned, classificationCounts, data.length]);

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

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || dragJustEnded) {
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
      setArea1IsRed(null);

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

  const handleAreaSelection = (
    event: React.MouseEvent<SVGPolygonElement>,
    isArea1: boolean
  ) => {
    event.stopPropagation();

    if (areaColorsAssigned) return;

    setArea1IsRed(isArea1);
    setAreaColorsAssigned(true);
  };

  useEffect(() => {
    if (clickCoords.length == 2) {
      const [p1, p2] = [clickCoords[0].graph, clickCoords[1].graph];

      const intersections = findIntersections(p1, p2);

      if (intersections.length < 2) {
        alert(
          "The line does not properly intersect the graph boundaries. Please retry."
        );
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
  }, [clickCoords, graphToOverlayCoords]);

  useEffect(() => {
    if (lineCoords.length < 2) {
      setAreaPolygons({ area1: [], area2: [] });
      return;
    }
    const polygons = getAreaPolygons(lineCoords, graphToOverlayCoords);
    setAreaPolygons(polygons);
  }, [lineCoords, graphToOverlayCoords]);

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
    const accuracy = areaColorsAssigned
      ? (
          ((classificationCounts.TP + classificationCounts.TN) / data.length) *
          100
        ).toFixed(1)
      : null;

    if (stage == 4 && setResults && areaColorsAssigned && accuracy !== null) {
      setResults({
        accuracy: accuracy,
        counts: classificationCounts,
      });
    }
  }, [stage, areaColorsAssigned, classificationCounts]);

  const chart = (
    <>
      <Chart
        data={data}
        lineCoords={lineCoords}
        area1IsRed={area1IsRed}
        areaColorsAssigned={areaColorsAssigned}
        stage={stage}
        chartContainerRef={chartContainerRef}
      />

      <div
        className="w-full h-full z-10 absolute top-0 left-0 cursor-crosshair bg-transparent"
        ref={overlayRef}
        onClick={handleOverlayClick}
        onMouseMove={handleOverlayMouseMove}
        onMouseUp={handleOverlayMouseUp}
        onMouseLeave={handleOverlayMouseUp}
      >
        {clickCoords.length === 1 && (
          <div
            className="absolute bg-blue-500"
            style={{
              top: clickCoords[0].overlay.y - 6,
              left: clickCoords[0].overlay.x - 6,
              width: 12,
              height: 12,
              borderRadius: "50%",
            }}
          />
        )}

        {lineCoords.length === 2 &&
          areaPolygons.area1.length > 0 &&
          areaPolygons.area2.length > 0 && (
            <ClassificationAreas
              areaPolygons={areaPolygons}
              areaColorsAssigned={areaColorsAssigned}
              area1IsRed={area1IsRed}
              onAreaSelection={handleAreaSelection}
            />
          )}

        <ExtendedLinePoints
          extendedLinePoints={extendedLinePoints}
          lineCoords={lineCoords}
          onExtendedPointMouseDown={handleExtendedPointMouseDown}
        />
      </div>
    </>
  );

  return chart;
};
