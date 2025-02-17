import React, { useState } from "react";
import { Menu, X } from "lucide-react";

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
  onAddStore: () => void;
  onLogout: () => void;
}

export const BurgerMenuTabs: React.FC<BurgerMenuTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
  onAddStore,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);
    setMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Кнопка бургер-меню */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {menuOpen && (
        <div className="absolute top-14 w-64 bg-white shadow-lg rounded-lg overflow-hidden z-50 right-0">
          <nav className="flex flex-col divide-y divide-gray-200">
            {[
              "current",
              "pre-orders",
              "archiveabsoluteabsolute",
              "returned",
            ].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-3 text-left transition-all font-medium text-sm flex justify-between items-center ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
                onClick={() => handleTabClick(tab as TabType)}
              >
                {tab === "current" && "Текущие заказы"}
                {tab === "pre-orders" && "Предзаказы"}
                {tab === "archive" && "Архивные заказы"}
                {tab === "returned" && "Возвращённые заказы"}
                {counts[tab as keyof typeof counts] && (
                  <span className="ml-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {counts[tab as keyof typeof counts]?.totalCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="border-t border-gray-300 my-2" />

          <div className="p-4 flex flex-col gap-2">
            <button
              onClick={() => {
                onAddStore();
                setMenuOpen(false);
              }}
              className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Добавить магазин
            </button>
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
