import { Smile, Frown } from "lucide-react";
import type { CustomDotProps, ClickCoordinates } from "~/types";
import { getPointClassification } from "~/utils/classification";

interface Props extends CustomDotProps {
  lineCoords: ClickCoordinates[];
  originIsPass: boolean | null;
  areaColorsAssigned: boolean;
  stage: number;
}

export const CustomDot = ({
  cx,
  cy,
  payload,
  lineCoords,
  originIsPass,
  areaColorsAssigned,
  stage,
}: Props) => {
  if (!cx || !cy || !payload) return null;

  const classificationResult = getPointClassification(
    payload,
    lineCoords,
    originIsPass,
    areaColorsAssigned
  );

  let fillColor = "transparent";
  let IconComponent = null;

  if (areaColorsAssigned && classificationResult && stage >= 4) {
    switch (classificationResult) {
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
