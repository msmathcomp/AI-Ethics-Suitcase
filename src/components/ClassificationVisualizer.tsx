import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import Toggle from "./UI/Toggle";
import { useIntlayer } from "react-intlayer";

interface Props {
  data: DataPoint[];
  testData?: DataPoint[];
  stage: number;
  setStage: (stage: number) => void;
  setResults: (results: ClassificationCounts) => void;
  setBestResults?: (results: ClassificationCounts) => void;
  setUnseenResults?: (results: ClassificationCounts) => void;
  setUnseenBestResults?: (results: ClassificationCounts) => void;
  bestClassifier: {
    line: Point[];
    originIsPass: boolean;
  };
}

export const ClassificationVisualizer = ({
  data,
  testData,
  stage,
  setStage,
  setResults,
  setBestResults,
  setUnseenResults,
  setUnseenBestResults,
  bestClassifier,
}: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const areaPolygonsRef = useRef<HTMLDivElement>(null);
  const [lineCoords, setLineCoords] = useState<ClickCoordinates[]>([]);
  const [bestLineCoords, setBestLineCoords] = useState<ClickCoordinates[]>([]);

  const [clickCoords, setClickCoords] = useState<ClickCoordinates[]>([]);
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

  const [extendedLinePoints, setExtendedLinePoints] = useState<
    ClickCoordinates[]
  >([]);

  const [areaColorsAssigned, setAreaColorsAssigned] = useState(false);
  // const [area1IsRed, setArea1IsRed] = useState<boolean | null>(null);
  const [showBestLine, setShowBestLine] = useState(true);
  const [showUnseenData, setShowUnseenData] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragJustEnded, setDragJustEnded] = useState(false);
  const [originIsPass, setOriginIsPass] = useState<boolean | null>(null);

  const { classificationVisualizer: content } = useIntlayer("app");

  const classificationCounts = useMemo(() => {
    return getClassificationCounts(
      data,
      lineCoords,
      originIsPass,
      areaColorsAssigned
    );
  }, [data, lineCoords, originIsPass, areaColorsAssigned]);

  const unseenClassificationCounts = useMemo(() => {
    if (!testData) {
      return { TP: 0, TN: 0, FP: 0, FN: 0 };
    }
    return getClassificationCounts(
      testData,
      lineCoords,
      originIsPass ?? null,
      areaColorsAssigned
    );
  }, [testData, lineCoords, originIsPass, areaColorsAssigned]);

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

  // TODO: FIX this
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
  }, [clickCoords, graphToOverlayCoords]);

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
    console.log("Getting polygons", polygons);
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
    if (stage >= 6 && setUnseenResults && areaColorsAssigned && testData) {
      setUnseenResults(unseenClassificationCounts);
    }
  }, [
    stage,
    areaColorsAssigned,
    unseenClassificationCounts,
    setUnseenResults,
    testData,
  ]);

  // Create best classifier line when entering stage 5
  useEffect(() => {
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
        data,
        bestLineCoords2,
        bestClassifier.originIsPass,
        true
      );

      if (setBestResults) {
        setBestResults(bestClassificationCounts);
      }

      // Calculate best classifier results on unseen data
      if (testData && setUnseenBestResults) {
        const bestUnseenClassificationCounts = getClassificationCounts(
          testData,
          bestLineCoords2,
          bestClassifier.originIsPass,
          true
        );

        setUnseenBestResults(bestUnseenClassificationCounts);
      }

      console.log("Best classifier created");
    }
  }, [
    stage,
    bestLineCoords,
    bestClassifier,
    data,
    graphToOverlayCoords,
    originIsPass,
    setBestResults,
    setUnseenBestResults,
    testData,
  ]);

  useEffect(() => {
    const overlayElement = overlayRef.current;
    const areaPolygonsElement = areaPolygonsRef.current;

    if (
      overlayElement &&
      areaPolygonsElement &&
      clickCoords.length == 2 &&
      !areaColorsAssigned
    ) {
      overlayElement.style.zIndex = "9";
      areaPolygonsElement.style.zIndex = "9";
    }
  }, [clickCoords, areaColorsAssigned]);

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
      <Chart
        data={stage === 6 && showUnseenData && testData ? testData : data}
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

        {(stage === 5 || stage === 6) && (
          <Toggle
            leftOption={content.toggles.yourClassifier}
            rightOption={content.toggles.bestClassifier}
            value={showBestLine}
            onChange={setShowBestLine}
            className="absolute top-4 left-4"
          />
        )}

        {stage === 6 && (
          <Toggle
            leftOption={content.toggles.trainingData}
            rightOption={content.toggles.testData}
            value={showUnseenData}
            onChange={setShowUnseenData}
            className="absolute top-17 left-4"
          />
        )}

        <ExtendedLinePoints
          extendedLinePoints={
            stage >= 5 && showBestLine ? [] : extendedLinePoints
          }
          lineCoords={stage >= 5 && showBestLine ? bestLineCoords : lineCoords}
          onExtendedPointMouseDown={
            stage < 5 || !showBestLine ? handleExtendedPointMouseDown : () => {}
          }
        />
      </div>

      <div
        className="w-full h-full z-9 absolute top-0 left-0 cursor-crosshair bg-transparent"
        ref={areaPolygonsRef}
      >
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
              onAreaSelection={() => {}} // No area selection for best classifier
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
