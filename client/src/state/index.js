import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarCollapsed: false,
  isDarkMode: false,
  searchInput: "",
  userRole: localStorage.getItem("userRole") || "",
  userId: localStorage.getItem("userId") || "",
  accessToken: localStorage.getItem("accessToken") || "",
  refreshToken: localStorage.getItem("refreshToken") || "",
  usedToken: localStorage.getItem("token") || "",
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
      localStorage.setItem("userId", action.payload);
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
      localStorage.setItem("userRole", action.payload);
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem("accessToken", action.payload);
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
      localStorage.setItem("refreshToken", action.payload);
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
      localStorage.removeItem("userId");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("usedToken")
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
} = globalSlice.actions;

export default globalSlice.reducer;
