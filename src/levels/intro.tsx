import { CartesianGrid, ComposedChart, Scatter, XAxis, YAxis } from "recharts";
import nlFlag from "../../assets/nl.svg";
import ukFlag from "../../assets/uk.svg";
import Joyride, { type Step, type CallBackProps } from "react-joyride";
import { Legend } from "../components/UI/Legend";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const CustomDotIntro = ({
  cx,
  cy,
  payload,
}: {
  cx?: number;
  cy?: number;
  payload?: { type: "a" | "b"; id?: string };
}) => {
  if (!cx || !cy || !payload) return null;

  if (payload?.type === "a") {
    return (
      <g id={payload.id}>
        <circle
          cx={cx}
          cy={cy}
          r={10}
          stroke="black"
          strokeWidth={1}
          fill="transparent"
        />
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
          fill="transparent"
          strokeWidth={1}
        />
      </g>
    );
  }
};

const data = [
  {
    study_time: 100,
    screen_time: 200,
    type: "b",
    id: "label-fail",
  },
  {
    study_time: 150,
    screen_time: 300,
    type: "a",
    id: "label-pass",
  },
  {
    study_time: 200,
    screen_time: 400,
    type: "b",
  },
];

const steps: Step[] = [
  {
    target: "#instruction",
    content:
      "Welcome to the AI Ethics Suitcase! This is the introduction level where you will learn about the basics of AI ethics.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "#level-progress-bar",
    content:
      "You are currently on Level -1, which is the introduction level. There are 11 more levels.",
    disableBeacon: true,
    placement: "right-end",
  },
  {
    target: "#legend",
    content:
      "This is the legend that explains the data points and classification.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: ".recharts-wrapper",
    content:
      "This is the chart that visualizes the relationship between Study Time and Screen Time.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".recharts-xAxis",
    content: "This is the X-axis representing Study Time in minutes.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: ".recharts-yAxis",
    content: "This is the Y-axis representing Screen Time in minutes.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "#label-pass",
    content:
      "This is a data point for a student who passed, with study time of 150 minutes and screen time of 300 minutes.",
    placement: "right",
  },
  {
    target: "#label-fail",
    content:
      "This is a data point for a student who failed, with study time of 100 minutes and screen time of 200 minutes.",
    placement: "right",
  },
];

export default function IntroLevel() {
  const [run, setRun] = useState(false);
  const navigate = useNavigate();
  useEffect(() => setRun(true), []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      navigate("/AI-Ethics-Suitcase/level/0");
    }
  };

  return (
    <main className="h-screen w-screen flex flex-col items-center p-4">
      <nav className="w-full h-20 flex items-center px-2 justify-between border-b-1">
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
            <h3 className="text-xl">Level -1</h3>
            <div className="flex gap-2">
              {[...Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="rounded-full w-5 h-5"
                  style={{
                    backgroundColor: index == 0 ? "green" : "gray",
                  }}
                />
              ))}
            </div>
          </div>
          <Legend />
        </div>
        <div className="flex-1 h-full flex flex-col items-center">
          <div className="p-4 border-b-1 w-full" id="instruction">
            <h2 className="text-2xl font-medium mb-2">
              Welcome to the AI Ethics Suitcase!
            </h2>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <ComposedChart
              height={550}
              width={700}
              margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
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
                shape={<CustomDotIntro />}
                name="Data Points"
              />
            </ComposedChart>
          </div>
        </div>
      </div>
    </main>
  );
}
