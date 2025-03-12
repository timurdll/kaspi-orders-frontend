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
    try {
      await navigator.clipboard.writeText(text);
      showNotification("Скопировано!");
    } catch (err) {
      console.error("Ошибка копирования:", err);
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
