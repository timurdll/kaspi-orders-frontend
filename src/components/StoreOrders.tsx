import React from "react";
import { Store } from "../types/orders";
import { OrderCard } from "./OrderCard";

interface StoreOrdersProps {
  store: Store;
}

export const StoreOrders: React.FC<StoreOrdersProps> = ({ store }) => {
  if (store.error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 mb-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">
          {store.storeName}
        </h2>
        <p className="text-red-600">{store.error}</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{store.storeName}</h2>
        <span className="text-sm text-gray-500">
          {store.orders?.length || 0} заказов
        </span>
      </div>
      <div className="grid gap-4">
        {store.orders?.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};
