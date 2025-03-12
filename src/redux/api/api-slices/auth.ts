// api-slices/auth.ts
// Slice для аутентификации

import { BaseQueryFn, EndpointBuilder } from "@reduxjs/toolkit/query";

export const authEndpoints = (
  builder: EndpointBuilder<BaseQueryFn, string, string>
) => ({
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
});
