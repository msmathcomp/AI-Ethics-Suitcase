import { useEffect, useRef } from "react";
import type { AreaPolygons } from "~/types";

interface Props {
  areaPolygons: AreaPolygons;
  areaColorsAssigned: boolean;
  originIsPass: boolean | null;
  onAreaSelection: (
    event: React.MouseEvent<SVGPolygonElement>,
    originIsPass: boolean
  ) => void;
}

const AREA_SELECT = "rgb(156 163 175)";

export const ClassificationAreas = ({
  areaPolygons,
  areaColorsAssigned,
  originIsPass,
  onAreaSelection,
}: Props) => {
  const areaPolygonsRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (areaColorsAssigned && areaPolygonsRef.current) {
      areaPolygonsRef.current.style.zIndex = "-50";
    }
  }, [areaColorsAssigned]);

  // const corners = [
  //   { x: 0, y: 0 },
  //   { x: 0, y: 500 },
  //   { x: 500, y: 500 },
  //   { x: 500, y: 0 },
  // ];

  // const x = useMemo(() => {
  //   const labels: (Point & { label: string })[] = [];
  //   for (const corner of corners) {
  //     let value: number = -1;
  //     if (
  //       (value = areaPolygons.area1.graph.findIndex(
  //         (p) => p.x === corner.x && p.y === corner.y
  //       )) !== -1
  //     ) {
  //       labels.push({
  //         x: areaPolygons.area1.overlay[value].x,
  //         y: areaPolygons.area1.overlay[value].y,
  //         label: "Pass",
  //       });
  //     } else if (
  //       (value = areaPolygons.area2.graph.findIndex(
  //         (p) => p.x === corner.x && p.y === corner.y
  //       )) !== -1
  //     ) {
  //       labels.push({
  //         x: areaPolygons.area2.overlay[value].x,
  //         y: areaPolygons.area2.overlay[value].y,
  //         label: "Fail",
  //       });
  //     }
  //   }
  //   console.log("Labels:", labels, areaPolygons.area1);
  //   return labels;
  // }, [areaPolygons]);

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
      ref={areaPolygonsRef}
    >
      <defs>
        <pattern
          id="pass-area-pattern"
          patternUnits="userSpaceOnUse"
          width="28"
          height="49"
        >
          <rect width="28" height="49" fill="#ffffff" />
          <g fillRule="evenodd">
            <g fill="#9C92AC" fillOpacity="0.4" fillRule="nonzero">
              <path d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z" />
            </g>
          </g>
        </pattern>

        <pattern
          id="fail-area-pattern"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
        >
          <rect width="8" height="8" fill="#ffffff" />
          <g fillRule="evenodd">
            <g fill="#9C92AC" fillOpacity="0.4" fillRule="nonzero">
              <path d="M0 0h4v4H0V0zm4 4h4v4H4V4z" />
            </g>
          </g>
        </pattern>
      </defs>

      <polygon
        points={areaPolygons.area1.overlay
          .map((p) => `${p.x},${p.y}`)
          .join(" ")}
        fill={
          areaColorsAssigned
            ? originIsPass
              ? "url(#pass-area-pattern)"
              : "url(#fail-area-pattern)"
            : AREA_SELECT
        }
        fillOpacity={areaColorsAssigned ? "0.5" : "0.3"}
        stroke={areaColorsAssigned ? "transparent" : "rgb(107 114 128)"}
        strokeWidth={areaColorsAssigned ? "2" : "2"}
        style={{
          pointerEvents: areaColorsAssigned ? "none" : "auto",
          cursor: areaColorsAssigned ? "default" : "pointer",
          zIndex: -10,
        }}
        onClick={(e) => onAreaSelection(e, true)}
      />

      <polygon
        points={areaPolygons.area2.overlay
          .map((p) => `${p.x},${p.y}`)
          .join(" ")}
        fill={
          areaColorsAssigned
            ? originIsPass
              ? "url(#fail-area-pattern)"
              : "url(#pass-area-pattern)"
            : AREA_SELECT
        }
        fillOpacity={areaColorsAssigned ? "0.5" : "0.3"}
        stroke={areaColorsAssigned ? "transparent" : "rgb(107 114 128)"}
        strokeWidth={areaColorsAssigned ? "2" : "2"}
        style={{
          pointerEvents: areaColorsAssigned ? "none" : "auto",
          cursor: areaColorsAssigned ? "default" : "pointer",
          zIndex: -10,
        }}
        onClick={(e) => onAreaSelection(e, false)}
      />

      {/* {x.map((label, index) => (
        <text
          key={index}
          x={label.x + 10}
          y={label.y + 10}
          fill="black"
          fontSize="12"
          fontWeight="bold"
          z={10}
        >
          {label.label}
        </text>
      ))} */}
    </svg>
  );
};
