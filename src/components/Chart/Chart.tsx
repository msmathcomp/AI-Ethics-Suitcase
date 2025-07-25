import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Scatter,
  Line,
} from "recharts";
import type { DataPoint, ClickCoordinates } from "../../types";
import { CustomDot } from "./CustomDot";

interface Props {
  data: DataPoint[];
  lineCoords: ClickCoordinates[];
  area1IsRed: boolean | null;
  areaColorsAssigned: boolean;
  stage: number;
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const Chart = ({
  data,
  lineCoords,
  area1IsRed,
  areaColorsAssigned,
  stage,
  chartContainerRef,
}: Props) => {
  return (
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
          shape={
            <CustomDot
              lineCoords={lineCoords}
              area1IsRed={area1IsRed}
              areaColorsAssigned={areaColorsAssigned}
              stage={stage}
            />
          }
          name="Data Points"
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
            strokeDasharray="8 4"
            dot={false}
            connectNulls={true}
            name="Separator Line"
            animationDuration={0}
          />
        )}
      </ComposedChart>
    </div>
  );
};
