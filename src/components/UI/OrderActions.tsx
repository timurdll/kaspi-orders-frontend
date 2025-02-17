// src/components/OrderActions.tsx
import React from "react";

interface OrderActionsProps {
  attributes: any;
  cardStatus: string;
  showCodeInput: boolean;
  securityCode: string;
  onSendCode: (e: React.MouseEvent) => void;
  onCompleteOrder: (e: React.FormEvent) => void;
  onMarkAssembled: (e: React.MouseEvent) => void;
  onSendForTransfer: (e: React.MouseEvent) => void;
  onSecurityCodeChange: (value: string) => void;
}

export const OrderActions: React.FC<OrderActionsProps> = ({
  attributes,
  cardStatus,
  showCodeInput,
  securityCode,
  onSendCode,
  onCompleteOrder,
  onMarkAssembled,
  onSendForTransfer,
  onSecurityCodeChange,
}) => {
  // Если заказ экспресс – кнопка "Отправить на передачу"
  if (
    attributes.isKaspiDelivery &&
    attributes.kaspiDelivery?.express &&
    cardStatus === "invoice"
  ) {
    return (
      <button
        onClick={onSendForTransfer}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Отправить на передачу
      </button>
    );
  }

  // Для заказов с режимом доставки DELIVERY_LOCAL
  if (attributes.deliveryMode === "DELIVERY_LOCAL") {
    if (cardStatus === "new") {
      return (
        <button
          onClick={onSendCode}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Отправить код подтверждения
        </button>
      );
    } else if (cardStatus === "code_sent" && showCodeInput) {
      return (
        <form onSubmit={onCompleteOrder} className="w-full space-y-2">
          <input
            type="text"
            value={securityCode}
            onChange={(e) => onSecurityCodeChange(e.target.value)}
            placeholder="Введите код подтверждения"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Подтвердить доставку
          </button>
        </form>
      );
    }
  }

  // Для остальных заказов – кнопка "Отметить, что заказ собран"
  if (
    !attributes.preOrder &&
    cardStatus !== "assembled" &&
    cardStatus !== "completed" &&
    attributes.deliveryMode !== "DELIVERY_LOCAL"
  ) {
    return (
      <button
        onClick={onMarkAssembled}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Отметить, что заказ собран
      </button>
    );
  }
  return null;
};
