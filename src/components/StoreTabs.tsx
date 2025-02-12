import React from "react";

interface StoreTabsProps {
  stores: any[];
  activeStore: string | null;
  onStoreChange: (storeName: string) => void;
}

export const StoreTabs: React.FC<StoreTabsProps> = ({
  stores,
  activeStore,
  onStoreChange,
}) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
      {stores.map((store) => (
        <button
          key={store.storeName}
          onClick={() => onStoreChange(store.storeName)}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeStore === store.storeName
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {store.storeName}
          <span className="ml-2 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-full">
            {store.orders?.length || 0}
          </span>
        </button>
      ))}
    </div>
  );
};
