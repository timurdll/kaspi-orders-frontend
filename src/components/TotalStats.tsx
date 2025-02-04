import React from "react";
import { formatPrice } from "../utils/format";

interface TotalStatsProps {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
}

export const TotalStats: React.FC<TotalStatsProps> = ({
  totalOrders,
  totalRevenue,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Общая статистика</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Всего заказов</p>
          <p className="text-2xl font-semibold">{totalOrders}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Общая сумма</p>
          <p className="text-2xl font-semibold">{formatPrice(totalRevenue)}</p>
        </div>
      </div>
    </div>
  );
};
