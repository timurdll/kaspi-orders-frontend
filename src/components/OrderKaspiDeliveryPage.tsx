// src/components/OrderKaspiDeliveryPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetOrdersQuery,
  useSendSecurityCodeMutation,
  useCompleteOrderMutation,
} from "../redux/api";
import { Loader } from "./Loader";

export const OrderKaspiDeliveryPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  // Если orderId отсутствует, выводим сообщение об ошибке
  if (!orderId) {
    return <div>Некорректный идентификатор заказа</div>;
  }

  const navigate = useNavigate();

  // Получаем все текущие заказы (предполагаем, что заказы "Своя доставка" находятся среди текущих)
  const { data: ordersData, isLoading } = useGetOrdersQuery(undefined, {
    pollingInterval: 60000,
  });
  const [sendSecurityCode] = useSendSecurityCodeMutation();
  const [completeOrder] = useCompleteOrderMutation();

  const [securityCode, setSecurityCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  if (isLoading) {
    return <Loader />;
  }
  if (!ordersData) {
    return <div>Нет данных о заказах</div>;
  }

  // Ищем заказ по orderId во всех магазинах
  let order: any = null;
  let storeName = "";
  for (const store of ordersData.stores || []) {
    const found = store.orders?.find((o: any) => o.id === orderId);
    if (found) {
      order = found;
      storeName = store.storeName || "";
      break;
    }
  }
  if (!order) {
    return <div>Заказ не найден</div>;
  }
  // Проверяем, что заказ относится к "Своей доставке"
  if (order.attributes.deliveryMode !== "DELIVERY_LOCAL") {
    return (
      <div>
        Данный маршрут предназначен только для заказов с "Своей доставкой"
      </div>
    );
  }

  const handleSendCode = async () => {
    setIsSending(true);
    try {
      await sendSecurityCode({
        orderId: orderId, // orderId точно определён
        storeName,
        orderCode: order.attributes.code,
      }).unwrap();
      setCodeSent(true);
    } catch (error) {
      console.error("Ошибка отправки кода:", error);
      alert("Ошибка отправки кода Каспи");
    }
    setIsSending(false);
  };

  const handleCompleteOrder = async () => {
    if (!securityCode) {
      alert("Введите код Каспи");
      return;
    }
    setIsCompleting(true);
    try {
      await completeOrder({
        orderId: orderId,
        storeName,
        orderCode: order.attributes.code,
        securityCode,
      }).unwrap();
      alert("Заказ успешно завершён");
      navigate("/");
    } catch (error) {
      console.error("Ошибка завершения заказа:", error);
      alert("Ошибка при завершении заказа");
    }
    setIsCompleting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      {/* Заголовок с номером заказа */}
      <header className="mb-4">
        <h2 className="text-2xl font-bold text-center">
          Заказ: {order.attributes.code}
        </h2>
      </header>

      {/* Центр: если код отправлен, отображается инпут */}
      <main className="flex-grow flex items-center justify-center">
        {codeSent && (
          <input
            type="text"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
            placeholder="Введите код Каспи"
            className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </main>

      {/* Нижняя часть: кнопки */}
      <footer className="mt-8">
        {!codeSent ? (
          <button
            onClick={handleSendCode}
            disabled={isSending || codeSent}
            className="w-full max-w-sm mx-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSending ? "Отправка..." : "Отправить код Каспи"}
          </button>
        ) : (
          <button
            onClick={handleCompleteOrder}
            disabled={isCompleting}
            className="w-full max-w-sm mx-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {isCompleting ? "Завершение..." : "Завершить заказ"}
          </button>
        )}
      </footer>
    </div>
  );
};
