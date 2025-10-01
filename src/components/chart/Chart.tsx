import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Scatter,
  Line,
  ResponsiveContainer,
} from "recharts";
import type { DataPoint, ClickCoordinates } from "~/types";
import { CustomDot } from "./CustomDot";
import { useIntlayer } from "react-intlayer";

interface Props {
  data: DataPoint[];
  lineCoords: ClickCoordinates[];
  originIsPass: boolean | null;
  areaColorsAssigned: boolean;
  stage: number;
  chartContainerRef: React.LegacyRef<HTMLDivElement>;
}

export const Chart = ({
  data,
  lineCoords,
  originIsPass,
  areaColorsAssigned,
  stage,
  chartContainerRef,
}: Props) => {
  const { chart } = useIntlayer("app");

  return (
    <div className="ml-10 h-full aspect-square flex items-center justify-center">
      <ResponsiveContainer ref={chartContainerRef} height="95%" width="95%">
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
              value: chart.axisLabels.x.value,
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
              value: chart.axisLabels.y.value,
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
            shape={
              <CustomDot
                lineCoords={lineCoords}
                originIsPass={originIsPass}
                areaColorsAssigned={areaColorsAssigned}
                stage={stage}
              />
            }
            name="Data Points"
            animationDuration={0}
          />
          {lineCoords.length === 2 && (
            <Line
              dataKey="screen_time"
              data={lineCoords.map((point) => ({
                study_time: point.graph.x,
                screen_time: point.graph.y,
              }))}
              stroke="black"
              strokeWidth={3}
              dot={false}
              connectNulls={true}
              name="Separator Line"
              animationDuration={0}
              style={{
                zIndex: 100,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
