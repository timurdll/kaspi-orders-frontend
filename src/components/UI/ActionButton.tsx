import { KaspiOrder } from "../../types/orders";

interface ActionButtonProps {
  attributes: KaspiOrder["attributes"];
  cardStatus: string;
  showCodeInput: boolean;
  securityCode: string;
  onSendCode: (e: React.MouseEvent) => Promise<void>;
  onCompleteOrder: (e: React.FormEvent) => Promise<void>;
  onSendForTransfer: (e: React.MouseEvent) => Promise<void>;
  onMarkAssembled: (e: React.MouseEvent) => void;
  setSecurityCode: (code: string) => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  attributes,
  cardStatus,
  showCodeInput,
  securityCode,
  onSendCode,
  onCompleteOrder,
  onSendForTransfer,
  onMarkAssembled,
  setSecurityCode,
}) => {
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
    }

    if (cardStatus === "code_sent" && showCodeInput) {
      return (
        <form onSubmit={onCompleteOrder} className="w-full space-y-2">
          <input
            type="text"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
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
