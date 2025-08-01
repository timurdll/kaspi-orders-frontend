// import React, { useState } from "react";
import { KaspiOrderAttributes, OrderCustomStatus } from "../../../types/orders";
import { StatusButton } from "./StatusButton";

interface OrderActionsProps {
  attributes: KaspiOrderAttributes;
  cardStatus: OrderCustomStatus;
  showCodeInput: boolean;
  securityCode: string;
  isWaybillFetching: boolean;
  onUpdateStatus: (newStatus: OrderCustomStatus) => void;
  onSendCode: (e: React.MouseEvent) => void;
  onCompleteOrder: (e: React.FormEvent) => void;
  onMarkAssembled: (e: React.MouseEvent) => void;
  onSendForTransfer: (e: React.MouseEvent) => Promise<void>;
  onSecurityCodeChange: (value: string) => void;
  onGetKaspiWaybill: (e: React.MouseEvent) => void;
}

export const OrderActions: React.FC<OrderActionsProps> = ({
  attributes,
  cardStatus,
  showCodeInput,
  securityCode,
  isWaybillFetching,
  onMarkAssembled,
  onUpdateStatus,
  onSendCode,
  onCompleteOrder,
  onSendForTransfer,
  onSecurityCodeChange,
  onGetKaspiWaybill,
}) => {
  // const [transferSent, setTransferSent] = useState(false);

  if (cardStatus === "NEW") {
    return (
      <StatusButton requiredStatus="ON_SHIPMENT" onClick={onMarkAssembled}>
        Согласован
      </StatusButton>
    );
  }

  if (cardStatus === "ON_SHIPMENT") {
    return (
      <StatusButton
        requiredStatus="ON_PACKAGING"
        onClick={(e) => {
          if (attributes.isKaspiDelivery) {
            onGetKaspiWaybill(e);
          } else {
            onUpdateStatus("ON_PACKAGING");
          }
        }}
      >
        {isWaybillFetching ? "Переводится на упаковку..." : "Отгрузил"}
      </StatusButton>
    );
  }

  if (cardStatus === "ON_PACKAGING") {
    return (
      <StatusButton
        requiredStatus="PACKAGED"
        onClick={() => onUpdateStatus("PACKAGED")}
      >
        Упаковал
      </StatusButton>
    );
  }

  if (cardStatus === "PACKAGED") {
    if (attributes.isKaspiDelivery && attributes.kaspiDelivery?.express) {
      if (!attributes.assembled) {
        return (
          <StatusButton
            requiredStatus="ON_DELIVERY"
            onClick={async (e) => {
              await onSendForTransfer(e);
              // setTransferSent(true);
            }}
          >
            На передачу
          </StatusButton>
        );
      } else {
        return (
          <div className="w-full flex items-center justify-center px-4 py-2 bg-green-400 text-white">
            На передаче
          </div>
        );
      }
    }
    if (
      (attributes.deliveryMode === "DELIVERY_LOCAL" ||
        attributes.deliveryMode === "DELIVERY_PICKUP") &&
      attributes.isKaspiDelivery === false
    ) {
      if (!showCodeInput) {
        return (
          <StatusButton requiredStatus="ON_DELIVERY" onClick={onSendCode}>
            Отправить код
          </StatusButton>
        );
      } else {
        return (
          <form onSubmit={onCompleteOrder} className="w-full space-y-2">
            <input
              type="text"
              value={securityCode}
              onChange={(e) => onSecurityCodeChange(e.target.value)}
              placeholder="Введите код подтверждения"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <StatusButton requiredStatus="ON_DELIVERY" onClick={() => {}}>
              Подтвердить доставку
            </StatusButton>
          </form>
        );
      }
    }
    return null;
  }

  return null;
};
