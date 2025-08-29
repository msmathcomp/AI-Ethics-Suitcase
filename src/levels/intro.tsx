import {
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import Joyride, { type Step, type CallBackProps } from "react-joyride";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useIntlayer, type IntlayerNode } from "react-intlayer";
import LevelLayout from "~/components/layout/levelLayout";

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
    type: "Fail",
    id: "label-fail",
  },
  {
    study_time: 150,
    screen_time: 300,
    type: "Pass",
    id: "label-pass",
  },
  {
    study_time: 200,
    screen_time: 400,
    type: "Fail",
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
    placement: "left",
  },
  {
    target: ".recharts-wrapper",
    content: introContent.tour[3],
    disableBeacon: true,
    placement: "right",
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
    placement: "right",
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
    <>
      <LevelLayout
        goalElement={"Introduction: Getting familiar with visualization using charts"}
        classificationVisualizer={
          <div className="ml-10 h-full aspect-square flex items-center justify-center">
            <ResponsiveContainer height="95%" width="95%">
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
                  shape={<CustomDotIntro />}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        }
        instruction={introContent.headerTitle as string}
        instructionButton={null}
        classificationResults={null}
        level={-1}
        showNextLevelButton={false}
      />
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
          buttonSkip: {
            border: "solid 1px",
            borderRadius: "4px",
            color: "black",
          },
        }}
        hideCloseButton
        showSkipButton
        locale={{
          skip: "Skip Tutorial",
          last: "Next Level"
        }}
      />
    </>
  );
}
