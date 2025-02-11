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
import { ErrorMessage } from "./ErrorMessage";
import { AddStoreModal } from "./AddStoreModal";
import { CopyNotificationProvider } from "./GlobalCopyNotification";
import { BurgerMenuTabs } from "./BurgerMenuTabs";

interface AggregatedCounts {
  todayCount: number;
  tomorrowCount: number;
  totalCount: number;
}

const aggregateCounts = (ordersData: any): AggregatedCounts => {
  const now = new Date();
  // Определяем порог 13:01 текущего дня
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

  // Проходим по всем магазинам
  ordersData.stores?.forEach((store: any) => {
    if (store.orders) {
      store.orders.forEach((order: any) => {
        totalCount++;

        // Получаем время создания заказа
        // Если creationDate приходит в секундах, используйте:
        // const orderTime = order.attributes.creationDate * 1000;
        const orderTime = order.attributes.creationDate;

        // Если заказ является KaspiDelivery, то нужно дополнительно проверять:
        if (order.attributes.isKaspiDelivery) {
          // Если заказ express — всегда в todayCount:
          if (order.attributes.kaspiDelivery.express) {
            todayCount++;
          } else {
            // Если не express, то включаем в todayCount только если создан до 13:01
            if (orderTime < cutoffTime) {
              todayCount++;
            }
          }
        } else {
          // Все остальные заказы попадают в todayCount независимо от времени
          todayCount++;
        }
      });
    }
  });

  // Если требуется, можно вычислить tomorrowCount как разницу между общим количеством и todayCount
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

  const {
    data: currentOrders,
    error: currentError,
    isLoading: currentLoading,
  } = useGetOrdersQuery(undefined, {
    pollingInterval: 60000,
    skip: !isAuthenticated,
  });

  const {
    data: archiveOrders,
    error: archiveError,
    isLoading: archiveLoading,
  } = useGetArchiveOrdersQuery(undefined, {
    pollingInterval: 60000,
    skip: !isAuthenticated,
  });

  const {
    data: preOrders,
    error: preOrdersError,
    isLoading: preOrdersLoading,
  } = useGetPreOrdersQuery(undefined, {
    pollingInterval: 60000,
    skip: !isAuthenticated,
  });

  const {
    data: returnedOrders,
    error: returnedError,
    isLoading: returnedLoading,
  } = useGetReturnedOrdersQuery(undefined, {
    pollingInterval: 60000,
    skip: !isAuthenticated,
  });

  // Кэширование данных на случай ошибки
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
    return <div>Пожалуйста, войдите в систему</div>;
  }

  let data, error, isLoading;
  if (tab === "current") {
    data = currentOrders || cachedCurrentOrders;
    error = currentError;
    isLoading = currentLoading;
  } else if (tab === "archive") {
    data = archiveOrders || cachedArchiveOrders;
    error = archiveError;
    isLoading = archiveLoading;
  } else if (tab === "pre-orders") {
    data = preOrders || cachedPreOrders;
    error = preOrdersError;
    isLoading = preOrdersLoading;
  } else if (tab === "returned") {
    data = returnedOrders || cachedReturnedOrders;
    error = returnedError;
    isLoading = returnedLoading;
  }

  if (isLoading && !data) return <Loader />;
  if (error && !data)
    return <ErrorMessage message="Не удалось загрузить данные о заказах" />;
  if (!data) return null;

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
        <Header
          onAddStore={() => setIsAddStoreModalOpen(true)}
          onLogout={handleLogout}
        />
        {/* На мобильных устройствах отображается бургер-меню с вкладками */}
        <div className="md:hidden mb-4">
          <BurgerMenuTabs
            activeTab={tab}
            onTabChange={setTab}
            counts={counts}
          />
        </div>
        {/* На десктопе можно оставить старые вкладки или скрыть бургер-меню */}
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
