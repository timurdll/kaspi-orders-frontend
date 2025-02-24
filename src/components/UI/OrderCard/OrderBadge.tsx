// src/components/OrderBadge.tsx
import React from "react";

interface OrderBadgeProps {
  isReturnedOrder: boolean;
  isKaspiDelivery: boolean;
  kaspiDelivery?: {
    returnedToWarehouse?: boolean;
    express?: boolean;
  };
  deliveryMode?: string;
  state?: string; // добавляем поле state
}

export const OrderBadge: React.FC<OrderBadgeProps> = ({
  isReturnedOrder,
  isKaspiDelivery,
  kaspiDelivery,
  deliveryMode,
  state,
}) => {
  // Если заказ в состоянии SIGN_REQUIRED, добавляем бейдж
  if (state === "SIGN_REQUIRED") {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
        Требуется подпись
      </span>
    );
  }

  if (isReturnedOrder && isKaspiDelivery) {
    const returned = kaspiDelivery?.returnedToWarehouse;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          returned
            ? "bg-green-100 text-green-800"
            : "bg-orange-100 text-orange-800"
        }`}
      >
        {returned ? "Возвращено на склад" : "Едет на склад"}
      </span>
    );
  } else {
    let deliveryTag = "";
    let deliveryTagColor = "";
    if (isKaspiDelivery) {
      if (kaspiDelivery?.express === true) {
        deliveryTag = "Express доставка";
        deliveryTagColor = "bg-purple-100 text-purple-800";
      } else {
        deliveryTag = "Kaspi доставка";
        deliveryTagColor = "bg-blue-100 text-blue-800";
      }
    } else {
      if (deliveryMode === "DELIVERY_PICKUP") {
        deliveryTag = "Самовывоз";
        deliveryTagColor = "bg-orange-100 text-orange-800";
      } else if (deliveryMode === "DELIVERY_LOCAL") {
        deliveryTag = "Своя доставка";
        deliveryTagColor = "bg-green-100 text-green-800";
      }
    }
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${deliveryTagColor}`}
      >
        {deliveryTag}
      </span>
    );
  }
};
