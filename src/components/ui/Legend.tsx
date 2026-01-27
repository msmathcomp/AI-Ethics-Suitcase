import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { useIntlayer } from "react-intlayer";

interface LegendProps {
  startOpen?: boolean;
}

export const Legend = ({
  startOpen = false,
}: LegendProps) => {
  const [open, setOpen] = useState(startOpen);
  const { legend: content } = useIntlayer("app");

  return (
    <div id="legend">
      <div
        className={`flex justify-between w-full cursor-pointer px-2 py-1 bg-stone-200 dark:bg-stone-700 rounded-t-md ${open ? "rounded-b-none" : "rounded-b-md"}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <h3 className="text-lg font-semibold text-start">{content.title}</h3>
        { !open && (<ChevronDownIcon size={25} />) }
        { open && (<ChevronUpIcon size={25} />) }
      </div>
      { open && (
        <div className="flex gap-4 p-2 bg-stone-100 dark:bg-stone-800 rounded-b-md">
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
      )}
    </div>
  );
};
