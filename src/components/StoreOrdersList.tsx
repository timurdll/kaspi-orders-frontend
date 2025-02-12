import React, { useState } from "react";
import { StoreOrders } from "./StoreOrders";
import { StoreTabs } from "./StoreTabs";

interface StoreOrdersListProps {
  stores: any[];
  type: "current" | "archive" | "pre-orders" | "returned";
}

export const StoreOrdersList: React.FC<StoreOrdersListProps> = ({
  stores,
  type,
}) => {
  const [activeStore, setActiveStore] = useState<string | null>(
    stores.length > 0 ? stores[0].storeName : null
  );

  const activeStoreData = stores.find(
    (store) => store.storeName === activeStore
  );

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
