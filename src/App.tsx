import { useState } from "react";
import { useGetOrdersQuery, useGetArchiveOrdersQuery } from "./redux/api";
import { TotalStats } from "./components/TotalStats";
import { StoreOrders } from "./components/StoreOrders";
import { LoginPage } from "./components/LoginPage";
import { AddStoreModal } from "./components/AddStoreModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./redux/store";
import { logout } from "./redux/authSlice";
import { CopyNotificationProvider } from "./components/GlobalCopyNotification";

function App() {
  const [tab, setTab] = useState<"current" | "archive">("current");
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

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const data = tab === "current" ? currentOrders : archiveOrders;
  const error = tab === "current" ? currentError : archiveError;
  const isLoading = tab === "current" ? currentLoading : archiveLoading;

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
          <button
            className={`px-4 py-2 rounded-md ${
              tab === "current" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("current")}
          >
            Текущие заказы
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              tab === "archive" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("archive")}
          >
            Архивные заказы
          </button>
        </div>

        <TotalStats
          totalOrders={data.totalStats.totalOrders}
          totalRevenue={data.totalStats.totalRevenue}
          ordersByStatus={data.totalStats.ordersByStatus}
        />

        <div className="space-y-6">
          {data.stores.map((store) => (
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
