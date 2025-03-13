// src/components/Header.tsx
import React from "react";
import { BurgerMenuTabs } from "./UI/Tabs/BurgerMenuTabs";
import Logo from "../assets/logo-white.svg";
import { OrdersTypeTabs, TabType } from "./UI/Tabs/OrdersTypeTabs";

interface HeaderProps {
  onAddStore: () => void;
  onLogout: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    current?: { todayCount: number; totalCount: number } | null;
    archive?: { totalCount: number } | null;
    preOrders?: { totalCount: number } | null;
    returned?: { totalCount: number } | null;
  };
}

export const Header: React.FC<HeaderProps> = ({
  onAddStore,
  onLogout,
  activeTab,
  onTabChange,
  counts,
}) => {
  return (
    <header className="bg-black w-full border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between py-4 px-4">
        {/* Логотип */}
        <div className="flex-shrink-0 flex items-center">
          <img src={Logo} alt="App Logo" className="h-8" />
        </div>

        {/* Вкладки заказов (видны на экранах md и выше) */}
        <div className="hidden md:flex items-center">
          <OrdersTypeTabs
            activeTab={activeTab}
            onTabChange={onTabChange}
            counts={counts}
          />
        </div>

        {/* Бургер-меню (видно на экранах меньше md) */}
        <div className="flex items-center">
          <BurgerMenuTabs
            activeTab={activeTab}
            onTabChange={onTabChange}
            counts={counts}
            onAddStore={onAddStore}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
};
