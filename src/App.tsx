import { useState } from "react";
import {
  useGetOrdersQuery,
  useGetArchiveOrdersQuery,
  useGetPreOrdersQuery,
} from "./redux/api";
import { TotalStats } from "./components/TotalStats";
import { StoreOrders } from "./components/StoreOrders";
import { LoginPage } from "./components/LoginPage";
import { AddStoreModal } from "./components/AddStoreModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./redux/store";
import { logout } from "./redux/authSlice";
import { CopyNotificationProvider } from "./components/GlobalCopyNotification";

type TabType = "current" | "archive" | "pre-orders";

function App() {
  const [tab, setTab] = useState<TabType>("current");
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const dispatch = useDispatch();

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

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Определяем общее данные для активной вкладки (если нужно использовать data.stores ниже)
  const data =
    tab === "current"
      ? currentOrders
      : tab === "archive"
      ? archiveOrders
      : preOrders;
  const error =
    tab === "current"
      ? currentError
      : tab === "archive"
      ? archiveError
      : preOrdersError;
  const isLoading =
    tab === "current"
      ? currentLoading
      : tab === "archive"
      ? archiveLoading
      : preOrdersLoading;

  const handleLogout = () => {
    dispatch(logout());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <h1 className="text-lg font-semibold mb-2">Ошибка</h1>
          <p>Не удалось загрузить данные о заказах</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Пороговое время для разделения заказов "на доставку сегодня" и "на доставку завтра"
  // Здесь считается, что заказы с creationDate меньше, чем сегодня 13:00 – доставляют сегодня
  const now = new Date();
  const cutoff = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    13,
    0,
    0,
    0
  );
  const cutoffTime = cutoff.getTime();

  // Функция агрегации заказов для всех магазинов
  const aggregateCounts = (ordersData: any) => {
    let todayCount = 0;
    let tomorrowCount = 0;
    let totalCount = 0;

    ordersData.stores?.forEach((store: any) => {
      if (store.orders) {
        // Заказы, созданные до 13:00 – для доставки сегодня
        const todayOrders = store.orders.filter(
          (order: any) => order.attributes.creationDate < cutoffTime
        );
        // Заказы, созданные после или равные 13:00 – для доставки завтра
        const tomorrowOrders = store.orders.filter(
          (order: any) => order.attributes.creationDate >= cutoffTime
        );
        todayCount += todayOrders.length;
        tomorrowCount += tomorrowOrders.length;
        totalCount += store.orders.length;
      }
    });
    return { todayCount, tomorrowCount, totalCount };
  };

  // Вычисляем агрегированные данные для каждой вкладки (если они доступны)
  const currentCounts = currentOrders ? aggregateCounts(currentOrders) : null;
  const archiveCounts = archiveOrders ? aggregateCounts(archiveOrders) : null;
  const preOrdersCounts = preOrders ? aggregateCounts(preOrders) : null;

  return (
    <CopyNotificationProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Заказы Kaspi</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsAddStoreModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Добавить магазин
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          {/* Текущие заказы: показываем два кружка – для доставки сегодня и завтра */}
          <button
            className={`relative px-4 py-2 rounded-md ${
              tab === "current" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("current")}
          >
            Текущие заказы
            {currentCounts && (
              <>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {currentCounts.todayCount}
                </span>
                <span className="absolute -top-2 right-6 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {currentCounts.tomorrowCount}
                </span>
              </>
            )}
          </button>

          {/* Предзаказы: показываем общее количество */}
          <button
            className={`relative px-4 py-2 rounded-md ${
              tab === "pre-orders" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("pre-orders")}
          >
            Предзаказы
            {preOrdersCounts && (
              <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {preOrdersCounts.totalCount}
              </span>
            )}
          </button>

          {/* Архивные заказы: показываем общее количество */}
          <button
            className={`relative px-4 py-2 rounded-md ${
              tab === "archive" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("archive")}
          >
            Архивные заказы
            {archiveCounts && (
              <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {archiveCounts.totalCount}
              </span>
            )}
          </button>
        </div>

        {/* Отображение списка заказов по магазинам */}
        <div className="space-y-6">
          {data.stores.map((store: any) => (
            <StoreOrders key={store.storeName} store={store} />
          ))}
        </div>

        <AddStoreModal
          isOpen={isAddStoreModalOpen}
          onClose={() => setIsAddStoreModalOpen(false)}
        />
      </div>
    </CopyNotificationProvider>
  );
}

export default App;
