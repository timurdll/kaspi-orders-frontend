import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { OrdersResponse } from "../types/orders";
import { RootState } from "./store";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
    }),
    getArchiveOrders: builder.query<OrdersResponse, void>({
      query: () => "orders/archive",
    }),
  }),
});

export const { useLoginMutation, useGetOrdersQuery, useGetArchiveOrdersQuery } =
  api;
