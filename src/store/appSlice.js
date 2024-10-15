// src/store/appSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  phoneLinks: [],
  clickedNumbers: [],
  isRunning: false,
  error: null,
  loading: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setPhoneLinks(state, action) {
      state.phoneLinks = action.payload;
    },
    addClickedNumber(state, action) {
      state.clickedNumbers.push(action.payload);
    },
    setIsRunning(state, action) {
      state.isRunning = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    reset(state) {
      state.clickedNumbers = [];
      state.isRunning = false;
      state.error = null;
      state.loading = false;
      // Note: Do NOT reset `phoneLinks` here
    },
  },
});

export const {
  setPhoneLinks,
  addClickedNumber,
  setIsRunning,
  setError,
  setLoading,
  reset,
} = appSlice.actions;

export default appSlice.reducer;
