import axios from "axios";

// Base URL del backend Spring Boot
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Adjunta el header Authorization: Basic ... en cada petición
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem("amstore_auth");
  if (auth) {
    config.headers.Authorization = `Basic ${auth}`;
  }
  return config;
});

// Si el backend responde 401, la sesión ya no es válida: limpiamos y mandamos a login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("amstore_auth");
      localStorage.removeItem("amstore_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
