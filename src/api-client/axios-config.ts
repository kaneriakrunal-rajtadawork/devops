import GLOBALS from '@/constants/globals.constants';
import axios, { AxiosHeaders } from 'axios';

// Configure axios defaults
axios.defaults.baseURL = GLOBALS.NEXT_PUBLIC_URL;
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Get token from localStorage (for client-side)
export const getTokenFromStorage = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      // Try to get from localStorage first
      const token = localStorage.getItem('authToken');
      if (token) return token;
      
      // Try to get from Redux store if available
      const persistedState = localStorage.getItem('persist:root');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        const authState = JSON.parse(parsed.auth || '{}');
        return authState.token || null;
      }
    } catch (error) {
      console.warn('Failed to get token from storage:', error);
    }
  }
  return null;
};

// Request interceptor to add token
axios.interceptors.request.use(
  (config) => {
    // Get token if not already set
    if (!authToken) {
      const token = getTokenFromStorage();
      if (token) {
        setAuthToken(token);
      }
    }

    // Add token to request if available
    if (authToken && !config.headers?.Authorization) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // Log request in development
    if (GLOBALS.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    // Log response in development
    if (GLOBALS.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Log error in development
    // if (GLOBALS.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    // }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('persist:root');
        localStorage.removeItem('persist:auth');
        localStorage.removeItem('persist:user');
        localStorage.removeItem('persist:project');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Dispatch logout action if using Redux
        // Redirect to login page
        const currentPath = window.location.pathname;
        if (currentPath !== '/signin' && currentPath !== '/signup') {
          window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error or server is down');
      console.error("Error cause",error)
    //   return Promise.reject({
    //     message: 'Network error. Please check your connection.',
    //     code: 'NETWORK_ERROR',
    //   });
    }

    // Handle API errors with standardized format
    const errorData = error.response.data as any;
    const apiError = {
      message: errorData?.message || error.message || 'An error occurred',
      code: errorData?.code || 'API_ERROR',
      status: error.response.status,
      details: errorData?.errors || errorData?.details,
    };

    return Promise.reject(apiError);
  }
);

export { axios as default };
export { setAuthToken as configureAuth };
