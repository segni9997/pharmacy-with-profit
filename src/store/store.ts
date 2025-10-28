import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./authApi";
import authReducer from "./authSlice";
import { userApi } from "./userApi";
import { medicineApi } from "./medicineApi";
import { unitApi } from "./unitApi";
import { refillApi } from "./refillApi";
import { saleApi } from "./saleApi";
import { dashboardApi } from "./dashboardApi";
import { settingsApi } from "./settingsApi";
import { exportApi } from "./exportApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [medicineApi.reducerPath]: medicineApi.reducer,
    [unitApi.reducerPath]: unitApi.reducer,
    [refillApi.reducerPath]: refillApi.reducer,
    [saleApi.reducerPath]: saleApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [exportApi.reducerPath]:exportApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(medicineApi.middleware)
      .concat(unitApi.middleware)
      .concat(refillApi.middleware)
      .concat(saleApi.middleware)
      .concat(dashboardApi.middleware)
      .concat(settingsApi.middleware)
  .concat(exportApi.middleware),
});

// for TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
