// src/components/OrderHeader.tsx
import React from "react";
import { useCopyNotification } from "../GlobalCopyNotification";

interface OrderHeaderProps {
  code: string;
  creationDate: number;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ code }) => {
  const showNotification = useCopyNotification();

  const handleCopy = async (text: string) => {
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
    <div className="mb-1 text-gray-600">
      <h4
        className="text-base font-semibold cursor-pointer"
        onClick={() => handleCopy(code)}
      >
        {code}
      </h4>
    </div>
  );
};
