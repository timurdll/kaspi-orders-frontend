// src/components/Dashboard.tsx
import React, { useState, useEffect } from "react";
import {
  useGetOrdersQuery,
  useGetArchiveOrdersQuery,
  useGetPreOrdersQuery,
  useGetReturnedOrdersQuery,
} from "../redux/api";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/authSlice";
import { Header } from "./Header";
import { OrdersTypeTabs, TabType } from "./OrdersTypeTabs";
import { StoreOrdersList } from "./StoreOrdersList";
import { Loader } from "./Loader";
import { AddStoreModal } from "./AddStoreModal";
import { CopyNotificationProvider } from "./GlobalCopyNotification";
import { LoginPage } from "./LoginPage";

interface AggregatedCounts {
  todayCount: number;
  tomorrowCount: number;
  totalCount: number;
}

const aggregateCounts = (ordersData: any): AggregatedCounts => {
  const now = new Date();
  const cutoff = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    13,
    1,
    0,
    0
  );
  const cutoffTime = cutoff.getTime();

  let todayCount = 0;
  let totalCount = 0;

  ordersData.stores?.forEach((store: any) => {
    if (store.orders) {
      store.orders.forEach((order: any) => {
        totalCount++;
        const orderTime = order.attributes.creationDate;
        if (order.attributes.isKaspiDelivery) {
          if (order.attributes.kaspiDelivery.express) {
            todayCount++;
          } else {
            if (orderTime < cutoffTime) {
              todayCount++;
            }
          }
        } else {
          todayCount++;
        }
      });
    }
  });

  const tomorrowCount = totalCount - todayCount;
  return { todayCount, tomorrowCount, totalCount };
};

export const Dashboard: React.FC = () => {
  const [tab, setTab] = useState<TabType>("current");
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const { data: currentOrders, isLoading: currentLoading } = useGetOrdersQuery(
    undefined,
    {
      pollingInterval: 60000,
      skip: !isAuthenticated,
    }
  );

  const { data: archiveOrders, isLoading: archiveLoading } =
    useGetArchiveOrdersQuery(undefined, {
      pollingInterval: 60000,
      skip: !isAuthenticated,
    });

  const { data: preOrders, isLoading: preOrdersLoading } = useGetPreOrdersQuery(
    undefined,
    {
      pollingInterval: 60000,
      skip: !isAuthenticated,
    }
  );

  const { data: returnedOrders, isLoading: returnedLoading } =
    useGetReturnedOrdersQuery(undefined, {
      pollingInterval: 60000,
      skip: !isAuthenticated,
    });

  const [cachedCurrentOrders, setCachedCurrentOrders] = useState<any>(null);
  useEffect(() => {
    if (currentOrders) setCachedCurrentOrders(currentOrders);
  }, [currentOrders]);

  const [cachedArchiveOrders, setCachedArchiveOrders] = useState<any>(null);
  useEffect(() => {
    if (archiveOrders) setCachedArchiveOrders(archiveOrders);
  }, [archiveOrders]);

  const [cachedPreOrders, setCachedPreOrders] = useState<any>(null);
  useEffect(() => {
    if (preOrders) setCachedPreOrders(preOrders);
  }, [preOrders]);

  const [cachedReturnedOrders, setCachedReturnedOrders] = useState<any>(null);
  useEffect(() => {
    if (returnedOrders) setCachedReturnedOrders(returnedOrders);
  }, [returnedOrders]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  let data, isLoading;
  if (tab === "current") {
    data = currentOrders || cachedCurrentOrders;
    isLoading = currentLoading;
  } else if (tab === "archive") {
    data = archiveOrders || cachedArchiveOrders;
    isLoading = archiveLoading;
  } else if (tab === "pre-orders") {
    data = preOrders || cachedPreOrders;
    isLoading = preOrdersLoading;
  } else if (tab === "returned") {
    data = returnedOrders || cachedReturnedOrders;
    isLoading = returnedLoading;
  }

  if (isLoading && !data) return <Loader />;

  const currentCounts = currentOrders ? aggregateCounts(currentOrders) : null;
  const archiveCounts = archiveOrders ? aggregateCounts(archiveOrders) : null;
  const preOrdersCounts = preOrders ? aggregateCounts(preOrders) : null;
  const returnedCounts = returnedOrders
    ? aggregateCounts(returnedOrders)
    : null;

  const counts = {
    current: currentCounts,
    archive: archiveCounts,
    preOrders: preOrdersCounts,
    returned: returnedCounts,
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <CopyNotificationProvider>
      <div className="container mx-auto px-4 py-8">
        {/* Header включает бургер-меню (которая теперь отображается всегда) */}
        <Header
          onAddStore={() => setIsAddStoreModalOpen(true)}
          onLogout={handleLogout}
          activeTab={tab}
          onTabChange={setTab}
          counts={counts}
        />
        {/* Десктопное представление – вкладки */}
        <div className="hidden md:flex mb-6">
          <OrdersTypeTabs
            activeTab={tab}
            onTabChange={setTab}
            counts={counts}
          />
        </div>
        <StoreOrdersList stores={data.stores} type={tab} />
        <AddStoreModal
          isOpen={isAddStoreModalOpen}
          onClose={() => setIsAddStoreModalOpen(false)}
        />
      </div>
    </CopyNotificationProvider>
  );
};
