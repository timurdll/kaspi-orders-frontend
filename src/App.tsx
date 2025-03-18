// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { OrderKaspiDeliveryPage } from "./components/OrderKaspiDeliveryPage";
import { AdminDashboard } from "./components/UI/AdminDashboard";
import { useEffect } from "react";
import socket from "./socket";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "./redux/orderSlice";
import { addComment } from "./redux/commentSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.connect();

    // Регистрация пользователя
    socket.emit("register");

    // Слушаем уведомления
    socket.on("notification", (message: string) => {
      console.log("Уведомление получено:", message);
    });

    // Слушаем обновления статуса заказов
    socket.on(
      "orderStatusUpdate",
      (data: { orderId: string; newStatus: string; timestamp: string }) => {
        console.log(
          `Статус заказа обновлен: Заказ ${data.orderId} -> ${data.newStatus}`
        );

        // Отправляем действие для обновления Redux
        dispatch(
          updateOrderStatus({
            orderId: data.orderId,
            newStatus: data.newStatus as any,
            timestamp: data.timestamp,
          })
        );
      }
    );

    // Слушаем новые комментарии
    socket.on("newComment", (data: { orderKaspiId: string; comment: any }) => {
      console.log(
        `Новый комментарий для заказа ${data.orderKaspiId}:`,
        data.comment
      );

      // Отправляем действие для добавления комментария в Redux
      dispatch(
        addComment({
          orderKaspiId: data.orderKaspiId,
          comment: data.comment,
        })
      );
    });

    // Очистка подключения при размонтировании компонента
    return () => {
      socket.disconnect();
      console.log("WebSocket отключен.");
    };
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/:orderId" element={<OrderKaspiDeliveryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
