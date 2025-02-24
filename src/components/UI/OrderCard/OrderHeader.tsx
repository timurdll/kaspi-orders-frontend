// src/components/OrderHeader.tsx
import React from "react";
import { CopyButton } from "../Buttons/CopyButton";
import { formatDate } from "../../../utils/format";

interface OrderHeaderProps {
  code: string;
  creationDate: number;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
  code,
  creationDate,
}) => {
  return (
    <div className="mb-2">
      <h4 className="text-base font-semibold inline-flex items-center">
        {code}
        <CopyButton text={code} />
      </h4>
      <p className="text-xs text-gray-700">{formatDate(creationDate)}</p>
    </div>
  );
};
