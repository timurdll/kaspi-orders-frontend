// src/components/OrdersTypeTabs.tsx
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
  return (
    <div className="flex space-x-4 mb-6">
      <button
        className={`relative px-4 py-2 rounded-md ${
          activeTab === "current" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => onTabChange("current")}
      >
        Текущие заказы
        {counts.current && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {counts.current.todayCount}
          </span>
        )}
      </button>

      <button
        className={`relative px-4 py-2 rounded-md ${
          activeTab === "pre-orders" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => onTabChange("pre-orders")}
      >
        Предзаказы
        {counts.preOrders && (
          <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {counts.preOrders.totalCount}
          </span>
        )}
      </button>

      <button
        className={`relative px-4 py-2 rounded-md ${
          activeTab === "archive" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => onTabChange("archive")}
      >
        Архивные заказы
        {counts.archive && (
          <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {counts.archive.totalCount}
          </span>
        )}
      </button>

      <button
        className={`relative px-4 py-2 rounded-md ${
          activeTab === "returned" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => onTabChange("returned")}
      >
        Возвращённые заказы
        {counts.returned && (
          <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {counts.returned.totalCount}
          </span>
        )}
      </button>
    </div>
  );
};
