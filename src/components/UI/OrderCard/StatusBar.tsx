import React, { useState } from "react";
import { OrderCustomStatus } from "../../../types/orders";

// Массив статусов в нужном порядке
const ORDER_STATUSES: OrderCustomStatus[] = [
  "NEW",
  "ON_SHIPMENT",
  "ON_PACKAGING",
  "PACKAGED",
  "ON_DELIVERY",
  "DELIVERED",
];

// Отображаемое название для каждого статуса
const STATUS_LABELS: Record<OrderCustomStatus, string> = {
  NEW: "Новый",
  ON_SHIPMENT: "На отгрузке",
  ON_PACKAGING: "На упаковке",
  PACKAGED: "Упакован",
  ON_DELIVERY: "На доставке",
  DELIVERED: "Выдан",
};

export const OrderCard: React.FC<any> = ({ order }) => {
  const { attributes } = order;
  // Допустим, мы получаем cardStatus из Redux или пропсов
  const [cardStatus] = useState<OrderCustomStatus>(attributes.status);

  // Индекс текущего статуса в массиве
  const currentIndex = ORDER_STATUSES.indexOf(cardStatus);
  // Количество всех статусов
  const totalSteps = ORDER_STATUSES.length;

  return (
    <div className="mb-6 w-full max-w-sm">
      {/* Контейнер для «полосы статуса» */}
      <div className="relative w-full h-8 bg-gray-200 rounded overflow-hidden mb-2">
        {/* Двигаем цветную полосу с помощью translateX */}
        <div
          className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-500 ease-in-out"
          style={{
            width: `${100 / totalSteps}%`,
            transform: `translateX(${currentIndex * 100}%)`,
          }}
        />
        {/* Текст статуса поверх полосы */}
        <div className="relative z-10 h-full flex items-center justify-center text-white font-semibold text-sm">
          {STATUS_LABELS[cardStatus]}
        </div>
      </div>

      {/* Остальная часть карточки */}
      <div className="border border-gray-200 p-4 shadow-sm">
        {/* Например, заголовок заказа */}
        <p className="font-bold">Заказ №{order.id}</p>
        {/* ...и так далее */}
      </div>
    </div>
  );
};
