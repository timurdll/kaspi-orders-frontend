import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { OrdersResponse } from "../types/orders";
import { RootState } from "./store";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";

// Существующие интерфейсы...
interface Store {
  id: string;
  name: string;
  kaspiToken: string;
}

interface CreateStoreDto {
  name: string;
  apiKey: string;
}

interface UpdateOrderStatusResponse {
  waybill: string;
}

interface UpdateOrderStatusDto {
  orderId: string;
  storeName: string;
}

// Новые интерфейсы для операций с кодом
interface SendSecurityCodeDto {
  orderId: string;
  storeName: string;
  orderCode: string;
}

interface CompleteOrderDto extends SendSecurityCodeDto {
  securityCode: string;
}

interface CompleteOrderResponse {
  data: {
    type: string;
    id: string;
    attributes: {
      code: string;
      status: string;
    };
    relationships: {
      user: {
        links: {
          self: string;
          related: string;
        };
        data: null;
      };
      entries: {
        links: {
          self: string;
          related: string;
        };
      };
    };
    links: {
      self: string;
    };
  };
  included: any[];
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Store"],
  endpoints: (builder) => ({
    // Существующие endpoints...
    login: builder.mutation<
      { access_token: string },
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getOrders: builder.query<OrdersResponse, void>({
      query: () => "orders",
      providesTags: ["Store"],
    }),
    getArchiveOrders: builder.query<OrdersResponse, void>({
      query: () => "orders/archive",
      providesTags: ["Store"],
    }),
    getPreOrders: builder.query<OrdersResponse, void>({
      query: () => "orders/pre-orders",
      providesTags: ["Store"],
    }),
    getReturnedOrders: builder.query<OrdersResponse, void>({
      query: () => "orders/returned",
      providesTags: ["Store"],
    }),
    getStores: builder.query<Store[], void>({
      query: () => "stores",
      providesTags: ["Store"],
    }),
    addStore: builder.mutation<Store, CreateStoreDto>({
      query: (store) => ({
        url: "stores",
        method: "POST",
        body: store,
      }),
      invalidatesTags: ["Store"],
    }),
    deleteStore: builder.mutation<void, string>({
      query: (id) => ({
        url: `stores/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Store"],
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
      invalidatesTags: ["Store"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Order updated successfully:", data.waybill, arg);
        } catch (error) {
          console.error("Error updating order status:", error);
        }
      },
    }),

    // Эндпоинты для операций с кодом
    sendSecurityCode: builder.mutation<void, SendSecurityCodeDto>({
      query: (payload) => ({
        url: "orders/send-code",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Store"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log(
            "Security code sent successfully for order:",
            arg.orderId
          );
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
      invalidatesTags: ["Store"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Order completed successfully:", data.data.id, arg);
        } catch (error) {
          console.error("Error completing order:", error);
        }
      },
    }),

    // Новый endpoint для формирования накладной
    generateWaybill: builder.query<Blob, string>({
      query: (orderId: string) => ({
        url: `orders/waybill/${orderId}`,
        method: "GET",
        // @ts-ignore: responseHandler используется для получения Blob
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
  }),
});

export const {
  useLoginMutation,
  useGetOrdersQuery,
  useGetArchiveOrdersQuery,
  useGetPreOrdersQuery,
  useGetReturnedOrdersQuery,
  useGetStoresQuery,
  useAddStoreMutation,
  useDeleteStoreMutation,
  useUpdateOrderStatusMutation,
  useSendSecurityCodeMutation,
  useCompleteOrderMutation,
  useLazyGenerateWaybillQuery, // ленивый query для формирования накладной
} = api;
