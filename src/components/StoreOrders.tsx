import React, { useState } from "react";
import { Store } from "../types/orders";
import { OrderCard } from "./OrderCard";
import { useDeleteStoreMutation } from "../redux/api";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { Trash2 } from "lucide-react";

interface StoreOrdersProps {
  store: Store;
}

export const StoreOrders: React.FC<StoreOrdersProps> = ({ store }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();
  console.log(store);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStore(store.id).unwrap();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete store:", error);
      // Здесь можно добавить обработку ошибки, например показать уведомление
    }
  };

  if (store.error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-red-800">
            {store.storeName}
          </h2>
          <button
            onClick={handleDeleteClick}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Удалить магазин"
          >
            <Trash2 size={20} />
          </button>
        </div>
        <p className="text-red-600">{store.error}</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{store.storeName}</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {store.orders?.length || 0} заказов
          </span>
          <button
            onClick={handleDeleteClick}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Удалить магазин"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {store.orders?.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        storeName={store.storeName}
        isDeleting={isDeleting}
      />
    </div>
  );
};
