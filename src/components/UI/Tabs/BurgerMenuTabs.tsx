import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabType } from "./OrdersTypeTabs";
import BurgerIcon from "../../../assets/burger.svg";
import { useOnClickOutside } from "../../Hooks/useOnClickOutside";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useMediaQuery } from "../../Hooks/useMediaQuery";

interface BurgerMenuTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    current?: { todayCount: number; totalCount: number } | null;
    archive?: { totalCount: number } | null;
    preOrders?: { totalCount: number } | null;
    returned?: { totalCount: number } | null;
  };
  onAddStore: () => void;
  onLogout: () => void;
}

export const BurgerMenuTabs: React.FC<BurgerMenuTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
  onAddStore,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSmallScreen = useMediaQuery("(max-width: 767px)");

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Закрываем меню при клике вне
  useOnClickOutside(menuRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  // Получаем данные пользователя из Redux
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "admin";
  const userName = user?.username || "Пользователь";

  const menuVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
    exit: { x: "100%" },
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="p-1 text-gray-800 focus:outline-none"
      >
        <img src={BurgerIcon} alt="Menu" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            className="fixed top-0 right-0 h-screen w-56 bg-white shadow-lg z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {/* Заголовок меню с именем пользователя и кнопкой закрытия */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold text-gray-800">{userName}</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-800 focus:outline-none"
              >
                X
              </button>
            </div>

            <div
              className="py-4 flex flex-col"
              role="menu"
              aria-orientation="vertical"
            >
              <button
                className={`w-full text-left px-4 py-2 text-sm ${
                  activeTab === "archive"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  onTabChange("archive");
                  setIsOpen(false);
                }}
              >
                Архивные заказы
                {counts.archive && (
                  <span className="ml-2 inline-block bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {counts.archive.totalCount}
                  </span>
                )}
              </button>
              {/* Отображаем вкладки заказов только если экран маленький */}
              {isSmallScreen && (
                <>
                  <button
                    className={`w-full text-left px-4 py-2 text-sm ${
                      activeTab === "current"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      onTabChange("current");
                      setIsOpen(false);
                    }}
                  >
                    Заказы
                    {counts.current && (
                      <span className="ml-2 inline-block bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {counts.current.todayCount}
                      </span>
                    )}
                  </button>

                  <button
                    className={`w-full text-left px-4 py-2 text-sm ${
                      activeTab === "pre-orders"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      onTabChange("pre-orders");
                      setIsOpen(false);
                    }}
                  >
                    Предзаказы
                    {counts.preOrders && (
                      <span className="ml-2 inline-block bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {counts.preOrders.totalCount}
                      </span>
                    )}
                  </button>

                  <button
                    className={`w-full text-left px-4 py-2 text-sm ${
                      activeTab === "archive"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      onTabChange("archive");
                      setIsOpen(false);
                    }}
                  >
                    Архивные заказы
                    {counts.archive && (
                      <span className="ml-2 inline-block bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {counts.archive.totalCount}
                      </span>
                    )}
                  </button>

                  <button
                    className={`w-full text-left px-4 py-2 text-sm ${
                      activeTab === "returned"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      onTabChange("returned");
                      setIsOpen(false);
                    }}
                  >
                    Возвраты
                    {counts.returned && (
                      <span className="ml-2 inline-block bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {counts.returned.totalCount}
                      </span>
                    )}
                  </button>

                  <hr className="my-1" />

                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      onAddStore();
                      setIsOpen(false);
                    }}
                  >
                    Добавить магазин
                  </button>
                </>
              )}

              {isAdmin && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    window.location.href = "/admin";
                    setIsOpen(false);
                  }}
                >
                  Админ панель
                </button>
              )}

              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
              >
                Выйти
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
