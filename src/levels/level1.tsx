import nlFlag from "../../assets/nl.svg";
import ukFlag from "../../assets/uk.svg";
import { useEffect, useRef, useState } from "react";
import { Legend } from "../components/UI/Legend";
import { ClassificationResults } from "../components/UI/ClassificationResults";
import type {
  ClassificationCounts,
  Point,
  AreaPolygons
} from "../types";
import { useNavigate } from "react-router";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import { getAreaPolygons } from "../utils/geometry";
import { ClassificationAreas } from "../components/Chart/ClassificationAreas";
import Joyride, { type CallBackProps, type Step } from "react-joyride";
import { Frown, Smile } from "lucide-react";

interface ResultsData {
  accuracy: string | null;
  counts: ClassificationCounts;
}

const CustomDotLevel1 = ({
  cx,
  cy,
  payload,
}: {
  cx?: number;
  cy?: number;
  payload?: { type: "a" | "b"; id: string };
}) => {
  if (!cx || !cy || !payload) return null;

  let fillColor = "transparent";
  let IconComponent = null;

  switch (payload.id) {
    case "TP":
    case "TN":
      fillColor = "rgb(34 197 94)"; // green-500
      IconComponent = Smile;
      break;
    case "FP":
    case "FN":
      fillColor = "rgb(239 68 68)"; // red-500
      IconComponent = Frown;
      break;
  }

  if (payload?.type === "a") {
    return (
      <g id={payload.id}>
        <circle
          cx={cx}
          cy={cy}
          r={10}
          stroke="black"
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
      <g id={payload.id}>
        <rect
          x={cx - 10}
          y={cy - 10}
          width={20}
          height={20}
          stroke="black"
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

const instructions = ["How to measure the accuracy of a linear classifier?"];

const data = [
  { study_time: 100, screen_time: 300, type: "b", id: "FP" },
  { study_time: 350, screen_time: 300, type: "b", id: "TN" },
  { study_time: 100, screen_time: 150, type: "a", id: "TP" },
  { study_time: 350, screen_time: 150, type: "a", id: "FN" },
];

const steps: Step[] = [
  {
    target: "#instruction",
    content:
      "We will now explain the terms used to measure the accuracy of a linear classifier.",
    disableBeacon: true,
  },
  {
    target: "#classification-results",
    content:
      "The classification results show the counts of true positives, true negatives, false positives, and false negatives.",
    disableBeacon: true,
  },
  {
    target: ".recharts-wrapper",
    content:
      "This chart shows the data points of 4 students. Our linear classifier divides it into 2 parts, the left being classified as Pass and the right being classified as Fail",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "#FP",
    content:
      "This student failed however our classifier classified them as Pass. This is a False Positive.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "#TN",
    content:
      "This student failed and our classifier classified them as Fail. This is a True Negative.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "#TP",
    content:
      "This student passed and our classifier classified them as Pass. This is a True Positive.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "#FN",
    content:
      "This student passed however our classifier classified them as Fail. This is a False Negative.",
    disableBeacon: true,
  },
  {
    target: "#classification-results",
    content:
      "The accuracy of the classifier is calculate using the formula: Accuracy = (TP + TN) / (TP + TN + FP + FN).",
    disableBeacon: true,
    placement: "bottom",
  },
];

export default function Level1() {
  const navigate = useNavigate();
  const level = 1;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const results: ResultsData = {
    accuracy: "50",
    counts: {
      TP: 1,
      TN: 1,
      FP: 1,
      FN: 1,
    },
  };
  const [areaPolygons, setAreaPolygons] = useState<AreaPolygons | null>(null);
  const [run, setRun] = useState(false);

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

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      navigate("/AI-Ethics-Suitcase/level/2");
    }
  };

  return (
    <main className="h-screen w-screen flex flex-col items-center p-4">
      <nav className="w-full h-14 flex items-center px-2 justify-between border-b-1">
        <h1 className="text-2xl">AI Ethics Suitcase</h1>
        <div className="flex items-center">
          <button className="flex items-center cursor-pointer">
            <img src={ukFlag} alt="English" className="h-6" />
            <span className="ml-1">English</span>
          </button>
          <hr className="inline-block h-6 w-px bg-black m-2" />
          <button className="flex items-center cursor-pointer">
            <img src={nlFlag} alt="Nederlands" className="h-6" />
            <span className="ml-1">Nederlands</span>
          </button>
        </div>
      </nav>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        callback={handleJoyrideCallback}
        styles={{
          options: {
            arrowColor: "#e3ffeb",
            backgroundColor: "#e3ffeb",
            primaryColor: "#000",
            textColor: "#004a14",
            zIndex: 10000,
          },
          spotlight: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "solid 2px black",
            zIndex: 100000,
          },
          overlay: {
            backgroundColor: "rgba(200, 200, 200, 0.1)",
            zIndex: 999,
          },
        }}
      />
      <div className="flex w-full flex-1">
        <div className="h-full w-[30%] flex flex-col p-4 border-r-1">
          <div id="level-progress-bar" className="mb-10">
            <h3 className="text-xl">Level {level}</h3>
            <div className="flex gap-2">
              {[...Array(10)].map((_, index) => {
                let backgroundColor = "gray";
                if (index < level + 1) {
                  backgroundColor = "green";
                } else if (index === level + 1) {
                  backgroundColor = "blue";
                }
                return (
                  <div
                    key={index}
                    className="rounded-full w-5 h-5"
                    style={{
                      backgroundColor: backgroundColor,
                    }}
                  />
                );
              })}
            </div>
          </div>
          <Legend />

          <ClassificationResults
            classificationCounts={results.counts}
            accuracy={results.accuracy}
          />
        </div>
        <div className="flex-1 h-full flex flex-col items-center">
          <div
            className="flex p-4 border-b-1 w-full h-[100px] justify-center"
            id="instruction"
          >
            <h2 className="text-xl font-medium mb-2 break-words flex-1">
              {instructions[Math.min(stage, instructions.length - 1)]}
            </h2>
            <div className="w-24 h-full">
              {stage === 3 && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded my-auto"
                  onClick={() => setStage(4)}
                >
                  Next
                </button>
              )}
            </div>
          </div>
          <div className="h-[600px] w-full flex items-center justify-center relative py-10">
            <div ref={chartContainerRef}>
              <ComposedChart
                height={550}
                width={700}
                margin={{ top: 30, right: 30, bottom: 30, left: 90 }}
              >
                <XAxis
                  dataKey="study_time"
                  type="number"
                  domain={[0, 500]}
                  label={{
                    value: "Study Time (min)",
                    position: "insideBottom",
                    offset: -10,
                  }}
                />
                <YAxis
                  dataKey="screen_time"
                  type="number"
                  domain={[0, 500]}
                  label={{
                    value: "Screen Time (min)",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Scatter
                  dataKey="screen_time"
                  data={data}
                  fill="#8884d8"
                  shape={<CustomDotLevel1 />}
                  name="Data Points"
                />
                <Line
                  dataKey="screen_time"
                  data={[
                    { screen_time: 0, study_time: 250 },
                    { screen_time: 500, study_time: 250 },
                  ]}
                  stroke="black"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={false}
                  connectNulls={true}
                  name="Separator Line"
                  animationDuration={0}
                />
              </ComposedChart>
            </div>

            <div
              className="w-full h-full z-10 absolute top-0 left-0 bg-transparent"
              ref={overlayRef}
            >
              {areaPolygons && (
                <ClassificationAreas
                  areaPolygons={areaPolygons}
                  areaColorsAssigned={true}
                  area1IsRed={true}
                  onAreaSelection={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
