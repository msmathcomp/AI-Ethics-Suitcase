import { useParams } from "react-router";
import IntroLevel from "./intro";
import nlFlag from "../../assets/nl.svg";
import ukFlag from "../../assets/uk.svg";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import Level0 from "./level0";
import Level1 from "./level1";
import Level2_5 from "./level2_5";

export default function LevelPage() {
  const { level: levelParam } = useParams<{ level: string }>();
  const level = Number(levelParam);

  if (isNaN(level) || level < -1 || level > 9) {
    return <div>Invalid level</div>;
  }

  if (level === -1) {
    return <IntroLevel />;
  } else if (level === 0) {
    return <Level0 />;
  } else if (level === 1) {
    return <Level1 />;
  } else if (level >= 2 && level <= 5) {
    return <Level2_5 key={level} level={level as 2 | 3 | 4 | 5} />;
  }

  return (
    <main className="h-screen w-screen flex flex-col items-center p-4">
      <nav className="w-full h-20 flex items-center px-2 justify-between border-b-1">
        <h1 className="text-2xl">AI Ethics Suitcase</h1>
        <div className="flex items-center">
          <button className="flex items-center cursor-pointer">
            <img src={ukFlag} alt="English" className="h-6" />
            <span className="ml-1">English</span>
          </button>
          <hr className="inline-block h-6 w-px bg-black m-2" />
          <button className="flex items-center cursor-pointer">
            <img src={nlFlag} alt="Nederlands" className="h-6" />
            <span className="ml-1">Nederlands</span>
          </button>
        </div>
      </nav>
      <div className="flex w-full flex-1">
        <div className="h-full w-[30%] flex flex-col p-4 border-r-1">
          <div id="level-progress-bar" className="mb-10">
            <h3 className="text-xl">Level {level}</h3>
            <div className="flex gap-2">
              {[...Array(10)].map((_, index) => {
                let backgroundColor = "gray";
                if (index < level + 1) {
                  backgroundColor = "green";
                } else if (index === level + 1) {
                  backgroundColor = "blue";
                }
                return (
                  <div
                    key={index}
                    className="rounded-full w-5 h-5"
                    style={{
                      backgroundColor: backgroundColor,
                    }}
                  />
                );
              })}
            </div>
          </div>
          <Legend />
        </div>
        <div className="flex-1 h-full flex flex-col items-center">
          <div className="p-4 border-b-1 w-full" id="instruction">
            <h2 className="text-2xl font-medium mb-2">
              Welcome to the AI Ethics Suitcase!
            </h2>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <ComposedChart
              height={550}
              width={700}
              margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
            >
              <XAxis
                dataKey="study_time"
                type="number"
                domain={[0, 500]}
                label={{
                  value: "Study Time (min)",
                  position: "insideBottom",
                  offset: -10,
                }}
              />
              <YAxis
                dataKey="screen_time"
                type="number"
                domain={[0, 500]}
                label={{
                  value: "Screen Time (min)",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <CartesianGrid strokeDasharray="3 3" />

              {/* <Scatter
                dataKey="screen_time"
                data={data}
                fill="#8884d8"
                shape={<CustomDotIntro />}
                name="Data Points"
              /> */}
            </ComposedChart>
          </div>
        </div>
      </div>
    </main>
  );
}
