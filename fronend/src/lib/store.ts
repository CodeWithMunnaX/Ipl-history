"use client"

import { configureStore } from "@reduxjs/toolkit";
import { iplApi } from "./services/iplApi";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const makeStore = () =>
  configureStore({
    reducer: {
      [iplApi.reducerPath]: iplApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(iplApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });

export const store = makeStore();
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


