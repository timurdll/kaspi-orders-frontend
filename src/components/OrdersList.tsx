// src/components/OrdersList.tsx
import React from "react";
import { OrderCard } from "./OrderCard";

interface OrdersListProps {
  orders: any[]; // замените any на ваш тип заказа
  storeName: string;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  storeName,
}) => {
  if (orders.length === 0) {
    return <p className="text-gray-500">Нет заказов для доставки.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order) => (
        <OrderCard storeName={storeName} key={order.id} order={order} />
      ))}
    </div>
  );
};
