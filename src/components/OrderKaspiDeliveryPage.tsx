import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetOrdersQuery,
  useSendSecurityCodeMutation,
  useCompleteOrderMutation,
} from "../redux/api";
import { Loader } from "./UI/Loader";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

// Простой компонент для уведомлений
const Notification = ({
  type = "info",
  title,
  message,
}: {
  type?: "error" | "success" | "info";
  title: string;
  message: string;
}) => {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-green-50 border-green-200 text-green-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} mb-4`}>
      <div className="flex items-center gap-2">
        {type === "error" && <AlertCircle className="h-5 w-5" />}
        {type === "success" && <CheckCircle2 className="h-5 w-5" />}
        <span className="font-medium">{title}</span>
      </div>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
};

export const OrderKaspiDeliveryPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: ordersData, isLoading } = useGetOrdersQuery(undefined, {
    pollingInterval: 60000,
  });
  const [sendSecurityCode] = useSendSecurityCodeMutation();
  const [completeOrder] = useCompleteOrderMutation();

  const [securityCode, setSecurityCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!orderId) {
    return (
      <div className="p-4">
        <Notification
          type="error"
          title="Ошибка"
          message="Некорректный идентификатор заказа"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!ordersData) {
    return (
      <div className="p-4">
        <Notification
          type="error"
          title="Ошибка"
          message="Нет данных о заказах"
        />
      </div>
    );
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
    return (
      <div className="p-4">
        <Notification type="error" title="Ошибка" message="Заказ не найден" />
      </div>
    );
  }

  if (order.attributes.deliveryMode !== "DELIVERY_LOCAL") {
    return (
      <div className="p-4">
        <Notification
          type="error"
          title="Ошибка"
          message="Данный маршрут предназначен только для заказов с 'Своей доставкой'"
        />
      </div>
    );
  }

  const handleSendCode = async () => {
    setError("");
    setIsSending(true);
    try {
      await sendSecurityCode({
        orderId: orderId,
        storeName,
        orderCode: order.attributes.code,
      }).unwrap();
      setCodeSent(true);
      setSuccess("Код успешно отправлен");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Ошибка отправки кода:", error);
      setError("Ошибка отправки кода Каспи");
    }
    setIsSending(false);
  };

  const handleCompleteOrder = async () => {
    if (!securityCode) {
      setError("Введите код Каспи");
      return;
    }
    setError("");
    setIsCompleting(true);
    try {
      await completeOrder({
        orderId: orderId,
        storeName,
        orderCode: order.attributes.code,
        securityCode,
      }).unwrap();
      setSuccess("Заказ успешно завершён");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Ошибка завершения заказа:", error);
      setError("Ошибка при завершении заказа");
    }
    setIsCompleting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
      >
        <ArrowLeft className="h-6 w-6 text-gray-600" />
      </button>

      <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Header */}
        <header className="mb-8 text-center pt-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Заказ №{order.attributes.code}
          </h2>
          <p className="mt-2 text-sm text-gray-600">Магазин: {storeName}</p>
        </header>

        {/* Messages */}
        {error && <Notification type="error" title="Ошибка" message={error} />}

        {success && (
          <Notification type="success" title="Успешно" message={success} />
        )}

        {/* Main content */}
        <main className="flex-grow flex flex-col items-center justify-center space-y-6 px-4">
          {codeSent ? (
            <div className="w-full max-w-sm space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Введите код подтверждения
              </label>
              <input
                type="text"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                placeholder="Код из SMS"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                maxLength={6}
                pattern="\d*"
                inputMode="numeric"
              />
              <button
                onClick={handleCompleteOrder}
                disabled={isCompleting}
                className="w-full py-3 px-4 rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isCompleting ? "Завершение..." : "Завершить заказ"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSendCode}
              disabled={isSending}
              className="w-full max-w-sm py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSending ? "Отправка..." : "Отправить код Каспи"}
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderKaspiDeliveryPage;
