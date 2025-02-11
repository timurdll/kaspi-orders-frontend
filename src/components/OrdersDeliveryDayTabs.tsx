// src/components/OrdersTabs.tsx
import React from "react";

interface OrdersTabsProps {
  activeTab: "today" | "tomorrow";
  onTabChange: (tab: "today" | "tomorrow") => void;
  storeOrders: any[]; // можно заменить на ваш тип заказа
}

export const OrdersDeliveryDayTabs: React.FC<OrdersTabsProps> = ({
  activeTab,
  onTabChange,
  storeOrders,
}) => {
  // Рассчитываем пороговое время (13:01) для фильтрации
  const now = new Date();
  const todayCutoff = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    13,
    1,
    0,
    0
  ).getTime();

  // Подсчёт заказов "Сегодня"
  const todayCount =
    storeOrders?.filter((order) => {
      const { isKaspiDelivery, kaspiDelivery, creationDate } = order.attributes;
      if (!isKaspiDelivery) return true;
      if (kaspiDelivery?.express) return false;
      return creationDate < todayCutoff;
    }).length || 0;

  // Подсчёт заказов "Завтра"
  const tomorrowCount =
    storeOrders?.filter((order) => {
      const { isKaspiDelivery, kaspiDelivery, creationDate } = order.attributes;
      return (
        isKaspiDelivery &&
        !kaspiDelivery?.express &&
        creationDate >= todayCutoff
      );
    }).length || 0;

  return (
    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onTabChange("today")}
        className={`relative px-4 py-2 rounded-md transition-all duration-300 ${
          activeTab === "today"
            ? "bg-indigo-600 text-white shadow-md"
            : "text-gray-700 hover:bg-gray-200"
        }`}
      >
        Сегодня
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {todayCount}
        </span>
      </button>
      <button
        onClick={() => onTabChange("tomorrow")}
        className={`relative px-4 py-2 rounded-md transition-all duration-300 ${
          activeTab === "tomorrow"
            ? "bg-indigo-600 text-white shadow-md"
            : "text-gray-700 hover:bg-gray-200"
        }`}
      >
        Завтра
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {tomorrowCount}
        </span>
      </button>
    </div>
  );
};
