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

  // Only filter orders by delivery time for current orders
  let ordersToDisplay = store.orders || [];

  if (type === "current") {
    const tomorrowOrders = ordersToDisplay.filter(
      (order) =>
        order.attributes.isKaspiDelivery === true &&
        order.attributes.kaspiDelivery &&
        order.attributes.kaspiDelivery.express === false
    );

    const todayOrders = ordersToDisplay.filter(
      (order) =>
        !(
          order.attributes.isKaspiDelivery === true &&
          order.attributes.kaspiDelivery &&
          order.attributes.kaspiDelivery.express === false
        )
    );

    ordersToDisplay = activeTab === "today" ? todayOrders : tomorrowOrders;
  }

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

      {/* Only show tabs for current orders */}
      {type === "current" && (
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
              {store.orders?.filter(
                (order) =>
                  !(
                    order.attributes.isKaspiDelivery === true &&
                    order.attributes.kaspiDelivery &&
                    order.attributes.kaspiDelivery.express === false
                  )
              ).length || 0}
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
              {store.orders?.filter(
                (order) =>
                  order.attributes.isKaspiDelivery === true &&
                  order.attributes.kaspiDelivery &&
                  order.attributes.kaspiDelivery.express === false
              ).length || 0}
            </span>
          </button>
        </div>
      )}

      {/* Display orders */}
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
