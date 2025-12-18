import { Smile, Frown } from "lucide-react";
import type { AreaPolygons, CustomDotProps } from "~/types";
import { getPointClassification_Curve } from "~/utils/classification_curve";

interface Props extends CustomDotProps {
  areaPolygons: AreaPolygons;
  area1IsRed: boolean | null;
  isClassified: boolean;
  areaColorsAssigned: boolean;
}

export const CustomDotCurve = ({
  cx,
  cy,
  payload,
  areaPolygons,
  area1IsRed,
  isClassified,
  areaColorsAssigned,
}: Props) => {
  if (!cx || !cy || !payload) return null;

  const classificationResult = getPointClassification_Curve(
    payload,
    areaPolygons,
    area1IsRed
  );

  let fillColor = "transparent";
  let IconComponent = null;

  if (areaColorsAssigned && classificationResult && isClassified) {
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
  }

  if (payload.type === "Pass") {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill={fillColor}
          stroke="black"
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
      <g>
        <rect
          x={cx - 10}
          y={cy - 10}
          width={20}
          height={20}
          fill={fillColor}
          stroke="black"
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
