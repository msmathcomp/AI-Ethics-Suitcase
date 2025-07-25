import { Link } from "react-router";

// const data: DataPoint[] = [
//   { study_time: 50, screen_time: 120, type: "a" },
//   { study_time: 150, screen_time: 90, type: "b" },
//   { study_time: 200, screen_time: 350, type: "a" },
//   { study_time: 300, screen_time: 200, type: "b" },
//   { study_time: 100, screen_time: 450, type: "a" },
//   { study_time: 400, screen_time: 150, type: "b" },
//   { study_time: 250, screen_time: 300, type: "a" },
//   { study_time: 350, screen_time: 100, type: "b" },
//   { study_time: 80, screen_time: 250, type: "a" },
//   { study_time: 450, screen_time: 400, type: "b" },
// ];

// export default function App() {
//   return <ClassificationVisualizer data={data} />;
// }

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl">AI Ethics Suitcase</h1>
      <h2 className="text-2xl text-stone-600">
        Interactive application for exploring linear classification
      </h2>
      <Link to="/AI-Ethics-Suitcase/level/-1">
          <button className="cursor-pointer rounded border-1 p-1">
            Get Started
          </button>
      </Link>
    </main>
  );
}
