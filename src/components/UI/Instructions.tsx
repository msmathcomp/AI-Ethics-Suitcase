interface Props {
  clickCoordsLength: number;
  lineCoordsLength: number;
  areaColorsAssigned: boolean;
}

export const Instructions = ({ clickCoordsLength, lineCoordsLength, areaColorsAssigned }: Props) => {
  const getInstructionText = () => {
    if (clickCoordsLength === 0) {
      return "Step 1: Click to select first point";
    }
    if (clickCoordsLength === 1) {
      return "Step 2: Click to select second point and draw line";
    }
    if (lineCoordsLength === 2 && !areaColorsAssigned) {
      return "Step 3: Drag green circles to rotate line, then click an area to classify as Pass";
    }
    if (areaColorsAssigned) {
      return "Complete! Blue area classifies as Pass, Orange area classifies as Fail";
    }
    return "";
  };

  return (
    <div className="mb-4 p-3 mx-auto bg-blue-50 border border-blue-200 rounded-lg max-w-[300px]">
      <p className="text-sm font-medium text-blue-800 text-center break-words">
        {getInstructionText()}
      </p>
    </div>
  );
};
