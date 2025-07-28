// src/redux/selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";

export const selectUser = (state: RootState) => state.auth.user;

export const selectAllowedStatuses = createSelector(
  selectUser,
  (user) => user?.allowedStores || [],
  (user) => user?.allowedStatuses || []
);
