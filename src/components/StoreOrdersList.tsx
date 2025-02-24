import React, { useState } from "react";
import { StoreOrders } from "./StoreOrders";
import { StoreTabs } from "./UI/Tabs/StoreTabs";

interface StoreOrdersListProps {
  stores: any[];
  type: "current" | "archive" | "pre-orders" | "returned";
}

export const StoreOrdersList: React.FC<StoreOrdersListProps> = ({
  stores = [],
  type,
}) => {
  const [activeStore, setActiveStore] = useState<string | null>(
    stores.length > 0 ? stores[0]?.storeName || null : null
  );

  const activeStoreData = stores.find(
    (store) => store?.storeName === activeStore
  );

  if (!stores.length) {
    return <div className="text-gray-500">Нет доступных магазинов</div>;
  }

  return (
    <div>
      <StoreTabs
        stores={stores}
        activeStore={activeStore}
        onStoreChange={setActiveStore}
      />
      {activeStoreData && <StoreOrders store={activeStoreData} type={type} />}
    </div>
  );
};
