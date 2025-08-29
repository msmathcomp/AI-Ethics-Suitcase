import { Move } from "lucide-react";
import type { ClickCoordinates } from "~/types";

interface Props {
  ref: React.RefObject<HTMLDivElement | null>;
  extendedLinePoints: ClickCoordinates[];
  lineCoords: ClickCoordinates[];
  onExtendedPointMouseDown: (
    event: React.MouseEvent<HTMLDivElement>,
    pointIndex: number
  ) => void;
}

export const ExtendedLinePoints = ({
  ref,
  extendedLinePoints,
  lineCoords,
  onExtendedPointMouseDown,
}: Props) => {
  if (extendedLinePoints.length !== 2 || lineCoords.length !== 2) {
    return null;
  }

  return (
    <div ref={ref}>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <line
          x1={extendedLinePoints[0].overlay.x}
          y1={extendedLinePoints[0].overlay.y}
          x2={lineCoords[0].overlay.x}
          y2={lineCoords[0].overlay.y}
          stroke="black"
          strokeWidth="3"
          strokeDasharray="6 3"
        />

        <line
          x1={lineCoords[1].overlay.x}
          y1={lineCoords[1].overlay.y}
          x2={extendedLinePoints[1].overlay.x}
          y2={extendedLinePoints[1].overlay.y}
          stroke="black"
          strokeWidth="3"
          strokeDasharray="6 3"
        />
      </svg>

      {extendedLinePoints.map((coords, index) => (
        <div
          key={`extended-${index}`}
          className="absolute bg-black border-2 cursor-move flex items-center justify-center z-50 touch-none"
          style={{
            top: coords.overlay.y - 12,
            left: coords.overlay.x - 12,
            width: 24,
            height: 24,
            borderRadius: "50%",
          }}
          onPointerDown={(e) => onExtendedPointMouseDown(e, index)}
        >
          <Move size={14} color="white" />
        </div>
      ))}
    </div>
  );
};
