import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Important for cookies
});

// Request interceptor could be used to attach token if we were using localstorage, but we are using httpOnly cookies

// Response interceptor to handle 401 and refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't retry if the failed request was a refresh token request or login request
            if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                await api.post('/auth/refresh');
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token failed, user must log in again
                // Could dispatch an event here to trigger logout in AuthContext
                window.dispatchEvent(new Event('auth:unauthorized'));
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
