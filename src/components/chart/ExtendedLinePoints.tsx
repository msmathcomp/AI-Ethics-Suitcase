import { Move } from "lucide-react";
import type { ClickCoordinates } from "~/types";

interface Props {
  elementRef: React.LegacyRef<HTMLDivElement>;
  extendedLinePoints: ClickCoordinates[];
  lineCoords: ClickCoordinates[];
  onExtendedPointMouseDown: (
    event: React.MouseEvent<HTMLDivElement>,
    pointIndex: number
  ) => void;
}

export const ExtendedLinePoints = ({
  elementRef,
  extendedLinePoints,
  lineCoords,
  onExtendedPointMouseDown,
}: Props) => {
  if (extendedLinePoints.length !== 2 || lineCoords.length !== 2) {
    return null;
  }

  return (
    <div ref={elementRef}>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <line
          x1={extendedLinePoints[0].overlay.x}
          y1={extendedLinePoints[0].overlay.y}
          x2={lineCoords[0].overlay.x}
          y2={lineCoords[0].overlay.y}
          stroke="var(--chart-stroke)"
          strokeWidth="3"
          strokeDasharray="6 3"
        />

        <line
          x1={lineCoords[1].overlay.x}
          y1={lineCoords[1].overlay.y}
          x2={extendedLinePoints[1].overlay.x}
          y2={extendedLinePoints[1].overlay.y}
          stroke="var(--chart-stroke)"
          strokeWidth="3"
          strokeDasharray="6 3"
        />
      </svg>

      {extendedLinePoints.map((coords, index) => (
        <div
          key={`extended-${index}`}
          className="absolute bg-black dark:bg-stone-900 border-2 cursor-move flex items-center justify-center z-50 touch-none cursor-pointer"
          style={{
            top: coords.overlay.y - 17,
            left: coords.overlay.x - 17,
            width: 34,
            height: 34,
            borderRadius: "50%",
          }}
          onPointerDown={(e) => onExtendedPointMouseDown(e, index)}
        >
          <Move size={22} color="white" />
        </div>
      ))}
    </div>
  );
};
