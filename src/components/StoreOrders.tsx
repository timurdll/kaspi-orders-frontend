// src/components/StoreOrders.tsx
import React, { useState, useMemo } from "react";
import { Store } from "../types/orders";
import { DeleteConfirmationModal } from "./UI/Modals/DeleteConfirmationModal";
import { OrdersList } from "./OrdersList";
import { OrdersDeliveryDayTabs } from "./UI/Tabs/OrdersDeliveryDayTabs";
import { useDeleteStoreMutation } from "../redux/api/api";

interface StoreOrdersProps {
  store: Store;
  type?: "current" | "archive" | "pre-orders" | "returned";
}

export const StoreOrders: React.FC<StoreOrdersProps> = ({
  store,
  type = "current",
}) => {
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow">("today");
  const [selectedCity, setSelectedCity] = useState<string>("All");
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

  // Получаем список уникальных значений из нового поля warehouseAddress
  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    ordersToDisplay.forEach((order) => {
      const cityName = order.attributes.warehouseAddress;
      if (cityName) {
        cities.add(cityName);
      }
    });
    return Array.from(cities);
  }, [ordersToDisplay]);

  // Фильтрация заказов по выбранному значению warehouseAddress (если выбрано не "All")
  if (selectedCity !== "All") {
    ordersToDisplay = ordersToDisplay.filter(
      (order) => order.attributes.warehouseAddress === selectedCity
    );
  }

  // Если отображаются "текущие" заказы, применяем дополнительную фильтрацию по времени
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
      if (kaspiDelivery?.express) return true; // Express-заказы всегда попадают в today
      return creationDate < todayCutoff;
    });

    const tomorrowOrders = ordersToDisplay.filter((order) => {
      const { isKaspiDelivery, kaspiDelivery, creationDate } = order.attributes;
      return (
        isKaspiDelivery &&
        !kaspiDelivery?.express && // Express-заказы исключаются из tomorrow
        creationDate >= todayCutoff
      );
    });

    ordersToDisplay = activeTab === "today" ? todayOrders : tomorrowOrders;
  }

  return (
    <div className="mb-6 border-2 border-blue-500 flex flex-col gap-4 p-4">
      {/* Фильтр по городу (warehouseAddress) */}
      <div className="mb-4">
        <label htmlFor="city-filter" className="mr-2 font-medium">
          Фильтр по городу:
        </label>
        <select
          id="city-filter"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="border rounded p-1"
        >
          <option value="All">Все города</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {type === "current" && (
        <OrdersDeliveryDayTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          storeOrders={store.orders || []}
        />
      )}
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
