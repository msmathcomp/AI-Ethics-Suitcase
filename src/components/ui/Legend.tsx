import { useIntlayer } from "react-intlayer";

export const Legend = () => {
  const { legend: content } = useIntlayer("app");
  return (
    <div id="legend">
      <h3 className="text-lg font-semibold text-start">{content.title}</h3>
      <div className="flex gap-4">
        <div>
          <h4 className="font-medium mb-2">{content.dataPoints.title}</h4>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-stone-900 dark:border-stone-200 rounded-full"></div>
              <span className="text-sm">{content.dataPoints.pass}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-stone-900 dark:border-stone-200"></div>
              <span className="text-sm">{content.dataPoints.fail}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">{content.classification.title}</h4>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 pass-area-bg bg-stone-200 dark:bg-stone-800"></div>
              <span className="text-sm">{content.classification.pass}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 fail-area-bg bg-stone-200 dark:bg-stone-800"></div>
              <span className="text-sm">{content.classification.fail}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-black dark:bg-white"></div>
              <span className="text-sm">{content.classification.line}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
