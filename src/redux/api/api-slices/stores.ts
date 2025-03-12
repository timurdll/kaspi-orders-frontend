// api-slices/stores.ts
// Slice для операций с магазинами

import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { Store, CreateStoreDto } from "../api-types";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

export const storesEndpoints = (
  builder: EndpointBuilder<BaseQueryFn, string, string>
) => ({
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
});
