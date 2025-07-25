export const Legend = () => {
  return (
    <div className="" id="legend">
      <h3 className="text-xl font-semibold mb-3 text-start">Legend</h3>
      <div className="flex gap-4">
        <div>
          <h4 className="font-medium mb-2">Data Points:</h4>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-black rounded-full"></div>
              <span className="text-sm">
                Circle: <b>Pass</b>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-black"></div>
              <span className="text-sm">
                Square: <b>Fail</b>
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Classification:</h4>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 opacity-50"></div>
              <span className="text-sm">
                Blue Area: Classifying as <b>Pass</b>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 opacity-50"></div>
              <span className="text-sm">
                Orange Area: Classifying as <b>Fail</b>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-black"></div>
              <span className="text-sm">Black Line: Classifier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
