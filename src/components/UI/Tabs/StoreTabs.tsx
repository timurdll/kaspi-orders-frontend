import React from "react";

interface Store {
  storeName: string;
  orders?: any[];
}

interface StoreTabsProps {
  stores: Store[];
  activeStore: string | null;
  onStoreChange: (storeName: string) => void;
}

export const StoreTabs: React.FC<StoreTabsProps> = ({
  stores,
  activeStore,
  onStoreChange,
}) => {
  const isActive = (storeName: string) => activeStore === storeName;

  const getButtonClasses = (storeName: string) => {
    const active = isActive(storeName);
    return `relative inline-block flex-shrink-0 border border-[#1869FF] ${active ? "ring-2 ring-[#1869FF]" : ""}`;
  };

  const getLeftPartClasses = (storeName: string) => {
    const active = isActive(storeName);
    return `absolute inset-0 flex items-center ${active ? "bg-[#1869FF]" : "bg-white"}`;
  };

  const getRightPartClasses = (storeName: string) => {
    const active = isActive(storeName);
    return `absolute inset-0 clip-path-right flex items-center justify-end ${active ? "bg-[#0E3F99]" : "bg-[#1869FF]"}`;
  };

  const getTextClasses = (storeName: string) =>
    isActive(storeName) ? "text-white" : "text-[#1869FF]";

  return (
    <div className="flex space-x-4 overflow-x-auto">
      {stores?.map((store) => (
        <button
          key={store.storeName}
          onClick={() => onStoreChange(store.storeName)}
          className={getButtonClasses(store.storeName)}
        >
          {/* Фоновые слои с диагональным разделением */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={getLeftPartClasses(store.storeName)} />
            <div className={getRightPartClasses(store.storeName)} />
          </div>
          {/* Контент с паддингами 15px и запретом переноса текста */}
          <div className="relative z-10 flex whitespace-nowrap">
            <span
              className={`px-[15px] py-[8px] font-medium ${getTextClasses(store.storeName)}`}
            >
              {store.storeName}
            </span>
            <span className="px-[15px] py-[8px] font-bold text-white">
              {store.orders?.length || 0}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
