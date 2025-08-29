import { useParams } from "react-router";
import IntroLevel from "~/levels/intro";
import Level0 from "~/levels/level0";
import Level1 from "~/levels/level1";
import Level2_5 from "~/levels/level2-5";
import Level7 from "~/levels/level7";
import Level6 from "~/levels/level6";
import { useIntlayer } from "react-intlayer";

export default function LevelPage() {
  const { level: levelParam } = useParams<{ level: string }>();
  const { levelPage: content } = useIntlayer("app");
  const level = Number(levelParam);

  if (isNaN(level) || level < -1 || level > 7) {
    return <div>{content.invalidLevel}</div>;
  }

  if (level === -1) {
    return <IntroLevel />;
  } else if (level === 0) {
    return <Level0 />;
  } else if (level === 1) {
    return <Level1 />;
  } else if ([2, 3, 4, 5].includes(level)) {
    return <Level2_5 key={level} level={level as 2 | 3 | 4 | 5} />;
  } else if (level === 6) {
    return <Level6 />;
  } else if (level === 7) {
    return <Level7 />;
  }

  return <div>{content.invalidLevel}</div>;
}
