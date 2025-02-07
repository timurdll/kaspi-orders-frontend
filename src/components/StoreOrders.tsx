import React, { useState } from "react";
import { Store, KaspiOrder } from "../types/orders";
import { OrderCard } from "./OrderCard";
import { useDeleteStoreMutation } from "../redux/api";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface StoreOrdersProps {
  store: Store;
}

export const StoreOrders: React.FC<StoreOrdersProps> = ({ store }) => {
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow">("today");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();

  console.log(store);

  const handleDeleteConfirm = async () => {
    try {
      await deleteStore(store.id).unwrap();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete store:", error);
      // Здесь можно добавить уведомление об ошибке
    }
  };

  if (store.error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-red-800">
            {store.storeName}
          </h2>
        </div>
        <p className="text-red-600">{store.error}</p>
      </div>
    );
  }

  // Вычисляем пороговое время: сегодня, 13:00
  const today = new Date();
  const cutoff = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    13,
    0,
    0,
    0
  );
  const cutoffTime = cutoff.getTime();

  // Фильтрация заказов по времени создания (предполагается, что creationDate – timestamp в мс)
  const todayOrders: KaspiOrder[] =
    store.orders?.filter(
      (order) => order.attributes.creationDate < cutoffTime
    ) || [];
  const tomorrowOrders: KaspiOrder[] =
    store.orders?.filter(
      (order) => order.attributes.creationDate >= cutoffTime
    ) || [];

  // Выбираем список заказов в зависимости от активной вкладки
  const ordersToDisplay = activeTab === "today" ? todayOrders : tomorrowOrders;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{store.storeName}</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {store.orders?.length || 0} заказов
          </span>
        </div>
      </div>

      {/* Кнопки‑вкладки с бейджами, аналогичными дизайну из App */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setActiveTab("today")}
          className={`relative px-4 py-2 rounded ${
            activeTab === "today"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Доставить сегодня до 20:00
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {todayOrders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tomorrow")}
          className={`relative px-4 py-2 rounded ${
            activeTab === "tomorrow"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Доставить завтра
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {tomorrowOrders.length}
          </span>
        </button>
      </div>

      {/* Отображение заказов */}
      {ordersToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ordersToDisplay.map((order) => (
            <OrderCard
              storeName={store.storeName}
              key={order.id}
              order={order}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          {activeTab === "today"
            ? "Нет заказов для доставки сегодня."
            : "Нет заказов для доставки завтра."}
        </p>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        storeName={store.storeName}
        isDeleting={isDeleting}
      />
    </div>
  );
};
