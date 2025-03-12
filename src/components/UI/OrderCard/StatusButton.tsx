import React from "react";
import { useSelector } from "react-redux";
import { selectAllowedStatuses } from "../../../redux/selectors";

interface StatusButtonProps {
  requiredStatus: string;
  // Принимаем событие кнопки
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

export const StatusButton: React.FC<StatusButtonProps> = ({
  requiredStatus,
  onClick,
  children,
}) => {
  const allowedStatuses = useSelector(selectAllowedStatuses);
  const isDisabled = !allowedStatuses.includes(requiredStatus);

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`w-full bg-blue-600 text-white px-4 py-2 transition ${
        isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
      }`}
    >
      {children}
    </button>
  );
};
