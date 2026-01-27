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

export const ClassificationResultsEntry = ({
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
      className="flex flex-col items-center justify-start py-2 px-4 gap-2"
      id="classification-results"
    >
      {title && (
        <h3 className="text-sm xl:text-base font-semibold text-center">
          {title}
        </h3>
      )}

      <div className="text-center">
        <div className="text-base xl:text-lg font-bold text-emerald-400 dark:text-emerald-600">
          {content.accuracyLabel} {accuracy}%
          {showComparison && (
            <span className="font-extrabold text-emerald-500 ml-1">
              ({bestAccuracy}%)
            </span>
          )}
        </div>
      </div>

      <h3 className="text-sm xl:text-base font-semibold text-center">
        {showComparison && content.compareSuffix}
      </h3>

      <div className="grid grid-cols-2 gap-2 text-xs xl:text-sm xl:gap-3">
        <div className="flex items-center space-x-1">
          <div className="w-5 h-5 xl:w-6 xl:h-6 border-1 border-black dark:border-0 rounded-full bg-teal-500 flex items-center justify-center">
            <Smile color="white" />
          </div>
          {content.counts.TP}:
          <span className="font-bold ml-1">{classificationCounts.TP}</span>
          {showComparison && (
            <span className="font-extrabold text-emerald-500">
              ({bestClassificationCounts.TP})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-5 h-5 xl:w-6 xl:h-6 border-1 border-black dark:border-0 bg-orange-500 flex items-center justify-center">
            <Frown color="white" />
          </div>
          {content.counts.FP}:
          <span className="font-bold ml-1">{classificationCounts.FP}</span>
          {showComparison && (
            <span className="font-extrabold text-emerald-500">
              ({bestClassificationCounts.FP})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-5 h-5 xl:w-6 xl:h-6 border-1 border-black dark:border-0 bg-teal-500 flex items-center justify-center">
            <Smile color="white" />
          </div>
          {content.counts.TN}:
          <span className="font-bold ml-1">{classificationCounts.TN}</span>
          {showComparison && (
            <span className="font-extrabold text-emerald-500">
              ({bestClassificationCounts.TN})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-5 h-5 xl:w-6 xl:h-6 border-1 border-black dark:border-0 rounded-full bg-orange-500 flex items-center justify-center">
            <Frown color="white" />
          </div>
          {content.counts.FN}:
          <span className="font-bold ml-1">{classificationCounts.FN}</span>
          {showComparison && (
            <span className="font-extrabold text-emerald-500">
              ({bestClassificationCounts.FN})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
