// api-base-config.ts
// Базовая конфигурация API

import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/";

// Базовый запрос с поддержкой авторизации
export const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Теги для инвалидации кеша
export const API_TAG_TYPES = ["Store", "Comments", "User", "Order"] as const;
