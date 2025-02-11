// src/components/BurgerMenuTabs.tsx
import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // используем иконки бургер-меню
// Определяем тип вкладок
export type TabType = "current" | "archive" | "pre-orders" | "returned";

interface BurgerMenuTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    current?: { todayCount: number; totalCount: number } | null;
    archive?: { totalCount: number } | null;
    preOrders?: { totalCount: number } | null;
    returned?: { totalCount: number } | null;
  };
}

export const BurgerMenuTabs: React.FC<BurgerMenuTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);
    setMenuOpen(false);
  };

  return (
    <div className="relative md:hidden">
      {/* Кнопка бургер-меню */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 focus:outline-none"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {/* Меню, которое открывается под кнопкой */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md z-50">
          <button
            className={`block w-full text-left px-4 py-2 ${
              activeTab === "current"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => handleTabClick("current")}
          >
            Текущие заказы{" "}
            {counts.current && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {counts.current.todayCount}
              </span>
            )}
          </button>
          <button
            className={`block w-full text-left px-4 py-2 ${
              activeTab === "pre-orders"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => handleTabClick("pre-orders")}
          >
            Предзаказы{" "}
            {counts.preOrders && (
              <span className="ml-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {counts.preOrders.totalCount}
              </span>
            )}
          </button>
          <button
            className={`block w-full text-left px-4 py-2 ${
              activeTab === "archive"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => handleTabClick("archive")}
          >
            Архивные заказы{" "}
            {counts.archive && (
              <span className="ml-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {counts.archive.totalCount}
              </span>
            )}
          </button>
          <button
            className={`block w-full text-left px-4 py-2 ${
              activeTab === "returned"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => handleTabClick("returned")}
          >
            Возвращённые заказы{" "}
            {counts.returned && (
              <span className="ml-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {counts.returned.totalCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
