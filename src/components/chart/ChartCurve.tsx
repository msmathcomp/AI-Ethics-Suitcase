import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Scatter,
  Line,
} from "recharts";
import type { AreaPolygons, DataPoint, Point } from "~/types";
import { CustomDot_Curve as CustomDot } from "./CustomDot_Curve";

interface Props {
  data: DataPoint[];
  curveCoords: Point[];
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
  areaPolygons: AreaPolygons;
  area1IsRed: boolean | null;
  isClassified: boolean;
  areaColorsAssigned: boolean;
}

export const CurveChart = ({
  data,
  curveCoords,
  chartContainerRef,
  areaPolygons,
  area1IsRed,
  isClassified,
  areaColorsAssigned,
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
              areaPolygons={areaPolygons}
              area1IsRed={area1IsRed}
              isClassified={isClassified}
              areaColorsAssigned={areaColorsAssigned}
            />
          }
          name="Data Points"
        />

        {curveCoords.length > 1 && (
          <Line
            type="monotone"
            dataKey="screen_time"
            data={curveCoords.map((point) => ({
              study_time: point.x,
              screen_time: point.y,
            }))}
            stroke="black"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={false}
            connectNulls={true}
            name="Separator Curve"
            animationDuration={0}
            style={{
              zIndex: 100,
            }}
          />
        )}
      </ComposedChart>
    </div>
  );
};
