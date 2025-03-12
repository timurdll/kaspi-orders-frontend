// src/components/OrderDetails.tsx
import React from "react";
import { useCopyNotification } from "../GlobalCopyNotification";
import { KaspiAddress } from "../../../types/orders";

interface OrderDetailsProps {
  customer: {
    firstName: string;
    lastName: string;
    cellPhone: string;
  };
  deliveryAddress?: KaspiAddress;
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
  const showNotification = useCopyNotification();
  // console.log(deliveryAddress);

  const handleCopy = async (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        showNotification("Скопировано!");
      } catch (err) {
        console.error("Ошибка копирования через Clipboard API:", err);
      }
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        if (successful) {
          showNotification("Скопировано!");
        } else {
          console.error("Fallback копирование не удалось");
        }
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("Ошибка копирования (fallback):", err);
      }
    }
  };

  const clientFullName = `${customer.firstName} ${customer.lastName}`;
  // console.log(deliveryAddress);

  return (
    <div className="divide-y divide-gray-300 text-gray-600">
      {/* Информация о клиенте */}
      <div
        className="py-2 cursor-pointer"
        onClick={() => handleCopy(clientFullName)}
      >
        <span className="text-sm">{clientFullName}</span>
      </div>
      <div
        className="py-2 cursor-pointer"
        onClick={() => handleCopy(customer.cellPhone)}
      >
        <span className="text-sm">{customer.cellPhone}</span>
      </div>
      {deliveryAddress?.formattedAddress && (
        <div
          className="py-2 cursor-pointer"
          onClick={() => handleCopy(deliveryAddress.formattedAddress)}
        >
          <span className="text-sm">{deliveryAddress.formattedAddress}</span>
        </div>
      )}

      {/* Список товаров */}
      <div className="py-2">
        <ul className="divide-y divide-gray-300">
          {products.map((product, index) => (
            <li
              key={index}
              className="py-2 cursor-pointer flex justify-between items-center text-sm"
              onClick={() =>
                handleCopy(`${product.name} (x${product.quantity})`)
              }
            >
              <span>
                {product.name} (x{product.quantity})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
