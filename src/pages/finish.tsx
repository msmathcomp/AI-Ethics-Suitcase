import { Link } from "react-router";
import { useIntlayer } from "react-intlayer";

export default function Finish() {
  const { finish: content } = useIntlayer("app");
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl">{content.title}</h1>
      <Link to="/level/-1">
        <button className="cursor-pointer rounded border-1 p-1">
          {content.restart}
        </button>
      </Link>
    </main>
  );
}
