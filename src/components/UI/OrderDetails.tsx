// src/components/OrderDetails.tsx
import React from "react";
import { CopyButton } from "./CopyButton";

interface OrderDetailsProps {
  customer: {
    firstName: string;
    lastName: string;
    cellPhone: string;
  };
  deliveryAddress?: {
    formattedAddress: string;
  };
  products: {
    name: string;
    quantity: number;
  }[];
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  customer,
  deliveryAddress,
  products,
}) => {
  const clientFullName = `${customer.firstName} ${customer.lastName}`;
  return (
    <div>
      <div className="mb-2 space-y-1">
        <p className="text-sm text-gray-600">
          {clientFullName}
          <CopyButton text={clientFullName} />
        </p>
        <p className="text-sm text-gray-600">
          {customer.cellPhone}
          <CopyButton text={customer.cellPhone} />
        </p>
        {deliveryAddress?.formattedAddress && (
          <p className="text-sm text-gray-600">
            {deliveryAddress.formattedAddress}
            <CopyButton text={deliveryAddress.formattedAddress} />
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
    </div>
  );
};
