// OrderCard.tsx
import React, { useState, useEffect } from "react";
import { KaspiOrder } from "../types/orders";
import { formatDate } from "../utils/format";
import { Copy, FileText } from "lucide-react";
import { useCopyNotification } from "./GlobalCopyNotification";
import { useUpdateOrderStatusMutation } from "../redux/api";

interface OrderCardProps {
  order: KaspiOrder;
  storeName: string;
}

// Кнопка для копирования текста
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const showNotification = useCopyNotification();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        showNotification("Скопировано!");
      } catch (err) {
        console.error("Ошибка копирования через Clipboard API:", err);
      }
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        if (successful) {
          showNotification("Скопировано!");
        } else {
          console.error("Fallback копирование не удалось");
        }
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("Ошибка копирования (fallback):", err);
      }
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

// Определяем начальный статус заказа
// Даже если накладная уже сформирована, при поступлении заказа статус всегда "new" (красный)
// Если заказ уже собран, возвращаем "assembled"
const getInitialStatus = (
  order: KaspiOrder
): "new" | "invoice" | "assembled" => {
  const { attributes } = order;
  if (attributes.assembled) return "assembled";
  return "new";
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, storeName }) => {
  const { attributes, products } = order;
  const orderId = order.id;

  // Локальный стейт для статуса карточки и ссылки на накладную
  const [cardStatus, setCardStatus] = useState<"new" | "invoice" | "assembled">(
    getInitialStatus(order)
  );
  const [invoiceLink, setInvoiceLink] = useState<string | null>(
    order.attributes.kaspiDelivery?.waybill || null
  );

  // При изменении order обновляем статус и ссылку
  useEffect(() => {
    setInvoiceLink(order.attributes.kaspiDelivery?.waybill || null);
    setCardStatus(getInitialStatus(order));
  }, [order]);

  // Функция вычисления цвета карточки с учетом флага isKaspiDelivery и текущего статуса
  const getBgColor = () => {
    if (attributes.isKaspiDelivery) {
      if (cardStatus === "new") return "bg-red-50 border-red-200";
      if (cardStatus === "invoice") return "bg-yellow-50 border-yellow-200";
      if (cardStatus === "assembled") return "bg-green-50 border-green-200";
    } else {
      // Для заказов без накладной используем красный для "new" и зеленый для "assembled"
      if (cardStatus === "assembled") return "bg-green-50 border-green-200";
      return "bg-red-50 border-red-200";
    }
  };

  const bgColor = getBgColor();

  // Определяем текст и стиль тега доставки
  let deliveryTag = "";
  let deliveryTagColor = "";
  if (attributes.isKaspiDelivery) {
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

  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  // Обработчик для получения накладной
  const handleGetWaybill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await updateOrderStatus({ orderId, storeName }).unwrap();
      // Если накладная сформирована, обновляем состояние на "invoice" (жёлтый)
      if (response.waybill) {
        setInvoiceLink(response.waybill);
        window.open(response.waybill, "_blank");
        setCardStatus("invoice");
      } else {
        console.log("Накладная еще не сформирована, повторите запрос позже.");
      }
    } catch (error: any) {
      console.error("Ошибка получения накладной:", error);
      alert("Ошибка при получении накладной");
    }
  };

  // Обработчик для отметки, что заказ собран (переводим статус в "assembled", зеленый)
  const handleMarkAssembled = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCardStatus("assembled");
  };

  const clientFullName = `${attributes.customer.firstName} ${attributes.customer.lastName}`;

  return (
    <div
      className={`rounded-lg border p-4 ${bgColor} transition-colors duration-300`}
    >
      <div className="flex justify-between items-center">
        {/* Тег доставки */}
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${deliveryTagColor}`}
        >
          {deliveryTag}
        </span>

        {/* Кнопка получения накладной отображается только для Kaspi Delivery и не для предзаказов */}
        {attributes.isKaspiDelivery && !attributes.preOrder && (
          <div>
            {invoiceLink ? (
              <a
                href={invoiceLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <FileText size={16} />
              </a>
            ) : (
              <button
                onClick={handleGetWaybill}
                disabled={isUpdating}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
              >
                {isUpdating ? (
                  <span className="loader w-4 h-4 border-2 border-t-transparent rounded-full" />
                ) : (
                  <FileText size={16} />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-2">
        <h4 className="text-base font-semibold inline-flex items-center">
          {attributes.code}
          <CopyButton text={attributes.code} />
        </h4>
        <p className="text-xs text-gray-700">
          {formatDate(attributes.creationDate)}
        </p>
      </div>

      <div className="mb-2 space-y-1">
        <p className="text-sm text-gray-600">
          {clientFullName}
          <CopyButton text={clientFullName} />
        </p>
        <p className="text-sm text-gray-600">
          {attributes.customer.cellPhone}
          <CopyButton text={attributes.customer.cellPhone} />
        </p>
        {attributes.deliveryAddress?.formattedAddress && (
          <p className="text-sm text-gray-600">
            {attributes.deliveryAddress.formattedAddress}
            <CopyButton text={attributes.deliveryAddress.formattedAddress} />
          </p>
        )}
      </div>

      <div className="mt-2">
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
