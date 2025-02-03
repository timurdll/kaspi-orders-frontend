import React, { useState, useEffect } from "react";
import { KaspiOrder } from "../types/orders";
import { formatDate, formatPrice } from "../utils/format";

interface OrderCardProps {
  order: KaspiOrder;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { attributes, products } = order;
  const orderId = attributes.code; // Используем ID заказа как ключ

  console.log(order);

  // Функция определения исходного цвета
  const getInitialColor = () => {
    return attributes.kaspiDelivery?.express
      ? "bg-red-300"
      : attributes.assembled || attributes.status === "COMPLETED"
      ? "bg-yellow-300"
      : "bg-white";
  };

  // Загружаем цвет из localStorage или используем стандартный
  const [bgColor, setBgColor] = useState(() => {
    return localStorage.getItem(`order-${orderId}`) || getInitialColor();
  });

  useEffect(() => {
    localStorage.setItem(`order-${orderId}`, bgColor);
  }, [bgColor, orderId]);

  const toggleColor = () => {
    setBgColor((prev) =>
      prev === "bg-green-300" ? getInitialColor() : "bg-green-300"
    );
  };

  return (
    <div
      className={`border rounded-lg shadow-sm p-4 cursor-pointer ${bgColor}`}
      onClick={toggleColor}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium">Заказ #{orderId}</h3>
          <p className="text-sm text-gray-500">
            {formatDate(attributes.creationDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Клиент</h4>
          <p>
            {attributes.customer.firstName} {attributes.customer.lastName}
          </p>
          <p className="text-sm text-gray-600">
            {attributes.customer.cellPhone}
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2">Доставка</h4>
          <p className="text-sm">
            {attributes.isKaspiDelivery ? "Kaspi доставка" : "Своя доставка"}
          </p>
          <p className="text-sm text-gray-600">
            {formatDate(attributes.plannedDeliveryDate)}
          </p>
        </div>

        <div className="col-span-2">
          <h4 className="font-medium mb-2">Адрес доставки</h4>
          <p className="text-sm">
            {attributes.deliveryAddress?.formattedAddress || ""}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Товары в заказе</h4>
        <ul className="list-disc list-inside text-sm">
          {products.map((product, index) => (
            <li key={index}>
              {product.name} (x{product.quantity})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
