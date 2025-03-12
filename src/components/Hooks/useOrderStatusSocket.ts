import { useEffect } from "react";
import { useDispatch } from "react-redux";
import socket from "../../socket";
import { updateOrderStatus } from "../../redux/orderSlice";

export const useOrderStatusSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket.hasListeners("orderStatusUpdate")) {
      socket.on(
        "orderStatusUpdate",
        (data: { orderId: string; newStatus: string; timestamp: string }) => {
          console.log(
            `Order status updated (hook): order ${data.orderId} -> ${data.newStatus}`
          );

          dispatch(
            updateOrderStatus({
              orderId: data.orderId,
              newStatus: data.newStatus as any,
              timestamp: data.timestamp,
            })
          );
        }
      );
    }

    return () => {
      socket.off("orderStatusUpdate");
    };
  }, [dispatch]);

  return null;
};
