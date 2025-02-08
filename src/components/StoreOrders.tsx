import React, { useState } from "react";
import { Store } from "../types/orders";
import { OrderCard } from "./OrderCard";
import { useDeleteStoreMutation } from "../redux/api";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface StoreOrdersProps {
  store: Store;
  type?: "current" | "archive" | "pre-orders";
}

export const StoreOrders: React.FC<StoreOrdersProps> = ({
  store,
  type = "current",
}) => {
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow">("today");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();

  const handleDeleteConfirm = async () => {
    try {
      await deleteStore(store.id).unwrap();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete store:", error);
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

  let ordersToDisplay = store.orders || [];

  // Применяем новую фильтрацию для текущих заказов
  // Фильтрация применяется только, если type === "current"
  // Логика:
  // 1. Все заказы, не являющиеся Kaspi Delivery, попадают в "Сегодня"
  // 2. Заказы Kaspi Delivery (не Express) с creationDate до 13:01 – в "Сегодня"
  // 3. Заказы Kaspi Delivery (не Express) с creationDate от 13:01 – в "Завтра"
  if (type === "current") {
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

    const todayOrders = ordersToDisplay.filter((order) => {
      const isKaspiDelivery = order.attributes.isKaspiDelivery;
      const isExpress = order.attributes.kaspiDelivery?.express;
      const creationDate = order.attributes.creationDate;

      // Если заказ не Kaspi Delivery – сразу в "Сегодня"
      if (!isKaspiDelivery) return true;
      // Исключаем Kaspi Express
      if (isExpress) return false;
      // Kaspi Delivery, созданные до 13:01 – сегодня
      return creationDate < todayCutoff;
    });

    const tomorrowOrders = ordersToDisplay.filter((order) => {
      const isKaspiDelivery = order.attributes.isKaspiDelivery;
      const isExpress = order.attributes.kaspiDelivery?.express;
      const creationDate = order.attributes.creationDate;

      // Заказы Kaspi Delivery (не Express) с creationDate от 13:01 – завтрашние
      return isKaspiDelivery && !isExpress && creationDate >= todayCutoff;
    });

    ordersToDisplay = activeTab === "today" ? todayOrders : tomorrowOrders;
  }

  return (
    <div className="mb-6">
      <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {store.storeName}
            </h2>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
              {store.orders?.length || 0} заказов
            </div>
          </div>

          {type === "current" && (
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("today")}
                className={`relative px-4 py-2 rounded-md transition-all duration-300 ${
                  activeTab === "today"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Сегодня
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {store.orders?.filter((order) => {
                    const isKaspiDelivery = order.attributes.isKaspiDelivery;
                    const isExpress = order.attributes.kaspiDelivery?.express;
                    const creationDate = order.attributes.creationDate;
                    if (!isKaspiDelivery) return true;
                    if (isExpress) return false;
                    return (
                      creationDate <
                      new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        new Date().getDate(),
                        13,
                        1,
                        0,
                        0
                      ).getTime()
                    );
                  }).length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("tomorrow")}
                className={`relative px-4 py-2 rounded-md transition-all duration-300 ${
                  activeTab === "tomorrow"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Завтра
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {store.orders?.filter((order) => {
                    const isKaspiDelivery = order.attributes.isKaspiDelivery;
                    const isExpress = order.attributes.kaspiDelivery?.express;
                    const creationDate = order.attributes.creationDate;
                    return (
                      isKaspiDelivery &&
                      !isExpress &&
                      creationDate >=
                        new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          new Date().getDate(),
                          13,
                          1,
                          0,
                          0
                        ).getTime()
                    );
                  }).length || 0}
                </span>
              </button>
            </div>
          )}
        </div>
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
          {type === "current"
            ? activeTab === "today"
              ? "Нет заказов для доставки сегодня."
              : "Нет заказов для доставки завтра."
            : type === "pre-orders"
            ? "Нет предзаказов."
            : "Нет архивных заказов."}
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
