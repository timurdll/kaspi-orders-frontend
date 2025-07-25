// src/components/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import {
  useAdminCreateUserMutation,
  useAdminGetUsersQuery,
  useAdminUpdateAllowedStatusesMutation,
  useAdminUpdateAllowedStoresMutation,
  useAdminGetUserStoresQuery,
} from "../../redux/api/api";
import { useGetStoresQuery } from "../../redux/api/api";

// Допустимые статусы с их кодами и переводами
const PERMITTED_STATUSES = [
  { code: "ON_SHIPMENT", label: "На отгрузке" },
  { code: "ON_PACKAGING", label: "На упаковке" },
  { code: "PACKAGED", label: "Упакован" },
  { code: "ON_DELIVERY", label: "На доставке" },
];

// Допустимые города (пример, можно подставить реальные значения)
const AVAILABLE_CITIES = [
  { code: "ALA", label: "Алматы" },
  { code: "AST", label: "Астана" },
  // { code: "SHY", label: "Шымкент" },
];

export const AdminDashboard: React.FC = () => {
  // Состояния для формы обновления разрешённых статусов
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserAllowedStatuses, setSelectedUserAllowedStatuses] =
    useState<string[]>([]);
  const [selectedUserAllowedStores, setSelectedUserAllowedStores] = useState<
    string[]
  >([]);

  // Состояния для формы создания пользователя
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [selectedStatusesForNewUser, setSelectedStatusesForNewUser] = useState<
    string[]
  >([]);
  const [selectedCitiesForNewUser, setSelectedCitiesForNewUser] = useState<
    string[]
  >([]);
  const [selectedStoresForNewUser, setSelectedStoresForNewUser] = useState<
    string[]
  >([]);

  // Хуки для API
  const [createUser, { isLoading: isCreating }] = useAdminCreateUserMutation();
  const [updateStatuses, { isLoading: isUpdatingStatuses }] =
    useAdminUpdateAllowedStatusesMutation();
  const [updateAllowedStores, { isLoading: isUpdatingStores }] =
    useAdminUpdateAllowedStoresMutation();
  const { data: usersData, isLoading: isLoadingUsers } =
    useAdminGetUsersQuery();
  const { data: storesData = [], isLoading: isLoadingStores } =
    useGetStoresQuery();
  const { data: userStoresData = [] } = useAdminGetUserStoresQuery(
    selectedUserId,
    { skip: !selectedUserId }
  );

  // При выборе пользователя из списка подгружаем его текущие разрешения
  useEffect(() => {
    if (usersData && selectedUserId) {
      const user = usersData.find((u: any) => u.id === selectedUserId);
      if (user) {
        setSelectedUserAllowedStatuses(user.allowedStatuses || []);
        // Убираем обращение к allowedStores так как его нет в типе User
        // setSelectedUserAllowedStores(
        //   user.allowedStores?.map((s: any) => s.id) || []
        // );
      }
    }
  }, [usersData, selectedUserId]);

  useEffect(() => {
    if (userStoresData && selectedUserId) {
      setSelectedUserAllowedStores(userStoresData.map((s: any) => s.id));
    }
  }, [userStoresData, selectedUserId]);

  // Создание пользователя
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        username,
        name,
        password,
        allowedStatuses: selectedStatusesForNewUser,
        allowedCities: selectedCitiesForNewUser,
        // Убираем allowedStores из создания пользователя, так как его нет в AdminCreateUserDto
        // allowedStores: selectedStoresForNewUser,
      }).unwrap();
      setUsername("");
      setName("");
      setPassword("");
      setSelectedStatusesForNewUser([]);
      setSelectedCitiesForNewUser([]);
      setSelectedStoresForNewUser([]);
      alert("Пользователь успешно создан");
    } catch (error) {
      console.error("Ошибка при создании пользователя:", error);
    }
  };

  const handleUpdateStatuses = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStatuses({
        userId: selectedUserId,
        allowedStatuses: selectedUserAllowedStatuses,
      }).unwrap();
      alert("Разрешения пользователя успешно обновлены");
    } catch (error) {
      console.error("Ошибка при обновлении разрешений:", error);
    }
  };

  const handleUpdateStores = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAllowedStores({
        userId: selectedUserId,
        storeIds: selectedUserAllowedStores,
      }).unwrap();
      alert("Доступные магазины успешно обновлены");
    } catch (error) {
      console.error("Ошибка при обновлении магазинов:", error);
    }
  };

  // Переключение галочки для статуса при создании пользователя
  const toggleStatusForNewUser = (statusCode: string) => {
    setSelectedStatusesForNewUser((prev) =>
      prev.includes(statusCode)
        ? prev.filter((s) => s !== statusCode)
        : [...prev, statusCode]
    );
  };

  // Переключение галочки для города при создании пользователя
  const toggleCityForNewUser = (cityCode: string) => {
    setSelectedCitiesForNewUser((prev) =>
      prev.includes(cityCode)
        ? prev.filter((c) => c !== cityCode)
        : [...prev, cityCode]
    );
  };

  // Переключение галочки для магазина при создании пользователя
  const toggleStoreForNewUser = (storeId: string) => {
    setSelectedStoresForNewUser((prev) =>
      prev.includes(storeId)
        ? prev.filter((s) => s !== storeId)
        : [...prev, storeId]
    );
  };

  // Переключение галочки для статуса при обновлении разрешений
  const toggleStatusForUpdate = (statusCode: string) => {
    setSelectedUserAllowedStatuses((prev) =>
      prev.includes(statusCode)
        ? prev.filter((s) => s !== statusCode)
        : [...prev, statusCode]
    );
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>

      {/* Секция создания пользователя */}
      <section className="mb-10 border p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Создать пользователя</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Логин</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div>
            <p className="block text-sm font-medium mb-1">
              Разрешённые статусы
            </p>
            <div className="flex flex-wrap gap-4">
              {PERMITTED_STATUSES.map((status) => (
                <label
                  key={status.code}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStatusesForNewUser.includes(status.code)}
                    onChange={() => toggleStatusForNewUser(status.code)}
                  />
                  <span className="text-sm">{status.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="block text-sm font-medium mb-1">Разрешённые города</p>
            <div className="flex flex-wrap gap-4">
              {AVAILABLE_CITIES.map((city) => (
                <label
                  key={city.code}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCitiesForNewUser.includes(city.code)}
                    onChange={() => toggleCityForNewUser(city.code)}
                  />
                  <span className="text-sm">{city.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="block text-sm font-medium mb-1">Магазины</p>
            <div className="flex flex-wrap gap-4">
              {storesData?.map((store: any) => (
                <label
                  key={store.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStoresForNewUser.includes(store.id)}
                    onChange={() => toggleStoreForNewUser(store.id)}
                  />
                  <span className="text-sm">{store.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={isCreating}
          >
            {isCreating ? "Создаётся..." : "Создать пользователя"}
          </button>
        </form>
      </section>

      {/* Секция обновления разрешений пользователя */}
      <section className="mb-10 border p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">
          Обновить разрешения пользователя
        </h2>
        {isLoadingUsers ? (
          <p>Загрузка пользователей...</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Выберите пользователя
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="">-- Выберите пользователя --</option>
                {usersData?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.name})
                  </option>
                ))}
              </select>
            </div>
            {selectedUserId && (
              <>
                {/* Форма обновления статусов */}
                <form
                  onSubmit={handleUpdateStatuses}
                  className="space-y-4 mb-6"
                >
                  <div>
                    <p className="mb-2 text-sm font-medium">
                      Разрешённые статусы
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {PERMITTED_STATUSES.map((status) => (
                        <label
                          key={status.code}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserAllowedStatuses.includes(
                              status.code
                            )}
                            onChange={() => toggleStatusForUpdate(status.code)}
                          />
                          <span className="text-sm">{status.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    disabled={isUpdatingStatuses}
                  >
                    {isUpdatingStatuses ? "Обновление..." : "Обновить статусы"}
                  </button>
                </form>

                {/* Форма обновления разрешённых магазинов */}
                <form onSubmit={handleUpdateStores} className="space-y-4 mb-6">
                  <div>
                    <p className="mb-2 text-sm font-medium">
                      Доступные магазины
                    </p>
                    {isLoadingStores ? (
                      <p>Загрузка магазинов...</p>
                    ) : (
                      <div className="flex flex-wrap gap-4">
                        {storesData.map((store: any) => (
                          <label
                            key={store.id}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUserAllowedStores.includes(
                                store.id
                              )}
                              onChange={() => {
                                setSelectedUserAllowedStores((prev) =>
                                  prev.includes(store.id)
                                    ? prev.filter((id) => id !== store.id)
                                    : [...prev, store.id]
                                );
                              }}
                            />
                            <span className="text-sm">{store.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                    disabled={isUpdatingStores}
                  >
                    {isUpdatingStores ? "Обновление..." : "Обновить магазины"}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
};
