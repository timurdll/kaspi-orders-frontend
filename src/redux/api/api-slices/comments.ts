// api-slices/comments.ts
import { BaseQueryFn, EndpointBuilder } from "@reduxjs/toolkit/query";
import { OrderComment } from "../api-types";

export const commentsEndpoints = (
  builder: EndpointBuilder<BaseQueryFn, string, string>
) => ({
  addComment: builder.mutation<OrderComment, { orderId: string; text: string }>(
    {
      query: ({ orderId, text }) => ({
        url: `orders/${orderId}/comments`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Comments"],
    }
  ),
  getComments: builder.query<{ comments: OrderComment[] }, string>({
    query: (orderId) => `orders/${orderId}/comments`,
    providesTags: ["Comments"],
  }),
  getUnreadCommentsCount: builder.query<number, string>({
    query: (orderId) => `orders/${orderId}/comments/unread-count`, // Создай соответствующий эндпоинт на бэкенде, либо можно использовать GET /comments и вычислять count
    providesTags: ["Comments"],
  }),
  markCommentsAsRead: builder.mutation<{ success: boolean }, string>({
    query: (orderId) => ({
      url: `orders/${orderId}/comments/mark-read`,
      method: "POST",
    }),
    invalidatesTags: ["Comments"],
  }),
});
