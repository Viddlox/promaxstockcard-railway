import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarCollapsed: false,
  isDarkMode: false,
  searchInput: ""
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
      state.searchInput = action.payload
    }
  },
});

export const { setIsDarkMode, setIsSidebarCollapsed, setSearchInput } = globalSlice.actions;

export default globalSlice.reducer;
