import { createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // default localStorage for web

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isRehydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      // Update user data while maintaining authentication
      if (state.isAuthenticated) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      // Mark rehydration as complete
      state.isRehydrated = true;
      
      // Validate and restore auth state from persisted data
      if (action.payload?.auth) {
        const { token, user, isAuthenticated } = action.payload.auth;
        
        if (token && user && isAuthenticated) {
          try {
            // Basic JWT token validation
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            if (!isExpired) {
              // Token is valid, restore auth state
              state.user = user;
              state.token = token;
              state.isAuthenticated = true;
            } else {
              // Token expired, clear auth state
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
              storage.removeItem('persist:root');
              storage.removeItem('persist:auth');
              storage.removeItem('persist:user');
              storage.removeItem('persist:project');

            }
          } catch (error) {
            // Invalid token format, clear auth state
            console.warn('Invalid token during rehydration:', error);
            storage.removeItem('persist:root');
            storage.removeItem('persist:auth');
            storage.removeItem('persist:user');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          }
        } else {
          // Incomplete auth data, ensure clean state
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      }
      
      // Reset loading and error states after rehydration
      state.loading = false;
      state.error = null;
    });
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer; 