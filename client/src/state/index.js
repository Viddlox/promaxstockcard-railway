"use client";

import { createSlice } from "@reduxjs/toolkit";

// Create initial state without localStorage access
const initialState = {
  isSidebarCollapsed: false,
  isDarkMode: false,
  searchInput: "",
  userRole: "",
  userId: "",
  accessToken: "",
  refreshToken: "",
  usedToken: "",
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    setSearchInput: (state, action) => {
      state.searchInput = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem("userId", action.payload);
      }
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem("userRole", action.payload);
      }
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem("accessToken", action.payload);
      }
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem("refreshToken", action.payload);
      }
    },
    setUsedToken: (state, action) => {
      state.usedToken = action.payload;
    },
    logoutUser: (state) => {
      state.userId = "";
      state.accessToken = "";
      state.refreshToken = "";
      state.userRole = "";
      state.usedToken = "";
      if (typeof window !== 'undefined') {
        localStorage.removeItem("userId");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("usedToken");
      }
    },
    // Add a new action to initialize state from localStorage
    initializeState: (state) => {
      if (typeof window !== 'undefined') {
        state.userRole = localStorage.getItem("userRole") || "";
        state.userId = localStorage.getItem("userId") || "";
        state.accessToken = localStorage.getItem("accessToken") || "";
        state.refreshToken = localStorage.getItem("refreshToken") || "";
        state.usedToken = localStorage.getItem("token") || "";
      }
    },
  },
});

export const {
  setIsDarkMode,
  setIsSidebarCollapsed,
  setSearchInput,
  setUserId,
  setUserRole,
  setAccessToken,
  setRefreshToken,
  setUsedToken,
  logoutUser,
  initializeState,
} = globalSlice.actions;

export default globalSlice.reducer;
