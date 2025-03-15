import React from "react";
import { FileText } from "lucide-react";

interface InvoiceButtonProps {
  attributes: {
    state: string;
    isKaspiDelivery: boolean;
    deliveryMode: string;
    kaspiDelivery?: {
      express?: boolean;
    };
  };
  invoiceLink: string | null;
  isGenerating: boolean;
  isUpdating: boolean;
  isWaybillFetching: boolean;
  onGenerateSelfDeliveryWaybill: (e: React.MouseEvent) => void;
  // onGetKaspiWaybill: (e: React.MouseEvent) => void;
}

export const InvoiceButton: React.FC<InvoiceButtonProps> = ({
  attributes,
  invoiceLink,
  isGenerating,
  isWaybillFetching,
  onGenerateSelfDeliveryWaybill,
  // onGetKaspiWaybill,
}) => {
  if (attributes.state === "SIGN_REQUIRED") return null;
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
        className="flex items-center justify-center min-w-10 h-10 bg-green-600 hover:bg-green-700 transition-colors duration-200"
      >
        <FileText size={16} className="text-white" />
      </a>
    ) : (
      <button
        onClick={onGenerateSelfDeliveryWaybill}
        disabled={isGenerating}
        className="flex items-center justify-center min-w-10 h-10 bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
      >
        {isGenerating ? (
          <span className="loader w-4 h-4 border-2 border-t-transparent" />
        ) : (
          <FileText size={16} className="text-white" />
        )}
      </button>
    );
  }
  if (attributes.isKaspiDelivery === true) {
    if (attributes.kaspiDelivery?.express === true) {
      return invoiceLink ? (
        <a
          href={invoiceLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center min-w-10 h-10 bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <FileText size={16} className="text-white" />
        </a>
      ) : (
        <button
          // onClick={onGetKaspiWaybill}
          // disabled={isUpdating}
          className="flex items-center justify-center min-w-10 h-10 bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
        >
          {isWaybillFetching ? (
            <span className="loader w-6 h-6 border-2 border-t-transparent" />
          ) : (
            <FileText size={16} className="text-white" />
          )}
        </button>
      );
    } else {
      return invoiceLink ? (
        <a
          href={invoiceLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center min-w-10 h-10 bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <FileText size={16} className="text-white" />
        </a>
      ) : (
        <button
          // onClick={onGetKaspiWaybill}
          // disabled={isWaybillFetching}
          className="flex items-center justify-center min-w-10 h-10 bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
        >
          {isWaybillFetching ? (
            <button
              disabled
              className="flex items-center justify-center min-w-10 h-10 bg-indigo-600 transition-colors duration-200 disabled:opacity-50"
            >
              <span className="loader w-4 h-4 border-2 border-t-transparent" />
            </button>
          ) : (
            <FileText size={16} className="text-white" />
          )}
        </button>
      );
    }
  }
  return null;
};
