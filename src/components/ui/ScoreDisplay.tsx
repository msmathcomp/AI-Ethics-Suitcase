
import { FrownIcon, SmileIcon } from "lucide-react";
import { useIntlayer } from "react-intlayer";

type CircleData = {
	className: string,
	delay: string,
	rot: string
}

const LEFT_CIRCLES: CircleData[] = [
  { className: "translate-y-6 right-0 w-18 h-18", delay: "100ms", rot: "rotate-5" },
  { className: "translate-y-0 right-1/4 w-11 h-11", delay: "400ms", rot: "-rotate-19" },
  { className: "translate-y-10 right-2/5 w-16 h-16", delay: "600ms", rot: "rotate-8" },
  { className: "translate-y-8 right-2/3 w-9 h-9", delay: "800ms", rot: "rotate-22" },
];
const RIGHT_CIRCLES: CircleData[] = [
  { className: "translate-y-6 left-0 w-18 h-18", delay: "100ms", rot: "rotate-25" },
  { className: "translate-y-18 left-1/4 w-11 h-11", delay: "400ms", rot: "-rotate-39" },
  { className: "translate-y-6 left-2/5 w-16 h-16", delay: "600ms", rot: "rotate-8" },
  { className: "translate-y-16 left-2/3 w-9 h-9", delay: "800ms", rot: "-rotate-42" },
];
const CIRCLES = [...LEFT_CIRCLES, ...RIGHT_CIRCLES];
const FROWN_ORDER = [3, 7, 1, 5, 0, 4, 2, 6];

function Circle({ circle, isFrown }: { circle: CircleData, isFrown: boolean }) {
  const Icon = isFrown ? FrownIcon : SmileIcon;
  return (
    <div
      className={`absolute ${circle.className} ${
        isFrown ? "bg-orange-900" : "bg-emerald-900"
      } rounded-full flex items-center justify-center animate-pulse p-1 transition-colors duration-500`}
      style={{ animationDelay: circle.delay }}
    >
      <Icon size={64} className={circle.rot} />
    </div>
  );
}

export function ScoreDisplay({ score }: { score: number }) {
	const { finish: content } = useIntlayer("app");
	
	const frownCount = Math.floor(CIRCLES.length * (1 - score / 100));
	const frowns = FROWN_ORDER.slice(0, frownCount);

	return (
    <div className="text-center w-full relative">
      <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-200 mb-2">
        {Math.round(score)}
      </div>
      <div className="text-xl text-emerald-500 dark:text-emerald-300">
        {content.outOf} 100
      </div>
      <div className="text-sm text-emerald-400 dark:text-emerald-500 mt-1">
        {content.totalScore}
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-0 left-20 w-1/4 h-1/3 text-white">
        {LEFT_CIRCLES.map((circle, index) => (
          <Circle
            key={index}
            circle={circle}
            isFrown={frowns.includes(index)}
          />
        ))}
      </div>
      <div className="absolute top-0 right-20 w-1/4 h-1/3 text-white">
        {RIGHT_CIRCLES.map((circle, index) => (
          <Circle
            key={index}
            circle={circle}
            isFrown={frowns.includes(index + LEFT_CIRCLES.length)}
          />
        ))}
      </div>
    </div>
  );
}