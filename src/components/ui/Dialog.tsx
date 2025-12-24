import { useIntlayer } from "react-intlayer";

interface DialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onYes: () => void;
  onNo: () => void;
}

export default function Dialog({ open, title, message, onYes, onNo }: DialogProps) {
  const { common: content } = useIntlayer("app");

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-50 z-50">
      <div className="bg-white rounded shadow-lg p-6 min-w-[300px] border-black border">
        {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
        {message && <p className="mb-4">{message}</p>}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onNo}
          >
            {content.buttons.no}
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onYes}
          >
            {content.buttons.yes}
          </button>
        </div>
      </div>
    </div>
  );
};
