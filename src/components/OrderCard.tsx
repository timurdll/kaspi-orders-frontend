import React, { useState, useEffect } from "react";
import { KaspiOrder } from "../types/orders";
import {
  useCompleteOrderMutation,
  useSendSecurityCodeMutation,
  useUpdateOrderStatusMutation,
  useLazyGenerateWaybillQuery,
} from "../redux/api";
import { OrderBadge } from "./UI/DeliveryBadge";
import { OrderHeader } from "./UI/OrderHeader";
import { OrderDetails } from "./UI/OrderDetails";
import { OrderActions } from "./UI/OrderActions";
import { FileText } from "lucide-react";

interface OrderCardProps {
  order: KaspiOrder;
  storeName: string;
  isReturnedOrder?: boolean;
}

const getInitialStatus = (order: KaspiOrder) => {
  const { attributes } = order;
  if (attributes.assembled) return "assembled";
  if (attributes.kaspiDelivery?.waybill) return "invoice";
  return "new";
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  storeName,
  isReturnedOrder = false,
}) => {
  // Если order или order.attributes отсутствуют, ничего не рендерим
  if (!order || !order.attributes) return null;

  const { attributes, products } = order;
  const orderId = order.id;
  const [cardStatus, setCardStatus] = useState<
    "new" | "invoice" | "assembled" | "code_sent" | "completed" | "transferred"
  >(getInitialStatus(order));
  const [invoiceLink, setInvoiceLink] = useState<string | null>(
    attributes.kaspiDelivery?.waybill || null
  );
  const [securityCode, setSecurityCode] = useState<string>("");
  const [showCodeInput, setShowCodeInput] = useState<boolean>(false);

  const [sendSecurityCode] = useSendSecurityCodeMutation();
  const [completeOrder] = useCompleteOrderMutation();
  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [triggerGenerateWaybill, { isFetching: isGenerating }] =
    useLazyGenerateWaybillQuery();

  useEffect(() => {
    setInvoiceLink(attributes.kaspiDelivery?.waybill || null);
    setCardStatus(getInitialStatus(order));
    setShowCodeInput(false);
    setSecurityCode("");
  }, [order, attributes.kaspiDelivery]);

  const handleSendCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await sendSecurityCode({
        orderId,
        storeName,
        orderCode: attributes.code,
      }).unwrap();
      setShowCodeInput(true);
      // Для DELIVERY_LOCAL и DELIVERY_PICKUP оставляем статус "new"
      if (
        attributes.deliveryMode !== "DELIVERY_LOCAL" &&
        attributes.deliveryMode !== "DELIVERY_PICKUP"
      ) {
        setCardStatus("code_sent");
      }
    } catch (error) {
      console.error("Error sending security code:", error);
      alert("Ошибка при отправке кода");
    }
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityCode) {
      alert("Пожалуйста, введите код");
      return;
    }
    try {
      await completeOrder({
        orderId,
        storeName,
        orderCode: attributes.code,
        securityCode,
      }).unwrap();
      setShowCodeInput(false);
      setSecurityCode("");
      if (
        attributes.deliveryMode !== "DELIVERY_LOCAL" &&
        attributes.deliveryMode !== "DELIVERY_PICKUP"
      ) {
        setCardStatus("completed");
      }
    } catch (error) {
      console.error("Error completing order:", error);
      alert("Ошибка при завершении заказа");
    }
  };

  // Функции получения/генерации накладной для заказов Kaspi доставки:
  const handleGenerateWaybill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await triggerGenerateWaybill(orderId).unwrap();
      const blobUrl = window.URL.createObjectURL(blob);
      setInvoiceLink(blobUrl);
      window.open(blobUrl, "_blank");
      setCardStatus("invoice");
    } catch (error) {
      console.error("Ошибка формирования накладной:", error);
      alert("Ошибка формирования накладной");
    }
  };

  const handleGetWaybill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await updateOrderStatus({ orderId, storeName }).unwrap();
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

  const handleGetWaybillExpress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await updateOrderStatus({ orderId, storeName }).unwrap();
      if (response.waybill) {
        setInvoiceLink(response.waybill);
        window.open(response.waybill, "_blank");
        // Не обновляем cardStatus для express
      } else {
        console.log("Накладная еще не сформирована, повторите запрос позже.");
      }
    } catch (error: any) {
      console.error("Ошибка получения накладной для express:", error);
      alert("Ошибка при получении накладной");
    }
  };

  const handleMarkAssembled = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCardStatus("assembled");
  };

  const handleSendForTransfer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateOrderStatus({ orderId, storeName }).unwrap();
      setCardStatus("transferred");
    } catch (error) {
      console.error("Ошибка при отправке на передачу:", error);
      alert("Ошибка при обновлении статуса заказа");
    }
  };

  // Функция для рендеринга кнопки накладной согласно требованиям
  const renderInvoiceButton = () => {
    // Если заказ со статусом SIGN_REQUIRED – не показываем кнопку
    if (attributes.state === "SIGN_REQUIRED") return null;

    // Для DELIVERY_LOCAL: показываем кнопку генерации накладной
    if (attributes.deliveryMode === "DELIVERY_LOCAL") {
      return invoiceLink ? (
        <a
          href={invoiceLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <FileText size={16} />
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
            <FileText size={16} />
          )}
        </button>
      );
    }

    // Для DELIVERY_REGIONAL_TODOOR и DELIVERY_PICKUP, если isKaspiDelivery === true и не express:
    if (
      attributes.isKaspiDelivery &&
      !attributes.kaspiDelivery?.express &&
      (attributes.deliveryMode === "DELIVERY_REGIONAL_TODOOR" ||
        attributes.deliveryMode === "DELIVERY_PICKUP")
    ) {
      return invoiceLink ? (
        <a
          href={invoiceLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <FileText size={16} />
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
            <FileText size={16} />
          )}
        </button>
      );
    }

    // Для express заказов (isKaspiDelivery true и express === true):
    if (attributes.isKaspiDelivery && attributes.kaspiDelivery?.express) {
      return invoiceLink ? (
        <a
          href={invoiceLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <FileText size={16} />
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
            <FileText size={16} />
          )}
        </button>
      );
    }
    return null;
  };

  // Определяем фон карточки (без изменений)
  const bgColor = (() => {
    if (attributes.isKaspiDelivery) {
      if (cardStatus === "new") return "bg-red-50 border-red-200";
      if (cardStatus === "invoice") return "bg-yellow-50 border-yellow-200";
      if (cardStatus === "transferred") return "bg-indigo-50 border-indigo-200";
      if (cardStatus === "assembled" || cardStatus === "completed")
        return "bg-green-50 border-green-200";
    } else {
      if (cardStatus === "assembled" || cardStatus === "completed")
        return "bg-green-50 border-green-200";
      return "bg-red-50 border-red-200";
    }
    return "bg-red-50 border-red-200";
  })();

  return (
    <div
      className={`rounded-lg border p-4 ${bgColor} transition-colors duration-300`}
    >
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
        products={products}
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
