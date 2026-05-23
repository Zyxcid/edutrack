import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

export const predict = (data) => api.post('/predict', data, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)

export default api