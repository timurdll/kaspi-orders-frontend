// api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { OrdersResponse } from "../types/orders";
import { RootState } from "./store";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";

interface Store {
  id: string;
  name: string;
  kaspiToken: string;
}

interface CreateStoreDto {
  name: string;
  apiKey: string;
}

// Тип ответа обновления статуса (содержит waybill)
interface UpdateOrderStatusResponse {
  waybill: string;
}

// Тип параметров для обновления статуса заказа
interface UpdateOrderStatusDto {
  orderId: string;
  storeName: string;
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
    // Новый endpoint для обновления статуса заказа
    // В api.ts в endpoint'е updateOrderStatus:
    updateOrderStatus: builder.mutation<
      UpdateOrderStatusResponse,
      UpdateOrderStatusDto
    >({
      query: (payload) => ({
        url: "orders/status",
        method: "POST",
        body: payload,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Обновляем кэш запроса getOrders, чтобы найти нужный заказ и записать ему новую ссылку накладной
          dispatch(
            api.util.updateQueryData(
              "getOrders",
              undefined,
              (draft: OrdersResponse) => {
                // Обходим все магазины
                draft.stores?.forEach((store) => {
                  // Обновляем только если id заказа совпадает
                  store.orders =
                    store.orders?.map((order) => {
                      if (order.id === arg.orderId) {
                        return {
                          ...order,
                          attributes: {
                            ...order.attributes,
                            // Обновляем только нужное поле
                            kaspiDelivery: {
                              ...order.attributes.kaspiDelivery,
                              waybill: data.waybill,
                            },
                          },
                        };
                      }
                      return order;
                    }) || [];
                });
              }
            )
          );
          // Аналогично можно обновить кэш для getArchiveOrders и getPreOrders, если требуется.
        } catch (error) {
          // Если ошибка – ничего не обновляем
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
  useGetStoresQuery,
  useAddStoreMutation,
  useDeleteStoreMutation,
  useUpdateOrderStatusMutation, // экспортируем новый хук
} = api;
