import React from "react";
import { OrderCustomStatus } from "../../../types/orders";

const STATUS_LABELS: Record<OrderCustomStatus, string> = {
  NEW: "Новый",
  ON_SHIPMENT: "На отгрузке",
  ON_PACKAGING: "На упаковке",
  PACKAGED: "Упакован",
  ON_DELIVERY: "На доставке",
  DELIVERED: "Выдан",
};

interface OrderStatusProps {
  status: OrderCustomStatus;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
  return (
    <div className="text-xs font-semibold text-gray-600 mb-1">
      {STATUS_LABELS[status] ?? "Неизвестен"}
    </div>
  );
};
