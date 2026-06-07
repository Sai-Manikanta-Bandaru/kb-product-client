import axios from 'axios';

const api = axios.create({
  baseURL: 'https://kb-product-server.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
