import axios from 'axios';

const API_URL = 'https://movie-show-backend-lr9n.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('movie_user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Auto-Logout on Token Expiry or Invalid Token
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only auto-logout if it's NOT a login attempt and we get a 401
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        
        if (error.response && error.response.status === 401 && !isLoginRequest) {
            localStorage.removeItem('movie_user');
            window.location.reload(); 
        }
        return Promise.reject(error);
    }
);

export const authService = {
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    async register(name, email, password) {
        const response = await api.post('/auth/register', { name, email, password });
        return response.data;
    },
    async getProfile() {
        const response = await api.get('/auth/profile');
        return response.data;
    },
    async toggleLike(movieId) {
        const response = await api.post('/auth/like', { movieId });
        return response.data;
    },
    async submitRating(movieId, rating) {
        const response = await api.post('/auth/rate', { movieId, rating });
        return response.data;
    },
    async getAllUsers() {
        const response = await api.get('/auth');
        return response.data;
    }
};

export const bookingService = {
    async createBooking(bookingData) {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },
    async getMyBookings() {
        const response = await api.get('/bookings/my');
        return response.data;
    },
    async getBookedSeats(params) {
        const response = await api.get('/bookings/booked-seats', { params });
        return response.data;
    },
    async getBookingCounts(movieTitle) {
        const response = await api.get('/bookings/counts', { params: { movieTitle } });
        return response.data;
    },
    async getAllBookings() {
        const response = await api.get('/bookings');
        return response.data;
    },
    async cancelBooking(id) {
        const response = await api.delete(`/bookings/${id}`);
        return response.data;
    }
};

export default api;
