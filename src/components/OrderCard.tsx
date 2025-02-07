// OrderCard.tsx
import React, { useState } from "react";
import { KaspiOrder } from "../types/orders";
import { formatDate } from "../utils/format";
import { Copy, FileText } from "lucide-react";
import { useCopyNotification } from "./GlobalCopyNotification";
import { useUpdateOrderStatusMutation } from "../redux/api";

interface OrderCardProps {
  order: KaspiOrder;
  storeName: string; // передаём название магазина
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const showNotification = useCopyNotification();
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

// Функция для определения начального статуса
const getInitialStatus = (
  order: KaspiOrder
): "new" | "invoice" | "assembled" => {
  const { attributes } = order;
  // Если заказ собран (если поле assembled установлено в true), то статус assembled
  if (attributes.assembled) return "assembled";
  // Если заказ относится к Kaspi-доставке и накладная сформирована, то статус invoice
  if (attributes.isKaspiDelivery && attributes.kaspiDelivery?.waybill)
    return "invoice";
  // В остальных случаях – новый заказ
  return "new";
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, storeName }) => {
  const { attributes, products } = order;
  const orderId = order.id;

  // Статусы:
  // "new"      → красный фон (заказ только пришел)
  // "invoice"  → жёлтый фон (накладная получена/сформирована)
  // "assembled"→ зелёный фон (заказ собран)
  const [cardStatus, setCardStatus] = useState<"new" | "invoice" | "assembled">(
    getInitialStatus(order)
  );

  // Фоновый цвет в зависимости от статуса
  const bgColor =
    cardStatus === "new"
      ? "bg-red-50 border-red-200"
      : cardStatus === "invoice"
      ? "bg-yellow-50 border-yellow-200"
      : "bg-green-50 border-green-200";

  // Определяем текст и цвет для тега доставки
  // Определяем текст и цвет для тега доставки
  let deliveryTag = "";
  let deliveryTagColor = "";
  if (attributes.isKaspiDelivery) {
    // Используем строгое сравнение или приведение к булевому значению
    if (attributes.kaspiDelivery?.express === true) {
      deliveryTag = "Express доставка";
      deliveryTagColor = "bg-purple-100 text-purple-800";
    } else {
      deliveryTag = "Kaspi доставка";
      deliveryTagColor = "bg-blue-100 text-blue-800";
    }
  } else {
    if (attributes.deliveryMode === "DELIVERY_PICKUP") {
      deliveryTag = "Самовывоз";
      deliveryTagColor = "bg-orange-100 text-orange-800";
    } else if (attributes.deliveryMode === "DELIVERY_LOCAL") {
      deliveryTag = "Своя доставка";
      deliveryTagColor = "bg-green-100 text-green-800";
    }
  }

  // Хук для обновления статуса заказа (формирование/получение накладной)
  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  const handleGetWaybill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await updateOrderStatus({
        orderId,
        storeName,
      }).unwrap();
      if (response.waybill) {
        window.open(response.waybill, "_blank");
        // Переводим карточку в статус "invoice"
        setCardStatus("invoice");
      }
    } catch (error: any) {
      console.error("Ошибка получения накладной:", error);
      alert("Ошибка при получении накладной");
    }
  };

  // Обработчик для установки статуса "assembled" вручную (заказ собран)
  const handleMarkAssembled = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCardStatus("assembled");
  };

  const clientFullName = `${attributes.customer.firstName} ${attributes.customer.lastName}`;

  return (
    <div
      className={`rounded-lg border p-4 ${bgColor} transition-colors duration-300`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium">{storeName}</h3>
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deliveryTagColor}`}
          >
            {deliveryTag}
          </span>
        </div>
      </div>

      <div className="mb-2">
        <h4 className="text-base font-semibold inline-flex items-center">
          Заказ #{orderId}
          <CopyButton text={orderId} />
        </h4>
        <p className="text-xs text-gray-700">
          {formatDate(attributes.creationDate)}
        </p>
      </div>

      <div className="mb-2 space-y-1">
        <p className="text-sm text-gray-600">
          Клиент: {clientFullName}
          <CopyButton text={clientFullName} />
        </p>
        <p className="text-sm text-gray-600">
          Телефон: {attributes.customer.cellPhone}
          <CopyButton text={attributes.customer.cellPhone} />
        </p>
        <p className="text-sm text-gray-600">
          Адрес: {attributes.deliveryAddress?.formattedAddress || ""}
          <CopyButton
            text={attributes.deliveryAddress?.formattedAddress || ""}
          />
        </p>
      </div>

      <div className="mt-2">
        <h4 className="font-medium text-sm">Товары:</h4>
        <ul className="list-disc list-inside text-sm">
          {products.map((product, index) => (
            <li key={index} className="flex items-center">
              <span>
                {product.name} (x{product.quantity})
              </span>
              <CopyButton text={`${product.name} (x${product.quantity})`} />
            </li>
          ))}
        </ul>
      </div>

      {attributes.isKaspiDelivery && !attributes.preOrder && (
        <div className="mt-4">
          {attributes.kaspiDelivery?.waybill ? (
            <a
              href={attributes.kaspiDelivery.waybill}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText className="mr-2 h-4 w-4" />
              Получить накладную
            </a>
          ) : (
            <button
              onClick={handleGetWaybill}
              disabled={isUpdating}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isUpdating ? "Загрузка..." : "Сформировать накладную"}
            </button>
          )}
        </div>
      )}

      <div className="mt-4">
        {cardStatus !== "assembled" && (
          <button
            onClick={handleMarkAssembled}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Отметить, что заказ собран
          </button>
        )}
      </div>
    </div>
  );
};
