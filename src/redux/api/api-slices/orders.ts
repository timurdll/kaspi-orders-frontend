// api-slices/orders.ts
// Slice для операций с заказами

import { BaseQueryFn, EndpointBuilder } from "@reduxjs/toolkit/query";
import {
  UpdateOrderStatusDto,
  UpdateOrderStatusResponse,
  SendSecurityCodeDto,
  CompleteOrderDto,
  CompleteOrderResponse,
} from "../api-types";
import { OrdersResponse } from "../../../types/orders";

export const ordersEndpoints = (
  builder: EndpointBuilder<BaseQueryFn, string, string>
) => ({
  getOrders: builder.query<OrdersResponse, void>({
    query: () => "orders",
    providesTags: ["Orders"],
    keepUnusedDataFor: 60, // Данные хранятся в кеше 60 секунд
  }),

  getArchiveOrders: builder.query<OrdersResponse, void>({
    query: () => "orders/archive",
    providesTags: ["Orders"],
  }),

  getPreOrders: builder.query<OrdersResponse, void>({
    query: () => "orders/pre-orders",
    providesTags: ["Orders"],
  }),

  getReturnedOrders: builder.query<OrdersResponse, void>({
    query: () => "orders/returned",
    providesTags: ["Orders"],
  }),

  updateCustomStatus: builder.mutation<
    { customStatus: string },
    { orderId: string; status: string }
  >({
    query: ({ orderId, status }) => ({
      url: `orders/${orderId}/custom-status`,
      method: "PATCH",
      body: { status },
    }),
    invalidatesTags: ["Orders"],
  }),

  updateOrderStatus: builder.mutation<
    UpdateOrderStatusResponse,
    UpdateOrderStatusDto
  >({
    query: (payload) => ({
      url: "orders/status",
      method: "POST",
      body: payload,
    }),
    invalidatesTags: ["Orders"],
    async onQueryStarted(arg, { queryFulfilled }) {
      try {
        const { data } = await queryFulfilled;
        console.log("Order update full response:", data);
        console.log("Order updated successfully:", data.waybill, arg);
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    },
  }),

  // Новый эндпоинт для обновления статуса и получения waybill
  updateOrderStatusWithWaybill: builder.mutation<
    UpdateOrderStatusResponse,
    UpdateOrderStatusDto & { orderCode: string }
  >({
    query: (payload) => ({
      url: "orders/status-with-waybill",
      method: "POST",
      body: payload,
    }),
    invalidatesTags: ["Orders"],
    async onQueryStarted(arg, { queryFulfilled }) {
      try {
        console.log(arg);
        const { data } = await queryFulfilled;
        console.log("Order update with waybill response:", data);
      } catch (error) {
        console.error("Error updating order status with waybill:", error);
      }
    },
  }),

  sendSecurityCode: builder.mutation<void, SendSecurityCodeDto>({
    query: (payload) => ({
      url: "orders/send-code",
      method: "POST",
      body: payload,
    }),
    invalidatesTags: ["Orders"],
    async onQueryStarted(arg, { queryFulfilled }) {
      try {
        await queryFulfilled;
        console.log("Security code sent successfully for order:", arg.orderId);
      } catch (error) {
        console.error("Error sending security code:", error);
      }
    },
  }),

  completeOrder: builder.mutation<CompleteOrderResponse, CompleteOrderDto>({
    query: (payload) => ({
      url: "orders/complete",
      method: "POST",
      body: payload,
    }),
    invalidatesTags: ["Orders"],
    async onQueryStarted(arg, { queryFulfilled }) {
      try {
        const { data } = await queryFulfilled;
        console.log("Order completed successfully:", data.data.id, arg);
      } catch (error) {
        console.error("Error completing order:", error);
      }
    },
  }),

  generateSelfDeliveryWaybill: builder.query<Blob, string>({
    query: (orderId: string) => ({
      url: `orders/waybill/${orderId}`,
      method: "GET",
      responseHandler: (response: Response) => response.blob(),
    }),
    transformResponse: (blob: Blob) => blob,
    async onQueryStarted(orderId, { queryFulfilled }) {
      try {
        await queryFulfilled;
        console.log("Waybill generated for order:", orderId);
      } catch (error) {
        console.error("Error generating waybill:", error);
      }
    },
  }),
});
