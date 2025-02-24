import { FileText } from "lucide-react";

interface WaybillButtonProps {
  invoiceLink: string | null;
  isUpdating: boolean;
  onGetWaybill: (e: React.MouseEvent) => Promise<void>;
}

export const WaybillButton: React.FC<WaybillButtonProps> = ({
  invoiceLink,
  isUpdating,
  onGetWaybill,
}) => {
  if (invoiceLink) {
    return (
      <a
        href={invoiceLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
      >
        <FileText size={16} />
      </a>
    );
  }

  return (
    <button
      onClick={onGetWaybill}
      disabled={isUpdating}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
    >
      {isUpdating ? (
        <span className="loader w-4 h-4 border-2 border-t-transparent rounded-full" />
      ) : (
        <FileText size={16} />
      )}
    </button>
  );
};
