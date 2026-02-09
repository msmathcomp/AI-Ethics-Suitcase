import { useMemo } from "react";
import type { AreaPolygons, Point } from "~/types";
import { useIntlayer } from "react-intlayer";

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
  const { classificationAreas: content } = useIntlayer("app");

  const labelPositions = useMemo(() => {
    const area1Graph = areaPolygons.area1.graph;
    const area2Graph = areaPolygons.area2.graph;
    if (area1Graph.length === 0 || area2Graph.length === 0) return null;

    const sharedLinePoints: Point[] = area1Graph.filter((p1) =>
      area2Graph.some((p2) => p2.x === p1.x && p2.y === p1.y)
    );
    if (sharedLinePoints.length < 2) return null;
    const [lp1, lp2] = sharedLinePoints;

    const corners: Point[] = [
      { x: 0, y: 0 },
      { x: 0, y: 500 },
      { x: 500, y: 500 },
      { x: 500, y: 0 },
    ];

    const pointLineDistance = (pt: Point) => {
      const A = lp2.y - lp1.y;
      const B = lp1.x - lp2.x;
      const C = lp2.x * lp1.y - lp2.y * lp1.x;
      return Math.abs(A * pt.x + B * pt.y + C) / Math.hypot(A, B);
    };

    const findCornerLabelInfo = (area: {
      graph: Point[];
      overlay: Point[];
    }) => {
      // corners that are actually part of this area polygon (by construction)
      const candidates = corners.filter((c) =>
        area.graph.some((p) => p.x === c.x && p.y === c.y)
      );
      if (candidates.length === 0) {
        // find which 2 points align with the boundary
        const [p1, p2] = area.graph.filter(
          (p) => p.x === 0 || p.x === 500 || p.y === 0 || p.y === 500
        );
        if (!p1 || !p2) return null;

        const p1Index = area.graph.findIndex(
          (p) => p.x === p1.x && p.y === p1.y
        );
        const p2Index = area.graph.findIndex(
          (p) => p.x === p2.x && p.y === p2.y
        );
        if (p1Index === -1 || p2Index === -1) return null;
        const o1Overlay = area.overlay[p1Index];
        const o2Overlay = area.overlay[p2Index];

        const midPointGraph = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        } as Point;

        const dx = midPointGraph.x === 0 ? +5 : -10; // from left -> right, from right -> left
        const dy = midPointGraph.y === 0 ? -10 : +15; //

        const midPointOverlay = {
          x: (o1Overlay.x + o2Overlay.x) / 2 + dx,
          y: (o1Overlay.y + o2Overlay.y) / 2 + dy,
        } as Point;

        return {
          overlay: midPointOverlay,
          graphCorner: midPointGraph,
        };
      }

      const furthestGraph = candidates.reduce(
        (best, cur) =>
          pointLineDistance(cur) > pointLineDistance(best) ? cur : best,
        candidates[0]
      );

      const idx = area.graph.findIndex(
        (p) => p.x === furthestGraph.x && p.y === furthestGraph.y
      );
      if (idx === -1) return null;

      const base = area.overlay[idx];
      const dx = furthestGraph.x === 0 ? +5 : -10; // from left -> right, from right -> left
      const dy = furthestGraph.y === 0 ? -10 : +15; // from bottom -> up, from top -> down

      return {
        overlay: { x: base.x + dx, y: base.y + dy },
        graphCorner: furthestGraph,
      } as { overlay: Point; graphCorner: Point };
    };

    const x = {
      area1: findCornerLabelInfo(areaPolygons.area1),
      area2: findCornerLabelInfo(areaPolygons.area2),
    } as {
      area1: { overlay: Point; graphCorner: Point } | null;
      area2: { overlay: Point; graphCorner: Point } | null;
    };

    return x;
  }, [areaPolygons]);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-2">
      <defs>
        <pattern
          id="pass-area-pattern"
          patternUnits="userSpaceOnUse"
          width="28"
          height="49"
        >
          <rect width="28" height="49" fill="var(--chart-fill)" />
          <g fillRule="evenodd">
            <g fill="#9C92AC" fillOpacity="0.7" fillRule="nonzero">
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
          <rect width="8" height="8" fill="var(--chart-fill)" />
          <g fillRule="evenodd">
            <g fill="#9C92AC" fillOpacity="0.7" fillRule="nonzero">
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
        }}
        onClick={(e) => onAreaSelection(e, false)}
      />

      {areaColorsAssigned && originIsPass !== null && labelPositions && (
        <>
          {labelPositions.area1 && (
            <text
              x={labelPositions.area1.overlay.x}
              y={labelPositions.area1.overlay.y}
              fill="var(--chart-stroke)"
              fontSize="12"
              fontWeight="700"
              textAnchor={
                labelPositions.area1.graphCorner.x === 0 ? "start" : "end"
              }
              style={{ pointerEvents: "none" }}
            >
              {originIsPass ? content.pass : content.fail}
            </text>
          )}
          {labelPositions.area2 && (
            <text
              x={labelPositions.area2.overlay.x}
              y={labelPositions.area2.overlay.y}
              fill="var(--chart-stroke)"
              fontSize="12"
              fontWeight="700"
              textAnchor={
                labelPositions.area2.graphCorner.x === 0 ? "start" : "end"
              }
              style={{ pointerEvents: "none" }}
            >
              {originIsPass ? content.fail : content.pass}
            </text>
          )}
        </>
      )}
    </svg>
  );
};
