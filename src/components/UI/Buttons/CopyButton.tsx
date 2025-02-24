import { Copy } from "lucide-react";
import { useCopyNotification } from "../GlobalCopyNotification";

interface CopyButtonProps {
  text: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const showNotification = useCopyNotification();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        showNotification("Скопировано!");
      } catch (err) {
        console.error("Ошибка копирования через Clipboard API:", err);
      }
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        if (successful) {
          showNotification("Скопировано!");
        } else {
          console.error("Fallback копирование не удалось");
        }
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("Ошибка копирования (fallback):", err);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className="ml-1 inline-flex items-center text-gray-500 hover:text-gray-700"
      title="Скопировать"
    >
      <Copy size={16} />
    </button>
  );
};
