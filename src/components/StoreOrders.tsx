// src/components/StoreOrders.tsx
import React, { useState } from "react";
import { Store } from "../types/orders";
import { useDeleteStoreMutation } from "../redux/api";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { StoreHeader } from "./StoreHeader";
import { OrdersDeliveryDayTabs } from "./OrdersDeliveryDayTabs";
import { OrdersList } from "./OrdersList";

interface StoreOrdersProps {
  store: Store;
  type?: "current" | "archive" | "pre-orders" | "returned";
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

  // Если отображаются "текущие" заказы, применяем фильтрацию
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
      const { isKaspiDelivery, kaspiDelivery, creationDate } = order.attributes;
      if (!isKaspiDelivery) return true;
      if (kaspiDelivery?.express) return true; // Теперь express заказы всегда идут в today
      return creationDate < todayCutoff;
    });

    const tomorrowOrders = ordersToDisplay.filter((order) => {
      const { isKaspiDelivery, kaspiDelivery, creationDate } = order.attributes;
      return (
        isKaspiDelivery &&
        !kaspiDelivery?.express && // Express-заказы исключаем из tomorrow
        creationDate >= todayCutoff
      );
    });

    ordersToDisplay = activeTab === "today" ? todayOrders : tomorrowOrders;
  }

  return (
    <div className="mb-6">
      <StoreHeader
        storeName={store.storeName}
        ordersCount={store.orders?.length || 0}
      >
        {type === "current" && (
          <OrdersDeliveryDayTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            storeOrders={store.orders || []}
          />
        )}
      </StoreHeader>
      <OrdersList
        orders={ordersToDisplay}
        storeName={store.storeName}
        type={type}
      />
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
