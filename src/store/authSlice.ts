// src/store/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  username: string;
  role: string;
}

interface Token {
  access: string | null;
  refresh: string | null;
}

interface AuthState {
  user: User | null;
  token: Token;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: { access: null, refresh: null },
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: Token; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("pharmacy_user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.token = { access: null, refresh: null };
      localStorage.removeItem("pharmacy_user");
    },
    loadSession: (state) => {
      const stored = localStorage.getItem("pharmacy_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        state.token = parsed.token;
        state.user = parsed.user;
      }
    },
  },
});

export const { setCredentials, logout, loadSession } = authSlice.actions;
export default authSlice.reducer;
