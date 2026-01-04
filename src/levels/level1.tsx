import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ClassificationResults } from "~/components/ui/ClassificationResults";
import {
  type ClassificationCounts,
  type Point,
  type AreaPolygons,
  type DataPoint,
} from "~/types";
import { useNavigate } from "react-router";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import { getAreaPolygons } from "~/utils/geometry";
import { ClassificationAreas } from "~/components/chart/ClassificationAreas";
import Joyride, { type CallBackProps, type Step } from "react-joyride";
import { Frown, Smile } from "lucide-react";
import { useIntlayer } from "react-intlayer";
import LevelLayout from "~/components/layout/LevelLayout";
import { getPointClassification } from "~/utils/classification";
import { cn } from "~/utils/cn";
import { useClassificationResults } from "~/context/ClassificationResultsContext";

const CustomDotLevel1 = ({
  cx,
  cy,
  payload,
}: {
  cx?: number;
  cy?: number;
  payload?: DataPoint;
}) => {
  if (!cx || !cy || !payload) return null;

  let fillColor = "transparent";
  let IconComponent = null;

  const classificationResult = getPointClassification(
    payload,
    [
      { graph: { x: 250, y: 0 }, overlay: { x: 250, y: 0 } },
      { graph: { x: 250, y: 500 }, overlay: { x: 250, y: 500 } },
    ],
    true,
    true
  );

  switch (classificationResult) {
    case "TP":
    case "TN":
      fillColor = "oklch(0.704 0.14 182.503)"; // teal-500
      IconComponent = Smile;
      break;
    case "FP":
    case "FN":
      fillColor = "oklch(70.5% 0.213 47.604)"; // orange-500
      IconComponent = Frown;
      break;
  }

  if (payload.type === "Pass") {
    return (
      <g id={classificationResult!}>
        <circle
          cx={cx}
          cy={cy}
          r={10}
          stroke="var(--chart-stroke)"
          fill={fillColor}
          strokeWidth={1}
        />
        {IconComponent && (
          <foreignObject x={cx - 8} y={cy - 8} width={16} height={16}>
            <IconComponent size={16} color="white" />
          </foreignObject>
        )}
      </g>
    );
  } else {
    return (
      <g id={classificationResult!}>
        <rect
          x={cx - 10}
          y={cy - 10}
          width={20}
          height={20}
          stroke="var(--chart-stroke)"
          fill={fillColor}
          strokeWidth={1}
        />
        {IconComponent && (
          <foreignObject x={cx - 8} y={cy - 8} width={16} height={16}>
            <IconComponent size={16} color="white" />
          </foreignObject>
        )}
      </g>
    );
  }
};

export default function Level1() {
  const navigate = useNavigate();
  const {
    level1: content,
    chart: chartContent,
    tour: tourContent,
  } = useIntlayer("app");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [data, setData] = useState<DataPoint[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [disableClick, setDisableClick] = useState(false);

  const results: ClassificationCounts = useMemo(
    () =>
      data
        .map((p) =>
          getPointClassification(
            p,
            [
              { graph: { x: 250, y: 0 }, overlay: { x: 250, y: 0 } },
              { graph: { x: 250, y: 500 }, overlay: { x: 250, y: 500 } },
            ],
            true,
            true
          )
        )
        .reduce(
          (acc, curr) => {
            acc[curr!] += 1;
            return acc;
          },
          { TP: 0, TN: 0, FP: 0, FN: 0 } as ClassificationCounts
        ),
    [data]
  );
  const [areaPolygons, setAreaPolygons] = useState<AreaPolygons | null>(null);
  const [run, setRun] = useState(false);

  const { markLevelCompleted } = useClassificationResults();

  const graphToOverlayCoords = (graphCoords: Point): Point => {
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
  };

  useEffect(() => {
    if (stage === 4) {
      markLevelCompleted(1);
    }
  }, [stage, markLevelCompleted]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        areaPolygons === null &&
        chartContainerRef.current &&
        overlayRef.current
      ) {
        const { x: overlay_x1, y: overlay_y1 } = graphToOverlayCoords({
          x: 0,
          y: 225,
        });
        const { x: overlay_x2, y: overlay_y2 } = graphToOverlayCoords({
          x: 500,
          y: 225,
        });
        const polygons = getAreaPolygons(
          [
            {
              graph: { x: 250, y: 0 },
              overlay: { x: overlay_x1, y: overlay_y1 },
            },
            {
              graph: { x: 250, y: 500 },
              overlay: { x: overlay_x2, y: overlay_y2 },
            },
          ],
          graphToOverlayCoords
        );
        setAreaPolygons(polygons);
        setRun(true);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [areaPolygons, chartContainerRef, overlayRef]);

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    const graphElement = graphRef.current;
    const overlayElement = overlayRef.current;
    if (!chartContainer || !graphElement || !overlayElement) return;

    const updateGraphPosition = () => {
      const grid = chartContainer.querySelector(
        ".recharts-cartesian-grid"
      ) as SVGElement | null;
      if (!grid) return;

      const overlayRect = overlayElement.getBoundingClientRect();
      const rect = grid.getBoundingClientRect();
      graphElement.style.width = `${rect.width}px`;
      graphElement.style.height = `${rect.height}px`;
      graphElement.style.left = `${rect.left - overlayRect.left}px`;
      graphElement.style.top = `${rect.top - overlayRect.top}px`;
    };

    // Initial attempt
    updateGraphPosition();

    // Watch for later appearance
    const observer = new MutationObserver(() => {
      updateGraphPosition();
    });

    observer.observe(chartContainer, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [graphRef, chartContainerRef]);

  useEffect(() => {
    const classificationResults = data.map((p) =>
      getPointClassification(
        p,
        [
          { graph: { x: 250, y: 0 }, overlay: { x: 250, y: 0 } },
          { graph: { x: 250, y: 500 }, overlay: { x: 250, y: 500 } },
        ],
        true,
        true
      )
    );
    if (stage === 0 && classificationResults.includes("TP")) {
      setDisableClick(true);
      setTimeout(() => {
        setStage(1);
        setStepIndex(3);
        setRun(true);
        setDisableClick(false);
      }, 700);
    } else if (stage === 1 && classificationResults.includes("TN")) {
      setDisableClick(true);
      setTimeout(() => {
        setStage(2);
        setRun(true);
        setStepIndex(4);
        setDisableClick(false);
      }, 700);
    } else if (stage === 2 && classificationResults.includes("FP")) {
      setDisableClick(true);
      setStage(3);
      setTimeout(() => {
        setRun(true);
        setStepIndex(5);
        setDisableClick(false); 
      }, 700);
    } else if (stage === 3 && classificationResults.includes("FN")) {
      setDisableClick(true);
      setTimeout(() => {
        setStage(4);
        setRun(true);
        setStepIndex(6);
        setDisableClick(false);
      }, 700);
    }
  }, [data, stage]);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, index, action } = data;
      if (
        action === "next" &&
        data.lifecycle === "complete" &&
        [0, 1, 6, 7].includes(index)
      ) {
        setStepIndex((prev) => prev + 1);
        return;
      } else if (
        action === "next" &&
        data.lifecycle === "complete" &&
        [2, 3, 4, 5].includes(index)
      ) {
        setRun(false);
        return;
      }

      if (status === "finished" || status === "skipped") {
        navigate("/level/2");
        return;
      }
    },
    [navigate]
  );

  const handleGraphClick = useCallback(
    (e: React.PointerEvent) => {
      const graphRect = graphRef.current?.getBoundingClientRect();
      if (!graphRect) return;

      const clickX = e.clientX - graphRect.left;
      const clickY = e.clientY - graphRect.top;

      const normalize_y = graphRect.height / 500;
      const normalize_x = graphRect.width / 500;

      const dataX = Math.round(clickX / normalize_x);
      const dataY = Math.round(500 - clickY / normalize_y);

      const type = stage === 0 || stage === 3 ? "Pass" : "Fail";

      setData((prev) => [
        ...prev,
        { screen_time: dataY, study_time: dataX, type },
      ]);
    },
    [stage]
  );

  const steps: Step[] = [
    {
      target: "#instruction",
      content: content.tour[0],
      disableBeacon: true,
    },
    {
      target: "#classification-results",
      content: content.tour[1],
      disableBeacon: true,
    },
    {
      target: ".recharts-wrapper",
      content: content.tour[2],
      disableBeacon: true,
      placement: "right",
      disableScrollParentFix: true,
      disableScrolling: true,
    },
    {
      target: "#TP",
      content: content.tour[3],
      disableBeacon: true,
      placement: "top",
    },
    {
      target: "#TN",
      content: content.tour[4],
      disableBeacon: true,
      placement: "top",
    },
    {
      target: "#FP",
      content: content.tour[5],
      disableBeacon: true,
      placement: "bottom",
    },
    { target: "#FN", content: content.tour[6], disableBeacon: true },
    {
      target: "#classification-results",
      content: content.tour[7],
      disableBeacon: true,
      placement: "bottom",
    },
  ];

  const instructions = [
    content.instructions["1"].value,
    content.instructions["2"].value,
    content.instructions["3"].value,
    content.instructions["4"].value,
    content.instructions["5"].value,
  ];

  return (
    <>
      <LevelLayout
        goalElement={content.goal.value}
        classificationVisualizer={
          <>
            <div className="ml-10 h-full aspect-square flex items-center justify-center z-5">
              <ResponsiveContainer
                height="95%"
                width="95%"
                ref={chartContainerRef}
              >
                <ComposedChart
                  margin={{
                    top: 15,
                    right: 15,
                    bottom: 15,
                    left: 15,
                  }}
                >
                  <XAxis
                    dataKey="study_time"
                    type="number"
                    domain={[0, 500]}
                    height={50}
                    label={{
                      value: chartContent.axisLabels.x.value,
                      position: "insideBottom",
                    }}
                    ticks={[0, 100, 200, 300, 400, 500]}
                  />
                  <YAxis
                    dataKey="screen_time"
                    type="number"
                    domain={[0, 500]}
                    width={50}
                    label={{
                      value: chartContent.axisLabels.y.value,
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle" },
                      offset: -4,
                    }}
                    ticks={[0, 100, 200, 300, 400, 500]}
                  />
                  <CartesianGrid strokeDasharray="3 3" />

                  <Scatter
                    dataKey="screen_time"
                    data={data}
                    fill="#8884d8"
                    shape={<CustomDotLevel1 />}
                    name={chartContent.seriesNames.dataPoints.value}
                  />
                  <Line
                    dataKey="screen_time"
                    data={[
                      { screen_time: 0, study_time: 250 },
                      { screen_time: 500, study_time: 250 },
                    ]}
                    stroke="var(--chart-stroke)"
                    strokeWidth={3}
                    dot={false}
                    connectNulls={true}
                    name={chartContent.seriesNames.separatorLine.value}
                    animationDuration={0}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div
              className="w-full h-full absolute top-0 left-0 bg-transparent"
              ref={overlayRef}
            >
              {areaPolygons && (
                <ClassificationAreas
                  areaPolygons={areaPolygons}
                  areaColorsAssigned={true}
                  originIsPass={true}
                  onAreaSelection={() => {}}
                />
              )}
            </div>
            <div
              className={cn(
                "absolute z-20",
                run || disableClick ? "cursor-default" : "cursor-pointer"
              )}
              ref={graphRef}
              onPointerDown={run || disableClick ? undefined : handleGraphClick}
            ></div>
          </>
        }
        instruction={instructions[stage]}
        classificationResults={
          <ClassificationResults classificationCounts={results} />
        }
        level={1}
        stage={stage}
        instructionButton={null}
      />

      <div id="empty"></div>

      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous={true}
        showProgress
        callback={handleJoyrideCallback}
        disableOverlay={false}
        spotlightClicks={true}
        styles={{
          options: {
            arrowColor: "#e3ffeb",
            backgroundColor: "#e3ffeb",
            primaryColor: "#000",
            textColor: "black",
          },
          tooltip: {
            padding: 5,
            maxWidth: "300px",
          },
          tooltipContainer: {
            padding: 0,
            fontSize: "15px",
          },
          spotlight: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "solid 2px var(--chart-stroke)",
            pointerEvents: "none",
            cursor: "default",
          },
          overlay: {
            backgroundColor: "rgba(200, 200, 200, 0.1)",
            pointerEvents: "none",
          },
          buttonSkip: {
            border: "solid 1px",
            borderRadius: "4px",
            color: "black",
            fontSize: "14px",
          },
          buttonNext: {
            backgroundColor: "oklch(0.696 0.17 162.48)", // bg-emerald-500
            color: "white",
            fontSize: "14px",
          },
          buttonBack: {
            fontSize: "14px",
          },
        }}
        hideCloseButton
        hideBackButton
        locale={{
          last: tourContent.nextLevel.value,
        }}
      />
    </>
  );
}
