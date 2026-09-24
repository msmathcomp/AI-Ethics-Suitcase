import { Link } from "react-router";
import { useIntlayer } from "react-intlayer";
import { useConfig } from "~/context/ConfigContext";
import { LanguageSwitch } from "~/components/ui/LanguageSwitch";
import { Button } from "~/components/ui/Button";
import { useLevelData } from "~/context/LevelDataContext";
import { SmileIcon } from "~/components/ui/SmileIcon";
import { cn } from "~/utils/cn";
import { RotateCcw } from "lucide-react";

export default function Home() {
  const { home: content, common: commonContent } = useIntlayer("app");
  const { config, loading } = useConfig();

  const { isLevelCompleted, reset } = useLevelData();
  const centralLevelsCompleted = [0, 1, 2, 3, 4, 5, 6].reduce((previous, current) => previous && isLevelCompleted(current), true);

  // check next advised menu option
  let nextOption: number | undefined;
  if (!isLevelCompleted(-1)) nextOption = 0;
  else if (!centralLevelsCompleted) nextOption = 1;
  else if (!isLevelCompleted(6)) nextOption = 2;
  else if (!isLevelCompleted(8)) nextOption = 8;

  if (loading || !config) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        {commonContent.status.loading}
      </main>
    );
  }


  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 dark:bg-stone-900 dark:text-white p-8">
      <h1 className="text-4xl">{content.title}</h1>
      <h2 className="text-2xl text-stone-600 dark:text-stone-400">{content.subtitle}</h2>
      <p className="max-w-xl text-center">{content.description}</p>

      <div className="grid grid-cols-2 w-[80vw] gap-8 mt-16">
        {[
          { title: content.menuButtons.tutorial, link: "/tutorial", completed: isLevelCompleted(-1) },
          { title: content.menuButtons.levels, link: "/level/" + config.startLevel, completed: centralLevelsCompleted },
          { title: content.menuButtons.overfitting, link: "/level/7", completed: isLevelCompleted(7) },
          { title: content.menuButtons.freeplay, link: "/level/8", completed: isLevelCompleted(8) },
        ].map(({ title, link, completed }, index) => {
          const next = nextOption === index;

          return <Link key={index} to={link}>
            <Button
              className={cn("p-16 w-full hover:animate-none justify-center gap-16", completed && "animate-pulse")}
              buttonType={completed ? "primary" : "secondary"}
            >
              <SmileIcon state={completed ? "complete" : (next ? "inProgress" : "incomplete")} />
              <span className="text-2xl font-bold min-w-32 text-left">{title}</span>
            </Button>
          </Link>
        })}
      </div>

      <div className="fixed top-6 right-4 flex gap-2">
        <LanguageSwitch />
        <Button onClick={reset} className="p-2">
          <RotateCcw />
        </Button>
      </div>
    </main>
  );
}
