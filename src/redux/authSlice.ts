// src/redux/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

export interface UserData {
  userId: string;
  username: string;
  role: string;
  allowedStatuses: string[];
  // allowedCities: string[];
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user?: UserData;
}

const token = localStorage.getItem("token");
let user: UserData | undefined = undefined;
if (token) {
  try {
    user = jwtDecode<UserData>(token);
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    user = undefined;
  }
}

const initialState: AuthState = {
  token,
  isAuthenticated: !!token,
  user,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserData }>
    ) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = undefined;
      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
