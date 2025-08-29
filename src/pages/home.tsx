import { Link } from "react-router";
import { useIntlayer } from "react-intlayer";
import { useConfig } from "~/context/ConfigContext";

export default function Home() {
  const { home: content, common } = useIntlayer("app");
  const { config, loading } = useConfig();

  if (loading || !config) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        {common.status.loading}
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl">{content.title}</h1>
      <h2 className="text-2xl text-stone-600">{content.subtitle}</h2>
      <p className="max-w-xl text-center">
        Interactive game consisting of 9 levels around ethical AI concepts.
        Progress through different levels by buidling simple linear classifiers
        to classify students who pass or fail an exam based on their study and
        screen time hours.
      </p>
      <Link to={`/level/${config.startLevel}`}>
        <button className="cursor-pointer rounded border-1 p-1">
          {content.getStarted}
        </button>
      </Link>
    </main>
  );
}
