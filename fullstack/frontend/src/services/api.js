import axios from 'axios'

const api = axios.create({
  baseURL: 'https://capstoneproject-production-f10d.up.railway.app/api',
})

export const predict = (data) => api.post('/predict', data, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const getPredictions = () => api.get('/predict', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const getCurrentPrediction = () => api.get('/predict/current', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const simulate = (data) => api.post('/predict/simulate', data, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})
  
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)

export default api