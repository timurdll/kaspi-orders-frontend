// api-slices/admin.ts
// Slice для административных функций

import { BaseQueryFn, EndpointBuilder } from "@reduxjs/toolkit/query";
import { AdminCreateUserDto, AdminUpdateStatusesDto, User } from "../api-types";

export const adminEndpoints = (
  builder: EndpointBuilder<BaseQueryFn, string, string>
) => ({
  adminCreateUser: builder.mutation<User, AdminCreateUserDto>({
    query: (dto) => ({
      url: "admin/create-user",
      method: "POST",
      body: dto,
    }),
    invalidatesTags: ["User"],
  }),

  adminGetUsers: builder.query<User[], void>({
    query: () => "admin/users",
    providesTags: ["User"],
  }),

  adminUpdateAllowedStatuses: builder.mutation<User, AdminUpdateStatusesDto>({
    query: (dto) => ({
      url: "admin/update-allowed-statuses",
      method: "PATCH",
      body: dto,
    }),
    invalidatesTags: ["User"],
  }),
});
