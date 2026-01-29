import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import userReducer from './userSlice';
import authReducer from './authSlice';
import projectReducer from './projectSlice';
import repoReducer from './repoSlice';
import GLOBALS from '@/constants/globals.constants';

// Create a simple noop storage for server-side rendering
const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem() {
      return Promise.resolve();
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Use localStorage on client, noop storage on server
const clientStorage = isClient ? storage : createNoopStorage();

// Auth-specific persist config
const authPersistConfig = {
  key: 'auth',
  storage: clientStorage,
  whitelist: ['user', 'token', 'isAuthenticated'], // Only persist these fields
};

const userPersistConfig = {
  key: 'user',
  storage: clientStorage,
};

const projectPersistConfig = {
  key: 'project',
  storage: clientStorage,
};

// Root persist config
const persistConfig = {
  key: 'root',
  storage: clientStorage,
  whitelist: ['auth', 'user'], // Only persist auth and user slices
  blacklist: ['repo'], // Don't persist these (fetch fresh on load)
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  user: persistReducer(userPersistConfig, userReducer),
  project: persistReducer(projectPersistConfig, projectReducer),
  repo: repoReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
  devTools: GLOBALS.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);