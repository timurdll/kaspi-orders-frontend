// src/components/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import {
  useAdminCreateUserMutation,
  useAdminGetUsersQuery,
  useAdminUpdateAllowedStatusesMutation,
  useAdminUpdateAllowedCitiesMutation,
} from "../../redux/api/api";

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
  { code: "SHY", label: "Шымкент" },
];

export const AdminDashboard: React.FC = () => {
  // Хуки для создания пользователя
  const [createUser, { isLoading: isCreating }] = useAdminCreateUserMutation();
  // Хук для обновления разрешённых статусов
  const [updateStatuses, { isLoading: isUpdatingStatuses }] =
    useAdminUpdateAllowedStatusesMutation();
  // Хук для обновления разрешённых городов
  const [updateCities, { isLoading: isUpdatingCities }] =
    useAdminUpdateAllowedCitiesMutation();
  // Хук для получения списка пользователей
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useAdminGetUsersQuery();

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

  // Состояния для формы обновления разрешённых статусов
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserAllowedStatuses, setSelectedUserAllowedStatuses] =
    useState<string[]>([]);

  // Состояния для формы обновления разрешённых городов
  const [selectedUserAllowedCities, setSelectedUserAllowedCities] = useState<
    string[]
  >([]);

  // При выборе пользователя из списка подгружаем его текущие разрешения и города
  useEffect(() => {
    if (usersData && selectedUserId) {
      const user = usersData.find((u) => u.id === selectedUserId);
      if (user) {
        setSelectedUserAllowedStatuses(user.allowedStatuses);
        setSelectedUserAllowedCities(user.allowedCities || []);
      }
    }
  }, [usersData, selectedUserId]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        username,
        name,
        password,
        allowedStatuses: selectedStatusesForNewUser,
        allowedCities: selectedCitiesForNewUser, // передаём выбранные города
      }).unwrap();
      setUsername("");
      setName("");
      setPassword("");
      setSelectedStatusesForNewUser([]);
      setSelectedCitiesForNewUser([]);
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

  const handleUpdateCities = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCities({
        userId: selectedUserId,
        allowedCities: selectedUserAllowedCities,
      }).unwrap();
      alert("Разрешённые города успешно обновлены");
    } catch (error) {
      console.error("Ошибка при обновлении городов:", error);
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

  // Переключение галочки для статуса при обновлении разрешений
  const toggleStatusForUpdate = (statusCode: string) => {
    setSelectedUserAllowedStatuses((prev) =>
      prev.includes(statusCode)
        ? prev.filter((s) => s !== statusCode)
        : [...prev, statusCode]
    );
  };

  // Переключение галочки для города при обновлении разрешённых городов
  const toggleCityForUpdate = (cityCode: string) => {
    setSelectedUserAllowedCities((prev) =>
      prev.includes(cityCode)
        ? prev.filter((c) => c !== cityCode)
        : [...prev, cityCode]
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
                {usersData?.map((user) => (
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

                {/* Форма обновления разрешённых городов */}
                <form onSubmit={handleUpdateCities} className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium">
                      Разрешённые города
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {AVAILABLE_CITIES.map((city) => (
                        <label
                          key={city.code}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserAllowedCities.includes(
                              city.code
                            )}
                            onChange={() => toggleCityForUpdate(city.code)}
                          />
                          <span className="text-sm">{city.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                    disabled={isUpdatingCities}
                  >
                    {isUpdatingCities ? "Обновление..." : "Обновить города"}
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
