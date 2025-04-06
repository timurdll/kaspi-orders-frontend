// api-slices/admin.ts
import { BaseQueryFn, EndpointBuilder } from "@reduxjs/toolkit/query";
import {
  AdminCreateUserDto,
  AdminUpdateStatusesDto,
  AdminUpdateCitiesDto,
  User,
} from "../api-types";

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

  adminUpdateAllowedCities: builder.mutation<User, AdminUpdateCitiesDto>({
    query: (dto) => ({
      url: "admin/update-allowed-cities",
      method: "PATCH",
      body: dto,
    }),
    invalidatesTags: ["User"],
  }),
});
