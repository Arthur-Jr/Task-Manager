import axios from 'axios';

require('dotenv').config();

const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3001',
});

export default api;
