import React from "react";

// Обновляем тип вкладок, добавляя 'returned'
export type TabType = "current" | "archive" | "pre-orders" | "returned";

interface OrdersTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    current?: { todayCount: number; totalCount: number } | null;
    archive?: { totalCount: number } | null;
    preOrders?: { totalCount: number } | null;
    returned?: { totalCount: number } | null;
  };
}

export const OrdersTypeTabs: React.FC<OrdersTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const getButtonClasses = (tabName: TabType) => {
    const isActive = activeTab === tabName;
    return `
      relative inline-block border border-[#1869FF]
      ${isActive ? "ring-2 ring-[#1869FF]" : ""}
    `;
  };

  const getLeftPartClasses = (tabName: TabType) => {
    const isActive = activeTab === tabName;
    // Левая часть: активный — фон #1869FF, неактивный — фон черный
    return `
      absolute inset-0 flex items-center
      ${isActive ? "bg-[#1869FF]" : "bg-black"}
    `;
  };

  const getRightPartClasses = (tabName: TabType) => {
    const isActive = activeTab === tabName;
    // Правая часть: активный — фон #0E3F99, неактивный — фон #1869FF
    return `
      absolute inset-0 clip-path-right flex items-center justify-end
      ${isActive ? "bg-[#0E3F99]" : "bg-[#1869FF]"}
    `;
  };

  // Определяем стили для текста в зависимости от активности
  const getTextClasses = (tabName: TabType) =>
    activeTab === tabName ? "text-white" : "text-[#1869FF]";

  return (
    <div className="flex space-x-4">
      {/* Кнопка "Заказы" */}
      <button
        className={getButtonClasses("current")}
        onClick={() => onTabChange("current")}
      >
        {/* Фоновые слои */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={getLeftPartClasses("current")} />
          <div className={getRightPartClasses("current")} />
        </div>
        {/* Контент с отступами */}
        <div className="relative z-10 flex">
          <span
            className={`px-[15px] py-[8px] font-medium ${getTextClasses("current")}`}
          >
            Заказы
          </span>
          <span className={`px-[15px] py-[8px] font-bold text-white`}>
            {counts.current ? counts.current.todayCount : 0}
          </span>
        </div>
      </button>

      {/* Кнопка "Предзаказы" */}
      <button
        className={getButtonClasses("pre-orders")}
        onClick={() => onTabChange("pre-orders")}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className={getLeftPartClasses("pre-orders")} />
          <div className={getRightPartClasses("pre-orders")} />
        </div>
        <div className="relative z-10 flex">
          <span
            className={`px-[15px] py-[8px] font-medium ${getTextClasses("pre-orders")}`}
          >
            Предзаказы
          </span>
          <span className={`px-[15px] py-[8px] font-bold text-white`}>
            {counts.preOrders ? counts.preOrders.totalCount : 0}
          </span>
        </div>
      </button>

      {/* Кнопка "Возврат" */}
      <button
        className={getButtonClasses("returned")}
        onClick={() => onTabChange("returned")}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className={getLeftPartClasses("returned")} />
          <div className={getRightPartClasses("returned")} />
        </div>
        <div className="relative z-10 flex">
          <span
            className={`px-[15px] py-[8px] font-medium ${getTextClasses("returned")}`}
          >
            Возврат
          </span>
          <span className={`px-[15px] py-[8px] font-bold text-white`}>
            {counts.returned ? counts.returned.totalCount : 0}
          </span>
        </div>
      </button>
    </div>
  );
};
