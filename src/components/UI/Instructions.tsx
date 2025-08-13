import { useIntlayer } from "react-intlayer";

interface Props {
  clickCoordsLength: number;
  lineCoordsLength: number;
  areaColorsAssigned: boolean;
}

export const Instructions = ({
  clickCoordsLength,
  lineCoordsLength,
  areaColorsAssigned,
}: Props) => {
  const { instructions: content } = useIntlayer("app");
  const getInstructionText = () => {
    if (clickCoordsLength === 0) {
      return content.step1;
    }
    if (clickCoordsLength === 1) {
      return content.step2;
    }
    if (lineCoordsLength === 2 && !areaColorsAssigned) {
      return content.step3;
    }
    if (areaColorsAssigned) {
      return content.complete;
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
