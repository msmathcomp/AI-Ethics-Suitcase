import { Link } from "react-router";
import { useIntlayer } from "react-intlayer";
import { useLevelData } from "~/context/LevelDataContext";
import type { ClassificationCounts } from "~/types";
import { LanguageSwitch } from "~/components/ui/LanguageSwitch";
import ThemeSwitch from "~/components/ui/ThemeSwitch";
import { SmileIcon } from "lucide-react";

function calculateAccuracy(counts: ClassificationCounts): number {
  const total = counts.TP + counts.TN + counts.FP + counts.FN;
  if (total === 0) return 0;
  return ((counts.TP + counts.TN) / total) * 100;
}

export default function Finish() {
  const { finish: content } = useIntlayer("app");
  const { dataByLevel: resultsByLevel, reset: reset } = useLevelData();

  // Calculate total score (sum of accuracies for levels 2-7)
  const levels = [2, 3, 4, 5, 6, 7];
  const levelResults = levels.map((level) => {
    const result = resultsByLevel.get(level);
    return {
      level,
      yourAccuracy: result ? calculateAccuracy(result.user || {TP:0,TN:0,FP:0,FN:0}) : 0,
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
      <div className="relative w-full flex-col space-y-6">
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-200 w-full text-center">{content.title}</h1>

        {/* Decorative Circles */}
        <div className="absolute top-0 left-20 w-1/4 h-1/3 text-white">
          <div className="absolute top-1/2 translate-y-6 right-0 w-18 h-18 bg-emerald-900 rounded-full flex items-center justify-center animate-pulse [animation-delay:100ms] p-1">
            <SmileIcon size={64} className="rotate-5"/>
          </div>
          <div className="absolute top-1/2 translate-y-0 right-1/4 w-11 h-11 bg-emerald-900 rounded-full flex items-center justify-center animate-pulse [animation-delay:400ms] p-1">
            <SmileIcon size={64} className="-rotate-19"/>
          </div>
          <div className="absolute top-1/2 translate-y-10 right-2/5 w-16 h-16 bg-emerald-900 rounded-full flex items-center justify-center animate-pulse [animation-delay:600ms] p-1">
            <SmileIcon size={64} className="rotate-8"/>
          </div>
          <div className="absolute top-1/2 translate-y-8 right-2/3 w-9 h-9 bg-emerald-900 rounded-full flex items-center justify-center animate-pulse [animation-delay:800ms] p-1">
            <SmileIcon size={64} className="rotate-22"/>
          </div>
        </div>
        <div className="absolute top-0 right-20 w-1/4 h-1/3 text-white">
          <div className="absolute top-1/2 translate-y-6 left-0 w-18 h-18 bg-emerald-900 rounded-full flex items-center justify-center animate-pulse [animation-delay:100ms] p-1">
            <SmileIcon size={64} className="rotate-25"/>
          </div>
          <div className="absolute top-1/2 translate-y-18 left-1/4 w-11 h-11 bg-emerald-900 rounded-full flex items-center justify-center animate-pulse [animation-delay:400ms] p-1">
            <SmileIcon size={64} className="-rotate-39"/>
          </div>
          <div className="absolute top-1/2 translate-y-6 left-2/5 w-16 h-16 bg-emerald-900 rounded-full flex items-center justify-center animate-pulse [animation-delay:600ms] p-1">
            <SmileIcon size={64} className="rotate-8"/>
          </div>
          <div className="absolute top-1/2 translate-y-16 left-2/3 w-9 h-9 bg-emerald-900 rounded-full flex items-center justify-center animate-pulse [animation-delay:800ms] p-1">
            <SmileIcon size={64} className="-rotate-42"/>
          </div>
        </div>

        {/* Score Display */}
        <div className="text-center w-full">
          <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-200 mb-2">
            {Math.round(totalScore)}
          </div>
          <div className="text-xl text-emerald-500 dark:text-emerald-300">{content.outOf} 100</div>
          <div className="text-sm text-emerald-400 dark:text-emerald-500 mt-1">{content.totalScore}</div>
        </div>
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
