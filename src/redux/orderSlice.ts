import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderCustomStatus } from "../types/orders";

interface OrderStatusUpdate {
  orderId: string; // измените с number на string
  newStatus: OrderCustomStatus;
  timestamp: string;
}

const initialState = {
  statusUpdates: {} as Record<
    string, // <--- изменено с number на string
    {
      status: OrderCustomStatus;
      timestamp: string;
    }
  >,
};

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    updateOrderStatus: (state, action: PayloadAction<OrderStatusUpdate>) => {
      const { orderId, newStatus, timestamp } = action.payload;
      state.statusUpdates[orderId] = {
        status: newStatus,
        timestamp,
      };
    },
  },
});

export const { updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
