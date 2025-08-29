import type { ClassificationCounts } from "~/types";
import { useIntlayer } from "react-intlayer";
import { Frown, Smile } from "lucide-react";

interface Props {
  classificationCounts: ClassificationCounts;
  bestClassificationCounts?: ClassificationCounts;
  title?: string;
}

const calculateAccuracy = (counts: ClassificationCounts): string => {
  const total = counts.TP + counts.TN + counts.FP + counts.FN;
  if (total === 0) return "0";
  return (((counts.TP + counts.TN) / total) * 100).toFixed(1);
};

export const ClassificationResults = ({
  classificationCounts,
  bestClassificationCounts,
  title,
}: Props) => {
  const { classificationResults: content } = useIntlayer("app");
  const accuracy = calculateAccuracy(classificationCounts);
  const bestAccuracy = bestClassificationCounts
    ? calculateAccuracy(bestClassificationCounts)
    : null;
  const showComparison = bestClassificationCounts && bestAccuracy;
  return (
    <div
      className="mt-5 border-1 border-black-300 rounded-lg p-4 shadow-lg"
      id="classification-results"
    >
      <h3 className="text-lg font-semibold mb-3 text-center">
        {title || content.title} {showComparison && content.compareSuffix}
      </h3>

      <div className="mb-3 text-center">
        <div className="text-lg font-bold text-blue-600">
          {content.accuracyLabel} {accuracy}%
          {showComparison && (
            <span className="font-extrabold text-green-600 ml-2">
              ({bestAccuracy}%)
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-1 border-black rounded-full bg-teal-500 flex items-center justify-center">
              <Smile size={18} color="white" />
            </div>
            <span className="text-sm">
              {content.counts.TP}: {classificationCounts.TP}
              {showComparison && (
                <span className="font-extrabold text-green-600 ml-1">
                  ({bestClassificationCounts.TP})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-1 border-black bg-teal-500 flex items-center justify-center">
              <Smile size={18} color="white" />
            </div>
            <span className="text-sm">
              {content.counts.TN}: {classificationCounts.TN}
              {showComparison && (
                <span className="font-extrabold text-green-600 ml-1">
                  ({bestClassificationCounts.TN})
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-1 border-black bg-orange-500 flex items-center justify-center">
              <Frown size={18} color="white" />
            </div>
            <span className="text-sm">
              {content.counts.FP}: {classificationCounts.FP}
              {showComparison && (
                <span className="font-extrabold text-green-600 ml-1">
                  ({bestClassificationCounts.FP})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-1 border-black rounded-full bg-orange-500 flex items-center justify-center">
              <Frown size={18} color="white" />
            </div>
            <span className="text-sm">
              {content.counts.FN}: {classificationCounts.FN}
              {showComparison && (
                <span className="font-extrabold text-green-600 ml-1">
                  ({bestClassificationCounts.FN})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
