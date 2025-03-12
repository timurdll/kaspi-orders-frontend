// src/components/StoreHeader.tsx
import React from "react";

interface StoreHeaderProps {
  children?: React.ReactNode;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ children }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0">
        {children}
      </div>
    </div>
  );
};
