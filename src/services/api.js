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
    async cancelBooking(id) {
        const response = await api.delete(`/bookings/${id}`);
        return response.data;
    }
};

export default api;
