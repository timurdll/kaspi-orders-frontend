import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { RootState } from "../../../redux/store";
import { KaspiOrder, OrderCustomStatus } from "../../../types/orders";
import { OrderBadge } from "./OrderBadge";
import { OrderActions } from "./OrderActions";
import { MessageSquare } from "lucide-react";
import { OrderHeader } from "./OrderHeader";
import { OrderDetails } from "./OrderDetails";
import { CommentModal } from "./CommentModal";
import { useOrderOperations } from "../../Hooks/useOrderOperations";
import { InvoiceButton } from "./InvoiceButton";
import { formatDate } from "../../../utils/format";
import {
  useGetUnreadCommentsCountQuery,
  useMarkCommentsAsReadMutation,
} from "../../../redux/api/api";

const ORDER_STATUSES: OrderCustomStatus[] = [
  "NEW",
  "ON_SHIPMENT",
  "ON_PACKAGING",
  "PACKAGED",
  "ON_DELIVERY",
  "DELIVERED",
];

const STATUS_LABELS: Record<OrderCustomStatus, string> = {
  NEW: "Новый",
  ON_SHIPMENT: "На отгрузке",
  ON_PACKAGING: "Упаковка",
  PACKAGED: "Упакован",
  ON_DELIVERY: "На доставке",
  DELIVERED: "Выдан",
};

const STATUS_COLORS: Record<OrderCustomStatus, string> = {
  NEW: "#2B7FFF",
  ON_SHIPMENT: "#FFF085",
  ON_PACKAGING: "#A3B3FF",
  PACKAGED: "#7BF1A8",
  ON_DELIVERY: "#FE9A00",
  DELIVERED: "#05DF72",
};

const CONTAINER_WIDTH = 280;
const RECT_WIDTH = 100;

interface OrderCardProps {
  order: KaspiOrder;
  storeName: string;
  isReturnedOrder?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  storeName,
  isReturnedOrder = false,
}) => {
  if (!order || !order.attributes) {
    return (
      <div className="rounded-lg border p-4 bg-red-50">
        <p className="text-red-600">Некорректные данные заказа</p>
      </div>
    );
  }

  const { attributes, products } = order;
  const kaspiOrderId = order.id;

  // Получаем статус через сокет (типизация как OrderCustomStatus)
  const socketStatusUpdate = useSelector(
    (state: RootState) => state.orders.statusUpdates[kaspiOrderId]
  ) as { status: OrderCustomStatus } | undefined;

  const {
    cardStatus: initialCardStatus,
    invoiceLink,
    securityCode,
    showCodeInput,
    error,
    isUpdating,
    isGenerating,
    isFetchingWaybill,
    setSecurityCode,
    handleMarkAssembled,
    handleUpdateStatus,
    handleSendCode,
    handleCompleteOrder,
    handleSendForTransfer,
    handleGenerateSelfDeliveryWaybill,
    handleGetKaspiWaybill,
  } = useOrderOperations(order, storeName);

  // Итоговый статус
  const cardStatus: OrderCustomStatus =
    socketStatusUpdate?.status || initialCardStatus;

  // Расчет смещения "ползунка"
  const currentIndex = ORDER_STATUSES.indexOf(cardStatus);
  const totalSteps = ORDER_STATUSES.length;
  const stepSize = (CONTAINER_WIDTH - RECT_WIDTH) / (totalSteps - 1);
  const offsetX = currentIndex >= 0 ? stepSize * currentIndex : 0;
  const backgroundColor = STATUS_COLORS[cardStatus] ?? "#999";

  // Получаем количество непрочитанных комментариев (число)
  const { data: unreadCount } = useGetUnreadCommentsCountQuery(kaspiOrderId);
  const [markCommentsAsRead] = useMarkCommentsAsReadMutation();
  console.log("unreadCount:", unreadCount);

  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);

  const handleOpenComments = () => {
    setShowCommentModal(true);
  };

  const handleCloseComments = async () => {
    try {
      await markCommentsAsRead(kaspiOrderId).unwrap();
    } catch (error) {
      console.error("Ошибка при отметке комментариев как прочитанных:", error);
    }
    setShowCommentModal(false);
  };

  const showInvoiceButton =
    ORDER_STATUSES.indexOf(cardStatus) >=
    ORDER_STATUSES.indexOf("ON_PACKAGING");

  return (
    <div className="mb-6 w-full max-w-md">
      {/* Статус "ползунок" с Framer Motion */}
      <div
        className="relative"
        style={{
          width: CONTAINER_WIDTH,
          height: 40,
          background: "transparent",
        }}
      >
        <motion.div
          className="absolute h-10 flex items-center justify-center text-white font-semibold"
          style={{ width: RECT_WIDTH }}
          animate={{
            x: offsetX,
            backgroundColor: backgroundColor,
          }}
          transition={{
            type: "spring",
            duration: 0.5,
          }}
        >
          {STATUS_LABELS[cardStatus] ?? "Неизвестен"}
        </motion.div>
      </div>

      <div className="border border-gray-100 p-4 shadow-md relative transition-colors duration-300">
        {error && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          <OrderBadge
            isReturnedOrder={isReturnedOrder}
            isKaspiDelivery={attributes.isKaspiDelivery}
            kaspiDelivery={attributes.kaspiDelivery}
            deliveryMode={attributes.deliveryMode}
            state={attributes.state}
          />
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

        <div className="mt-4 flex items-center gap-4">
          {showInvoiceButton && (
            <InvoiceButton
              attributes={attributes}
              invoiceLink={invoiceLink}
              isWaybillFetching={isFetchingWaybill}
              isGenerating={isGenerating}
              isUpdating={isUpdating}
              onGenerateSelfDeliveryWaybill={handleGenerateSelfDeliveryWaybill}
              // onGetKaspiWaybill={handleGetKaspiWaybill}
            />
          )}

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
            // Передаем оба метода: для обновления статуса и для генерации накладной
            onUpdateStatus={handleUpdateStatus}
            onGetKaspiWaybill={handleGetKaspiWaybill}
            isWaybillFetching={isFetchingWaybill}
          />

          {/* Кнопка комментариев с бейджем непрочитанных */}
          <button
            onClick={handleOpenComments}
            className="relative flex items-center justify-center min-w-10 h-10 bg-gray-300 hover:bg-gray-400 transition-colors duration-200"
            title="Комментарии"
          >
            <MessageSquare size={16} className="text-white" />
            {unreadCount !== undefined && unreadCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold min-w-[20px] min-h-[20px] flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <p className="text-xs text-center mt-4">
          {formatDate(attributes.creationDate)}
        </p>

        {showCommentModal && (
          <CommentModal orderId={kaspiOrderId} onClose={handleCloseComments} />
        )}
      </div>
    </div>
  );
};
