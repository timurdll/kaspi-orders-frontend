import React, { useState, useEffect } from "react";
import { KaspiOrder, OrderStatus } from "../../../types/orders";
import {
  useCompleteOrderMutation,
  useSendSecurityCodeMutation,
  useUpdateOrderStatusMutation,
  useLazyGenerateWaybillQuery,
} from "../../../redux/api";
import { OrderBadge } from "./OrderBadge";
import { OrderActions } from "./OrderActions";
import { FileText } from "lucide-react";
import { OrderHeader } from "./OrderHeader";
import { OrderDetails } from "./OrderDetails";

interface OrderCardProps {
  order: KaspiOrder;
  storeName: string;
  isReturnedOrder?: boolean;
}

const getInitialStatus = (order: KaspiOrder): OrderStatus => {
  const attributes = order?.attributes;
  if (attributes?.assembled) return "assembled";
  if (attributes?.kaspiDelivery?.waybill) return "invoice";
  return "new";
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  storeName,
  isReturnedOrder = false,
}) => {
  // Если order или его attributes отсутствуют – ничего не рендерим
  if (!order || !order.attributes) {
    return (
      <div className="rounded-lg border p-4 bg-red-50">
        <p className="text-red-600">Некорректные данные заказа</p>
      </div>
    );
  }

  const { attributes, products } = order;
  const orderId = order.id;

  const [cardStatus, setCardStatus] = useState<OrderStatus>(
    getInitialStatus(order)
  );
  const [invoiceLink, setInvoiceLink] = useState<string | null>(
    attributes?.kaspiDelivery?.waybill || null
  );
  const [securityCode, setSecurityCode] = useState<string>("");
  const [showCodeInput, setShowCodeInput] = useState<boolean>(() => {
    // При инициализации проверяем, был ли код уже отправлен для этого заказа
    return localStorage.getItem(`codeSent_${orderId}`) === "true";
  });
  const [error, setError] = useState<string | null>(null);

  const [sendSecurityCode] = useSendSecurityCodeMutation();
  const [completeOrder] = useCompleteOrderMutation();
  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [triggerGenerateWaybill, { isFetching: isGenerating }] =
    useLazyGenerateWaybillQuery();

  useEffect(() => {
    if (localStorage.getItem(`codeSent_${orderId}`) === "true") {
      setShowCodeInput(true);
    }
  }, [orderId]);

  useEffect(() => {
    setInvoiceLink(attributes?.kaspiDelivery?.waybill || null);
    setCardStatus(getInitialStatus(order));
    // Убрали сброс showCodeInput, чтобы не терять состояние отправленного кода
    setSecurityCode("");
    setError(null);
  }, [order, attributes?.kaspiDelivery]);

  const handleSendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await sendSecurityCode({
        orderId,
        storeName,
        orderCode: order.attributes?.code,
      }).unwrap();
    } catch (error) {
      console.error("Ошибка при отправке кода:", error);
      setError("Ошибка при отправке кода. Попробуйте ввести полученный код.");
    } finally {
      // Фиксируем, что код уже отправлен – независимо от результата запроса
      setShowCodeInput(true);
      localStorage.setItem(`codeSent_${orderId}`, "true");
    }
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!securityCode) {
      setError("Пожалуйста, введите код");
      return;
    }
    try {
      await completeOrder({
        orderId,
        storeName,
        orderCode: attributes?.code,
        securityCode,
      }).unwrap();
      setShowCodeInput(false);
      setSecurityCode("");
      if (
        attributes?.deliveryMode !== "DELIVERY_LOCAL" &&
        attributes?.deliveryMode !== "DELIVERY_PICKUP"
      ) {
        setCardStatus("completed");
      }
    } catch (error) {
      console.error("Error completing order:", error);
      setError("Ошибка при завершении заказа");
    }
  };

  // Функция для генерации накладной для DELIVERY_LOCAL (обновляя статус)
  const handleGenerateWaybill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    try {
      const blob = await triggerGenerateWaybill(orderId).unwrap();
      if (!blob) throw new Error("Не удалось получить накладную");
      const blobUrl = window.URL.createObjectURL(blob);
      setInvoiceLink(blobUrl);
      window.open(blobUrl, "_blank");
      setCardStatus("invoice");
    } catch (error) {
      console.error("Error generating waybill:", error);
      setError("Ошибка формирования накладной");
    }
  };

  // Функция для получения накладной для DELIVERY_REGIONAL_TODOOR и DELIVERY_PICKUP (не express)
  const handleGetWaybill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    try {
      const response = await updateOrderStatus({ orderId, storeName }).unwrap();
      if (response?.waybill) {
        setInvoiceLink(response.waybill);
        window.open(response.waybill, "_blank");
        setCardStatus("invoice");
      } else {
        setError("Накладная еще не сформирована, повторите запрос позже");
      }
    } catch (error: any) {
      console.error("Error getting waybill:", error);
      setError("Ошибка при получении накладной");
    }
  };

  // Функция для получения накладной для express заказов – статус не обновляется
  const handleGetWaybillExpress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    try {
      const response = await updateOrderStatus({ orderId, storeName }).unwrap();
      if (response?.waybill) {
        setInvoiceLink(response.waybill);
        window.open(response.waybill, "_blank");
        // Не обновляем cardStatus
      } else {
        setError("Накладная еще не сформирована, повторите запрос позже");
      }
    } catch (error: any) {
      console.error("Error getting express waybill:", error);
      setError("Ошибка при получении накладной");
    }
  };

  const handleMarkAssembled = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCardStatus("assembled");
  };

  const handleSendForTransfer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    try {
      await updateOrderStatus({ orderId, storeName }).unwrap();
      setCardStatus("transferred");
    } catch (error) {
      console.error("Error sending for transfer:", error);
      setError("Ошибка при обновлении статуса заказа");
    }
  };

  // Функция рендеринга кнопки накладной согласно требованиям
  const renderInvoiceButton = () => {
    if (attributes.state === "SIGN_REQUIRED") return null;

    // Для заказов с isKaspiDelivery === false и deliveryMode DELIVERY_PICKUP – кнопки накладной не нужны
    if (
      attributes.isKaspiDelivery === false &&
      attributes.deliveryMode === "DELIVERY_PICKUP"
    ) {
      return null;
    }

    if (attributes.deliveryMode === "DELIVERY_LOCAL") {
      return invoiceLink ? (
        <a
          href={invoiceLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <FileText size={16} className="text-white" />
        </a>
      ) : (
        <button
          onClick={handleGenerateWaybill}
          disabled={isGenerating}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
        >
          {isGenerating ? (
            <span className="loader w-4 h-4 border-2 border-t-transparent rounded-full" />
          ) : (
            <FileText size={16} className="text-white" />
          )}
        </button>
      );
    }

    // Для заказов Kaspi доставки (isKaspiDelivery === true):
    if (attributes.isKaspiDelivery === true) {
      // Для express заказов:
      if (attributes.kaspiDelivery?.express === true) {
        return invoiceLink ? (
          <a
            href={invoiceLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            <FileText size={16} className="text-white" />
          </a>
        ) : (
          <button
            onClick={handleGetWaybillExpress}
            disabled={isUpdating}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
          >
            {isUpdating ? (
              <span className="loader w-4 h-4 border-2 border-t-transparent rounded-full" />
            ) : (
              <FileText size={16} className="text-white" />
            )}
          </button>
        );
      } else {
        // Для не express заказов (например, DELIVERY_REGIONAL_TODOOR и DELIVERY_PICKUP)
        return invoiceLink ? (
          <a
            href={invoiceLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            <FileText size={16} className="text-white" />
          </a>
        ) : (
          <button
            onClick={handleGetWaybill}
            disabled={isUpdating}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
          >
            {isUpdating ? (
              <span className="loader w-4 h-4 border-2 border-t-transparent rounded-full" />
            ) : (
              <FileText size={16} className="text-white" />
            )}
          </button>
        );
      }
    }

    return null;
  };

  const getBgColor = (): string => {
    if (attributes.isKaspiDelivery) {
      switch (cardStatus) {
        case "new":
          return "bg-red-50 border-red-200";
        case "invoice":
          return "bg-yellow-50 border-yellow-200";
        case "transferred":
          return "bg-indigo-50 border-indigo-200";
        case "assembled":
        case "completed":
          return "bg-green-50 border-green-200";
        default:
          return "bg-red-50 border-red-200";
      }
    }
    return cardStatus === "assembled" || cardStatus === "completed"
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200";
  };

  return (
    <div
      className={`rounded-lg border p-4 ${getBgColor()} transition-colors duration-300`}
    >
      {error && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <div className="flex justify-between items-center mb-2">
        <OrderBadge
          isReturnedOrder={isReturnedOrder}
          isKaspiDelivery={attributes.isKaspiDelivery}
          kaspiDelivery={attributes.kaspiDelivery}
          deliveryMode={attributes.deliveryMode}
          state={attributes.state}
        />
        {renderInvoiceButton()}
      </div>
      <OrderHeader
        code={attributes.code}
        creationDate={attributes.creationDate}
      />
      <OrderDetails
        customer={attributes.customer}
        deliveryAddress={attributes.deliveryAddress}
        products={products || []}
      />
      <div className="mt-4">
        <OrderActions
          attributes={attributes}
          cardStatus={cardStatus}
          showCodeInput={showCodeInput}
          securityCode={securityCode}
          onSendCode={handleSendCode}
          onCompleteOrder={handleCompleteOrder}
          onMarkAssembled={handleMarkAssembled}
          onSendForTransfer={handleSendForTransfer}
          onSecurityCodeChange={setSecurityCode}
        />
      </div>
    </div>
  );
};
