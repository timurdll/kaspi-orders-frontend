// src/components/Header.tsx
import React from "react";
import { BurgerMenuTabs, TabType } from "./UI/Tabs/BurgerMenuTabs";

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
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Заказы Kaspi</h1>
      {/* Бургер-меню отображается всегда */}
      <BurgerMenuTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        counts={counts}
        onAddStore={onAddStore}
        onLogout={onLogout}
      />
    </div>
  );
};
