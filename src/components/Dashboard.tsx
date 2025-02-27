import React, { useState } from "react";
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
import { OrdersTypeTabs, TabType } from "./UI/Tabs/OrdersTypeTabs";
import { StoreOrdersList } from "./StoreOrdersList";
import { Loader } from "./UI/Loader";
import { CopyNotificationProvider } from "./UI/GlobalCopyNotification";
import { LoginPage } from "./LoginPage";
import { ErrorBoundary } from "./UI/Errors/ErrorBoundary";
import { AddStoreModal } from "./UI/Modals/AddStoreModal";
import { useCachedData } from "./Hooks/useCachedData";

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

  ordersData?.stores?.forEach((store: any) => {
    if (store?.orders) {
      store.orders.forEach((order: any) => {
        if (!order || !order.attributes) return;
        totalCount++;
        const orderTime = order.attributes.creationDate;
        if (order.attributes.isKaspiDelivery) {
          if (order.attributes.kaspiDelivery?.express) {
            todayCount++;
          } else if (orderTime < cutoffTime) {
            todayCount++;
          }
        } else {
          todayCount++;
        }
      });
    }
  });
  return { todayCount, tomorrowCount: totalCount - todayCount, totalCount };
};

const getSafeStores = (data: any) => {
  if (!data?.stores) return [];
  return data.stores.map((store: any) => ({
    ...store,
    orders: store.orders || [],
    storeName: store.storeName || "Неизвестный магазин",
  }));
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
      pollingInterval: 300000,
      skip: !isAuthenticated,
    }
  );
  const { data: archiveOrders, isLoading: archiveLoading } =
    useGetArchiveOrdersQuery(undefined, {
      pollingInterval: 300000,
      skip: !isAuthenticated,
    });
  const { data: preOrders, isLoading: preOrdersLoading } = useGetPreOrdersQuery(
    undefined,
    {
      pollingInterval: 300000,
      skip: !isAuthenticated,
    }
  );
  const { data: returnedOrders, isLoading: returnedLoading } =
    useGetReturnedOrdersQuery(undefined, {
      pollingInterval: 300000,
      skip: !isAuthenticated,
    });

  // console.log("1:", returnedOrders);

  // Используем кастомный хук для каждого типа заказов отдельно
  const cachedCurrentOrders = useCachedData(currentOrders);
  const cachedArchiveOrders = useCachedData(archiveOrders);
  const cachedPreOrders = useCachedData(preOrders);
  const cachedReturnedOrders = useCachedData(returnedOrders);
  // console.log("2:", returnedOrders);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  let data: any,
    isLoading: boolean = false;
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

  return (
    <ErrorBoundary>
      <CopyNotificationProvider>
        <div className="container mx-auto px-4 py-8">
          <Header
            onAddStore={() => setIsAddStoreModalOpen(true)}
            onLogout={() => dispatch(logout())}
            activeTab={tab}
            onTabChange={setTab}
            counts={{
              current: currentOrders
                ? aggregateCounts(currentOrders)
                : { todayCount: 0, tomorrowCount: 0, totalCount: 0 },
              archive: archiveOrders
                ? aggregateCounts(archiveOrders)
                : { todayCount: 0, tomorrowCount: 0, totalCount: 0 },
              preOrders: preOrders
                ? aggregateCounts(preOrders)
                : { todayCount: 0, tomorrowCount: 0, totalCount: 0 },
              returned: returnedOrders
                ? aggregateCounts(returnedOrders)
                : { todayCount: 0, tomorrowCount: 0, totalCount: 0 },
            }}
          />
          <div className="hidden md:flex mb-6">
            <OrdersTypeTabs
              activeTab={tab}
              onTabChange={setTab}
              counts={{
                current: currentOrders ? aggregateCounts(currentOrders) : null,
                archive: archiveOrders ? aggregateCounts(archiveOrders) : null,
                preOrders: preOrders ? aggregateCounts(preOrders) : null,
                returned: returnedOrders
                  ? aggregateCounts(returnedOrders)
                  : null,
              }}
            />
          </div>
          {data && <StoreOrdersList stores={getSafeStores(data)} type={tab} />}
          <AddStoreModal
            isOpen={isAddStoreModalOpen}
            onClose={() => setIsAddStoreModalOpen(false)}
          />
        </div>
      </CopyNotificationProvider>
    </ErrorBoundary>
  );
};
