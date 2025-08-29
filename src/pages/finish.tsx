import { Link } from "react-router";
import { useIntlayer } from "react-intlayer";
import { useClassificationResults } from "~/context/ClassificationResultsContext";
import type { ClassificationCounts } from "~/types";

function calculateAccuracy(counts: ClassificationCounts): number {
  const total = counts.TP + counts.TN + counts.FP + counts.FN;
  if (total === 0) return 0;
  return ((counts.TP + counts.TN) / total) * 100;
}

export default function Finish() {
  const { finish: content } = useIntlayer("app");
  const { resultsByLevel, reset } = useClassificationResults();

  // Calculate total score (sum of accuracies for levels 2-7)
  const levels = [2, 3, 4, 5, 6, 7];
  const levelResults = levels.map((level) => {
    const result = resultsByLevel.get(level);
    return {
      level,
      yourAccuracy: result ? calculateAccuracy(result.user) : 0,
      bestAccuracy: result?.best ? calculateAccuracy(result.best) : null,
      unseenAccuracy: result?.unseen ? calculateAccuracy(result.unseen) : null,
    };
  });

  const totalScore = levelResults.reduce((sum, result) => {
    if ((result.level === 2 || result.level === 3) && result.bestAccuracy) {
      return sum + 10 * (result.yourAccuracy / result.bestAccuracy!);
    } else if (
      (result.level === 4 || result.level === 5) &&
      result.bestAccuracy
    ) {
      return sum + 20 * (result.yourAccuracy / result.bestAccuracy!);
    } else if (result.level === 6 && result.bestAccuracy) {
      return (
        sum +
        10 * (result.yourAccuracy / result.bestAccuracy!) +
        result.unseenAccuracy! / 10
      );
    } else {
      return (
        sum + result.yourAccuracy * 0.05 + (result.unseenAccuracy ?? 0) * 0.15
      );
    }
  }, 0);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-gray-800">{content.title}</h1>

      {/* Score Display */}
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-900 mb-2">
          {Math.round(totalScore)}
        </div>
        <div className="text-xl text-gray-600">{content.outOf} 100</div>
        <div className="text-sm text-gray-500 mt-1">{content.totalScore}</div>
      </div>

      {/* Results Table */}
      <div className="w-full max-w-4xl">
        <table className="w-full border-collapse border border-gray-300 bg-white shadow-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                {content.table.level}
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                {content.table.yourAccuracy}
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                {content.table.bestAccuracy}
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                {content.table.unseenAccuracy}
              </th>
            </tr>
          </thead>
          <tbody>
            {levelResults.map((result) => (
              <tr key={result.level} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">
                  {content.table.level} {result.level}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {result.yourAccuracy.toFixed(1)}%
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {result.bestAccuracy !== null
                    ? `${result.bestAccuracy.toFixed(1)}%`
                    : content.table.NA}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {result.unseenAccuracy !== null
                    ? `${result.unseenAccuracy.toFixed(1)}%`
                    : content.table.NA}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link to="/level/-1">
        <button
          onClick={reset}
          className="cursor-pointer rounded-lg border border-gray-300 p-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {content.restart}
        </button>
      </Link>
    </main>
  );
}
