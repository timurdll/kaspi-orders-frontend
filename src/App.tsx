import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { OrderKaspiDeliveryPage } from "./components/OrderKaspiDeliveryPage";
import { AdminDashboard } from "./components/UI/AdminDashboard";
import { useEffect } from "react";
import socket from "./socket";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "./redux/orderSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.connect();

    // Registración del usuario
    socket.emit("register");

    // Escuchar notificaciones
    socket.on("notification", (message: string) => {
      console.log("Notificación recibida:", message);
    });

    // Escuchar actualizaciones de estado de órdenes
    socket.on(
      "orderStatusUpdate",
      (data: { orderId: string; newStatus: string; timestamp: string }) => {
        console.log(
          `Estado de orden actualizado: Orden ${data.orderId} -> ${data.newStatus}`
        );

        // Despachar acción para actualizar Redux
        dispatch(
          updateOrderStatus({
            orderId: data.orderId,
            newStatus: data.newStatus as any,
            timestamp: data.timestamp,
          })
        );
      }
    );

    // Limpiar conexión al desmontar componente
    return () => {
      socket.disconnect();
      console.log("WebSocket desconectado.");
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
