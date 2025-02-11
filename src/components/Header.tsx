// src/components/Header.tsx
import React from "react";

interface HeaderProps {
  onAddStore: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddStore, onLogout }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Заказы Kaspi</h1>
      <div className="flex space-x-4">
        <button
          onClick={onAddStore}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Добавить магазин
        </button>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Выйти
        </button>
      </div>
    </div>
  );
};
