import { CartesianGrid, ComposedChart, Scatter, XAxis, YAxis } from "recharts";
import Joyride, { type Step, type CallBackProps } from "react-joyride";
import { LevelProgressBar } from "~/components/UI/LevelProgressBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Nav from "~/components/layout/Nav";
import { Legend } from "~/components/UI/Legend";
import { useIntlayer, type IntlayerNode } from "react-intlayer";

const CustomDotIntro = ({
  cx,
  cy,
  payload,
}: {
  cx?: number;
  cy?: number;
  payload?: { type: "Pass" | "Fail"; id?: string };
}) => {
  if (!cx || !cy || !payload) return null;

  if (payload?.type === "Pass") {
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

interface IntroContentShape {
  headerTitle: unknown;
  tour: Record<string, IntlayerNode>;
}

const stepsFactory = (introContent: IntroContentShape): Step[] => [
  {
    target: "#instruction",
    content: introContent.tour[0],
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "#level-progress-bar",
    content: introContent.tour[1],
    disableBeacon: true,
    placement: "right-end",
  },
  {
    target: "#legend",
    content: introContent.tour[2],
    disableBeacon: true,
    placement: "right",
  },
  {
    target: ".recharts-wrapper",
    content: introContent.tour[3],
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".recharts-xAxis",
    content: introContent.tour[4],
    disableBeacon: true,
    placement: "top",
  },
  {
    target: ".recharts-yAxis",
    content: introContent.tour[5],
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "#label-pass",
    content: introContent.tour[6],
    placement: "right",
  },
  {
    target: "#label-fail",
    content: introContent.tour[7],
    placement: "right",
  },
];

export default function IntroLevel() {
  const { intro: introContent, chart: chartContent } = useIntlayer("app");
  const [run, setRun] = useState(false);
  const navigate = useNavigate();
  useEffect(() => setRun(true), []);
  const steps = stepsFactory(introContent);
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      navigate("/level/0");
    }
  };

  return (
    <main className="h-screen w-screen flex flex-col items-center p-4">
      <Nav />
      <div className="flex w-full flex-1">
        <Joyride
          steps={steps}
          run={run}
          continuous
          showProgress
          callback={handleJoyrideCallback}
          disableOverlay={false}
          styles={{
            options: {
              arrowColor: "#e3ffeb",
              backgroundColor: "#e3ffeb",
              primaryColor: "#000",
              textColor: "#004a14",
            },
            spotlight: {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "solid 2px black",
              pointerEvents: "none",
            },
            overlay: {
              backgroundColor: "rgba(200, 200, 200, 0.1)",
              pointerEvents: "none",
            },
          }}
        />
        <div className="h-full w-[30%] flex flex-col p-4 border-r-1">
          <LevelProgressBar level={-1} showNextLevelButton={false} />
          <Legend />
        </div>
        <div className="flex-1 h-full flex flex-col items-center">
          <div className="p-4 border-b-1 w-full" id="instruction">
            <h2 className="text-2xl font-medium mb-2">
              {introContent.headerTitle}
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
                  value: chartContent.axisLabels.x.value,
                  position: "insideBottom",
                  offset: -10,
                }}
              />
              <YAxis
                dataKey="screen_time"
                type="number"
                domain={[0, 500]}
                label={{
                  value: chartContent.axisLabels.y.value,
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
              />
            </ComposedChart>
          </div>
        </div>
      </div>
    </main>
  );
}
