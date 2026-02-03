import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Scatter,
  Line,
  ResponsiveContainer,
} from "recharts";
import type { AreaPolygons, DataPoint, Point } from "~/types";
import { CustomDotCurve as CustomDot } from "./CustomDotCurve";
import { useIntlayer } from "react-intlayer";

interface Props {
  data: DataPoint[];
  curveCoords: Point[];
  chartContainerRef: React.LegacyRef<HTMLDivElement>;
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
  const { chart } = useIntlayer("app");

  return (
    <div className="ml-10 h-full aspect-square flex items-center justify-center z-10">
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
                areaPolygons={areaPolygons}
                area1IsRed={area1IsRed}
                isClassified={isClassified}
                areaColorsAssigned={areaColorsAssigned}
              />
            }
            name="Data Points"
            animationDuration={0}
          />

          {curveCoords.length > 1 && (
            <Line
              type="monotone"
              dataKey="screen_time"
              data={curveCoords.map((point) => ({
                study_time: point.x,
                screen_time: point.y,
              }))}
              stroke="var(--chart-stroke)"
              strokeWidth={3}
              dot={false}
              connectNulls={true}
              name="Separator Curve"
              animationDuration={0}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
