import { Link } from "react-router";
import { useIntlayer } from "react-intlayer";
import { useClassificationResults } from "~/context/ClassificationResultsContext";
import type { ClassificationCounts } from "~/types";
import { LanguageSwitch } from "~/components/ui/LanguageSwitch";
import ThemeSwitch from "~/components/ui/ThemeSwitch";

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
    <main className="min-h-screen bg-white dark:bg-stone-900 text-black dark:text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-200 w-1/2 text-center">{content.title}</h1>

      {/* Score Display */}
      <div className="text-center">
        <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-200 mb-2">
          {Math.round(totalScore)}
        </div>
        <div className="text-xl text-emerald-500 dark:text-emerald-300">{content.outOf} 100</div>
        <div className="text-sm text-emerald-400 dark:text-emerald-500 mt-1">{content.totalScore}</div>
      </div>

      {/* Results Table */}
      <div className="w-full max-w-4xl">
        <table className="w-full border-collapse border border-stone-300 bg-white dark:bg-stone-900 shadow-sm table-fixed">
          <thead className=" text-left font-semibold text-emerald-700 dark:text-emerald-200">
            <tr className="bg-stone-50 dark:bg-stone-800">
              <th className="border border-stone-300 px-4 py-3 w-1/6">
                {content.table.level}
              </th>
              <th className="border border-stone-300 px-4 py-3">
                {content.table.yourAccuracy}
              </th>
              <th className="border border-stone-300 px-4 py-3">
                {content.table.bestAccuracy}
              </th>
              <th className="border border-stone-300 px-4 py-3">
                {content.table.unseenAccuracy}
              </th>
            </tr>
          </thead>
          <tbody>
            {levelResults.map((result) => (
              <tr key={result.level} className="hover:bg-stone-100 dark:hover:bg-stone-800">
                <td className="border border-gray-300 px-4 py-3 font-bold">
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

      <Link to="/">
        <button
          onClick={reset}
          className="cursor-pointer rounded-lg border border-stone-900 dark:border-0 dark:bg-stone-700 p-3 font-semibold hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
        >
          {content.restart}
        </button>
      </Link>

      <div className="flex justify-between absolute bottom-4 w-full px-8">
        <LanguageSwitch />
        <ThemeSwitch />
      </div>
    </main>
  );
}
