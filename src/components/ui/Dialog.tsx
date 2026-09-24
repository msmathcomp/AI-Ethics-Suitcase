import { useIntlayer } from "react-intlayer";
import { Button } from "./Button";

interface DialogProps {
  open: boolean;
  choice?: boolean;
  title?: string;
  message?: string;
  onYes?: () => void;
  onNo?: () => void;
}

export default function Dialog({
  open, title, message,
  choice = true,
  onYes = () => {},
  onNo = () => {},
}: DialogProps) {
  const { common: content } = useIntlayer("app");

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/25 z-50">
      <div className="bg-white dark:bg-stone-900 rounded shadow-lg p-6 min-w-[300px] border-black dark:border-white border max-w-[75ch]">
        {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
        {message && <p className="mb-4">{message}</p>}
        <div className="flex justify-end gap-2">
          {choice && <Button buttonType="secondary" onClick={onNo}>{content.buttons.no}</Button>}
          <Button buttonType="primary" onClick={onYes}>{choice ? content.buttons.yes : content.buttons.ok}</Button>
        </div>
      </div>
    </div>
  );
};
