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

const getInitialStatus = (
  order: KaspiOrder
): "new" | "invoice" | "assembled" => {
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
      setCardStatus("code_sent");
      setShowCodeInput(true);
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
      setCardStatus("completed");
      setShowCodeInput(false);
    } catch (error) {
      console.error("Error completing order:", error);
      alert("Ошибка при завершении заказа");
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

  // Пример вычисления цвета фона карточки
  const getBgColor = () => {
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
  };
  const bgColor = getBgColor();

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
        />
        {attributes.deliveryMode === "DELIVERY_LOCAL" ? (
          invoiceLink ? (
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
          )
        ) : (
          attributes.isKaspiDelivery &&
          !attributes.preOrder &&
          (invoiceLink ? (
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
          ))
        )}
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
