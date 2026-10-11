import { Link } from "react-router";
import { useIntlayer } from "react-intlayer";
import { useLevelData } from "~/context/LevelDataContext";
import { LanguageSwitch } from "~/components/ui/LanguageSwitch";
import { Button } from "~/components/ui/Button";
import { calculateAccuracy, EMPTY_COUNTS } from "~/utils/classification";
import { ScoreDisplay } from "~/components/ui/ScoreDisplay";

function formatAccuracy(accuracy: number): string {
  return (accuracy * 100).toFixed(1);
}

export default function Finish() {
  const { finish: content } = useIntlayer("app");
  const { dataByLevel: resultsByLevel } = useLevelData();

  // Calculate total score (weighted sum of accuracies for levels 2-6)
  const levels = [2, 3, 4, 5, 6];
  const levelResults = levels.map((level) => {
    const result = resultsByLevel.get(level);
    return {
      level,
      yourAccuracy: result ? calculateAccuracy(result.user || EMPTY_COUNTS()) : 0,
      bestAccuracy: result?.best ? calculateAccuracy(result.best) : null,
    };
  });

  const totalScore = levelResults.reduce((sum, result) => {
    if (!result.bestAccuracy) return sum; // level not completed

    const levelScore = result.yourAccuracy / result.bestAccuracy;

    let levelWeight = 0; // introduction levels don't contribute to score
    if ([2, 3].includes(result.level)) levelWeight = 12.5; // levels 2 and 3 each count 12.5% -> 30%
    else if ([4, 5, 6].includes(result.level)) levelWeight = 25; // levels 4-6 each count 25% -> 70%

    return sum + levelWeight * levelScore;
  }, 0);

  return (
    <main className="min-h-screen bg-white dark:bg-stone-900 text-black dark:text-white flex flex-col items-center justify-center gap-8 p-8">
      <div className="w-full space-y-6">
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-200 w-full text-center">
          {content.title}
        </h1>

        <ScoreDisplay score={totalScore} />

        <p className="max-w-[75ch] mx-auto text-center">{content.moral}</p>
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
            </tr>
          </thead>
          <tbody>
            {levelResults.map((result) => (
              <tr
                key={result.level}
                className="hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <td className="border border-gray-300 px-4 py-3 font-bold">
                  {content.table.level} {result.level - 1}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {formatAccuracy(result.yourAccuracy)}%
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {result.bestAccuracy !== null
                    ? `${formatAccuracy(result.bestAccuracy)}%`
                    : content.table.incomplete}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4">
        <Link to="/home">
          <Button buttonType="secondary">{content.backToHome}</Button>
        </Link>
      </div>

      <div className="absolute bottom-4 left-4">
        <LanguageSwitch />
      </div>
    </main>
  );
}
