// src/components/OrderBadge.tsx
import React, { useMemo } from "react";

interface OrderBadgeProps {
  isReturnedOrder: boolean;
  isKaspiDelivery: boolean;
  kaspiDelivery?: {
    returnedToWarehouse?: boolean;
    express?: boolean;
  };
  deliveryMode?: string;
  state?: string;
}

export const OrderBadge: React.FC<OrderBadgeProps> = ({
  isReturnedOrder,
  isKaspiDelivery,
  kaspiDelivery,
  deliveryMode,
  state,
}) => {
  // Небольшой случайный поворот от -5 до +5 градусов
  const angle = useMemo(() => Math.floor(Math.random() * 11) - 5, []);

  let text = "";
  let backgroundColor = "#7C7C7C";

  if (state === "SIGN_REQUIRED") {
    text = "Требуется подпись";
  } else if (isReturnedOrder && isKaspiDelivery) {
    const returned = kaspiDelivery?.returnedToWarehouse;
    text = returned ? "Возвращено на склад" : "Едет на склад";
    backgroundColor = returned ? "#4ade80" : "#fb923c";
  } else if (isKaspiDelivery) {
    if (kaspiDelivery?.express) {
      text = "Экспресс!!!";
      backgroundColor = "#F47CFF";
    } else {
      text = "Kaspi доставка";
      backgroundColor = "#16E7E7";
    }
  } else {
    if (deliveryMode === "DELIVERY_PICKUP") {
      text = "Самовывоз";
      backgroundColor = "#F0EC62";
    } else if (deliveryMode === "DELIVERY_LOCAL") {
      text = "Своя доставка";
      backgroundColor = "#AFFF7C";
    }
  }

  // Контейнер наклейки с динамической шириной и отступом слева для треугольника
  const containerStyle: React.CSSProperties = {
    position: "absolute",
    top: "0.5rem",
    right: "5px", // отступ от правого края 15px
    zIndex: 10,
    backgroundColor,
    paddingLeft: "27px", // отступ от текста до левого угла = 37px
    paddingRight: "0.75rem",
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
    whiteSpace: "nowrap", // текст всегда в одну строку
    transform: `rotate(${angle}deg)`,
    transformOrigin: "top right",
    // Формируем фигуру с острым левым углом
    clipPath: "polygon(27px 0, 100% 0, 100% 100%, 27px 100%, 0 50%)",
  };

  const textStyle: React.CSSProperties = {
    color: "#fff",
    fontWeight: "bold",
    fontSize: "0.875rem",
  };

  return (
    <div style={containerStyle}>
      <span style={textStyle}>{text}</span>
    </div>
  );
};
