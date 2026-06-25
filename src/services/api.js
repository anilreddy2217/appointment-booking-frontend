import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// Provider APIs
export const createProviderProfile = (data) => api.post('/providers/profile', data);
export const getAllProviders = () => api.get('/providers/all');
export const searchProviders = (specialty) => api.get(`/providers/search?specialty=${specialty}`);

// Slot APIs
export const createSlot = (data) => api.post('/slots/create', data);
export const getAvailableSlots = (providerId) => api.get(`/slots/available/${providerId}`);
export const getSlotsByDate = (providerId, date) => api.get(`/slots/filter/${providerId}?date=${date}`);

// Appointment APIs
export const bookAppointment = (data) => api.post('/appointments/book', data);
export const cancelAppointment = (id) => api.put(`/appointments/cancel/${id}`);
export const getMyAppointments = (patientId) => api.get(`/appointments/my/${patientId}`);
export const downloadReceipt = (id) => api.get(`/appointments/receipt/${id}`, { responseType: 'blob' });

export default api;