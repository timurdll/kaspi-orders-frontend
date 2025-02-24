// src/components/ErrorMessage.tsx
import React from "react";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="p-4">
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h1 className="text-lg font-semibold mb-2">Ошибка</h1>
        <p>{message}</p>
      </div>
    </div>
  );
};
