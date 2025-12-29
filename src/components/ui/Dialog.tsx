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
      <div className="bg-white dark:bg-stone-900 rounded shadow-lg p-6 min-w-[300px] border-black dark:border-white border">
        {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
        {message && <p className="mb-4">{message}</p>}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
            onClick={onNo}
          >
            {content.buttons.no}
          </button>
          <button
            className="px-4 py-2 bg-emerald-200 dark:bg-emerald-900 text-white dark:text-black rounded hover:bg-emerald-400 dark:hover:bg-emerald-800"
            onClick={onYes}
          >
            {content.buttons.yes}
          </button>
        </div>
      </div>
    </div>
  );
};
