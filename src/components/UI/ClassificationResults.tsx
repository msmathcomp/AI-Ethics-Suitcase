import type { ClassificationCounts } from "../../types";

interface Props {
  classificationCounts: ClassificationCounts;
  accuracy: string | null;
}

export const ClassificationResults = ({
  classificationCounts,
  accuracy,
}: Props) => {
  return (
    <div
      className="mt-10 border-1 border-black-300 rounded-lg p-4 shadow-lg"
      id="classification-results"
    >
      <h3 className="text-lg font-semibold mb-3 text-center">
        Classification Results
      </h3>

      <div className="mb-3 text-center">
        <div className="text-lg font-bold text-blue-600">
          Accuracy: {accuracy}%
        </div>
      </div>

      <div className="flex justify-center gap-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-1 border-black rounded-full bg-green-500"></div>
            <span className="text-sm">
              True Positive: {classificationCounts.TP}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-1 border-black bg-green-500"></div>
            <span className="text-sm">
              True Negative: {classificationCounts.TN}
            </span>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-1 border-black bg-orange-500"></div>
            <span className="text-sm">
              False Positive: {classificationCounts.FP}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-1 border-black rounded-full bg-orange-500"></div>
            <span className="text-sm">
              False Negative: {classificationCounts.FN}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
