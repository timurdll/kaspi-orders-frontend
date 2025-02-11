// src/components/StoreOrdersList.tsx
import React from "react";
import { StoreOrders } from "./StoreOrders";

interface StoreOrdersListProps {
  stores: any[]; // здесь можно типизировать по вашей модели
  type: "current" | "archive" | "pre-orders" | "returned";
}

export const StoreOrdersList: React.FC<StoreOrdersListProps> = ({
  stores,
  type,
}) => {
  return (
    <div className="space-y-6">
      {stores.map((store: any) => (
        <StoreOrders key={store.storeName} store={store} type={type} />
      ))}
    </div>
  );
};
