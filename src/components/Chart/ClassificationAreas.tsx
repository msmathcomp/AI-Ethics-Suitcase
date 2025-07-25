import type { AreaPolygons } from "../../types";

interface Props {
  areaPolygons: AreaPolygons;
  areaColorsAssigned: boolean;
  area1IsRed: boolean | null;
  onAreaSelection: (
    event: React.MouseEvent<SVGPolygonElement>,
    isArea1: boolean
  ) => void;
}

export const ClassificationAreas = ({
  areaPolygons,
  areaColorsAssigned,
  area1IsRed,
  onAreaSelection,
}: Props) => {
  if (areaPolygons.area1.length === 0 || areaPolygons.area2.length === 0) {
    return null;
  }

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <polygon
        points={areaPolygons.area1
          .map((p) => `${p.x},${p.y}`)
          .join(" ")}
        fill={
          areaColorsAssigned
            ? area1IsRed
              ? "oklch(0.623 0.214 259.815)"
              : "oklch(70.5% 0.213 47.604)"
            : "rgb(156 163 175)"
        }
        fillOpacity={areaColorsAssigned ? "0.15" : "0.3"}
        stroke={areaColorsAssigned ? "none" : "rgb(107 114 128)"}
        strokeWidth={areaColorsAssigned ? "0" : "2"}
        style={{
          pointerEvents: areaColorsAssigned ? "none" : "auto",
          cursor: areaColorsAssigned ? "default" : "pointer",
        }}
        onClick={(e) => onAreaSelection(e, true)}
      />

      <polygon
        points={areaPolygons.area2.map((p) => `${p.x},${p.y}`).join(" ")}
        fill={
          areaColorsAssigned
            ? area1IsRed
              ? "oklch(70.5% 0.213 47.604)"
              : "oklch(0.623 0.214 259.815)"
            : "rgb(156 163 175)"
        }
        fillOpacity={areaColorsAssigned ? "0.15" : "0.3"}
        stroke={areaColorsAssigned ? "none" : "rgb(107 114 128)"}
        strokeWidth={areaColorsAssigned ? "0" : "2"}
        style={{
          pointerEvents: areaColorsAssigned ? "none" : "auto",
          cursor: areaColorsAssigned ? "default" : "pointer",
        }}
        onClick={(e) => onAreaSelection(e, false)}
      />
    </svg>
  );
};
