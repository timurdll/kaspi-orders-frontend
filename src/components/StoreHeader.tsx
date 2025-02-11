// src/components/StoreHeader.tsx
import React from "react";

interface StoreHeaderProps {
  storeName: string;
  ordersCount: number;
  children?: React.ReactNode;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  storeName,
  ordersCount,
  children,
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">{storeName}</h2>
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
            {ordersCount}
          </div>
        </div>
        {/* Если нужно, сюда можно передать переключатель вкладок */}
        {children}
      </div>
    </div>
  );
};
