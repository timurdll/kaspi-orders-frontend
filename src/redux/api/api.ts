// api.ts
// Главный файл API, который объединяет все слайсы

import { createApi } from "@reduxjs/toolkit/query/react";
import { authEndpoints } from "./api-slices/auth";
import { ordersEndpoints } from "./api-slices/orders";
import { commentsEndpoints } from "./api-slices/comments";
import { storesEndpoints } from "./api-slices/stores";
import { adminEndpoints } from "./api-slices/admin";
import { API_TAG_TYPES, baseQuery } from "./api-base.config";

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: API_TAG_TYPES,
  endpoints: (builder) => ({
    ...authEndpoints(builder),
    ...ordersEndpoints(builder),
    ...commentsEndpoints(builder),
    ...storesEndpoints(builder),
    ...adminEndpoints(builder),
  }),
});

// Экспорт хуков для использования в компонентах
export const {
  // Auth
  useLoginMutation,

  // Orders
  useGetOrdersQuery,
  useGetArchiveOrdersQuery,
  useGetPreOrdersQuery,
  useGetReturnedOrdersQuery,
  useUpdateCustomStatusMutation,
  useUpdateOrderStatusMutation,
  useSendSecurityCodeMutation,
  useCompleteOrderMutation,
  useLazyGenerateSelfDeliveryWaybillQuery,
  useUpdateOrderStatusWithWaybillMutation, // Новый хук

  // Comments
  useAddCommentMutation,
  useGetCommentsQuery,
  useGetUnreadCommentsCountQuery,
  useMarkCommentsAsReadMutation,

  // Stores
  useGetStoresQuery,
  useAddStoreMutation,
  useDeleteStoreMutation,

  // Admin
  useAdminCreateUserMutation,
  useAdminGetUsersQuery,
  useAdminUpdateAllowedStatusesMutation,
  useAdminUpdateAllowedCitiesMutation,
} = api;

// Экспорт для использования в store.ts
export { api as apiReducer };
