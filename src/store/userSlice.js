import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null, // Default user ID, replace with actual logic
  isAuthenticated: true, // Default to true for now
  token:null,
  githubAccessToken: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.userId = action.payload.userId;
      state.isAuthenticated = !!action.payload.userId;
      state.token = action.payload.token;
      state.githubAccessToken = action.payload.githubAccessToken;
    },
    clearUser(state) {
      state.userId = null;
      state.isAuthenticated = false;
      state.token = null;
      state.githubAccessToken = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer; 