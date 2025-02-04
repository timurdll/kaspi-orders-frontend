// OrderCard.tsx
import React, { useState, useEffect } from "react";
import { KaspiOrder } from "../types/orders";
import { formatDate } from "../utils/format";
import { Copy } from "lucide-react";
import { useCopyNotification } from "./GlobalCopyNotification";

interface OrderCardProps {
  order: KaspiOrder;
}

// Компонент кнопки копирования с использованием глобального уведомления
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const showNotification = useCopyNotification();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие клика, чтобы не переключался цвет карточки
    try {
      await navigator.clipboard.writeText(text);
      showNotification("Скопировано!");
    } catch (err) {
      console.error("Ошибка копирования:", err);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="ml-1 inline-flex items-center text-gray-500 hover:text-gray-700"
      title="Скопировать"
    >
      <Copy size={16} />
    </button>
  );
};

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { attributes, products } = order;
  const orderId = attributes.code; // Используем ID заказа как идентификатор

  const getInitialColor = () => {
    return !attributes.isKaspiDelivery
      ? "bg-blue-300"
      : attributes.kaspiDelivery?.express
      ? "bg-red-300"
      : attributes.assembled
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

  // Переключение цвета карточки при клике по области карточки
  const toggleColor = () => {
    setBgColor((prev) =>
      prev === "bg-green-300" ? getInitialColor() : "bg-green-300"
    );
  };

  // Формируем полное имя клиента
  const clientFullName = `${attributes.customer.firstName} ${attributes.customer.lastName}`;

  return (
    <div
      className={`border rounded-lg shadow p-3 cursor-pointer ${bgColor} transition-colors duration-300`}
      onClick={toggleColor}
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-base font-semibold inline-flex items-center">
            Заказ #{orderId}
            <CopyButton text={orderId} />
          </h3>
          <p className="text-xs text-gray-500">
            {formatDate(attributes.creationDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <h4 className="font-medium text-xs mb-1">Клиент</h4>
          <p className="text-xs inline-flex items-center">
            {clientFullName}
            <CopyButton text={clientFullName} />
          </p>
          <p className="text-xs text-gray-600 inline-flex items-center">
            {attributes.customer.cellPhone}
            <CopyButton text={attributes.customer.cellPhone} />
          </p>
        </div>
        <div></div>
        <div className="col-span-2">
          <h4 className="font-medium text-xs mb-1">Адрес доставки</h4>
          <p className="text-xs text-gray-700 inline-flex items-center">
            {attributes.deliveryAddress?.formattedAddress || ""}
            <CopyButton
              text={attributes.deliveryAddress?.formattedAddress || ""}
            />
          </p>
        </div>
      </div>

      <div className="mt-2">
        <h4 className="font-medium text-xs mb-1">Товары</h4>
        <ul className="list-disc list-inside text-xs">
          {products.map((product, index) => (
            <li key={index} className="inline-flex items-center">
              <span>
                {product.name} (x{product.quantity})
              </span>
              <CopyButton text={product.name} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
