import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lista de rutas que no requieren autorización
const rutasSinAutorizacion = ['/projects/social-consulting'];

// Interceptor para adjuntar el token a las solicitudes
api.interceptors.request.use(
  config => {
    // Verifica si la ruta actual está en la lista de rutas sin autorización
    const requiereAutorizacion = !rutasSinAutorizacion.some(ruta => config.url.includes(ruta));
    
    if (requiereAutorizacion) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;