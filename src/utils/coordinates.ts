import type { Point } from '../types';

export const createGraphToOverlayConverter = (
  overlayRef: React.RefObject<HTMLDivElement | null>,
  chartContainerRef: React.RefObject<HTMLDivElement | null>
) => {
  return (graphCoords: Point): Point => {
    if (!overlayRef.current || !chartContainerRef.current)
      throw new Error("Refs not set");
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const graphElement = chartContainerRef.current.querySelector(
      ".recharts-cartesian-grid"
    ) as SVGElement | null;

    if (!graphElement) {
      throw new Error("Graph element not found");
    }

    const graphRect = graphElement.getBoundingClientRect();

    const normalize_y = graphRect.height / 500;
    const normalize_x = graphRect.width / 500;

    const overlayX =
      graphRect.left + graphCoords.x * normalize_x - overlayRect.left;
    const overlayY =
      graphRect.top + (500 - graphCoords.y) * normalize_y - overlayRect.top;

    console.log(graphCoords, "Graph to Overlay Coords:", {
      x: overlayX,
      y: overlayY,
    });

    return { x: overlayX, y: overlayY };
  };
};
