import axios from "axios";

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 / 403 ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("jwt_token");
      sessionStorage.removeItem("auth_user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent("auth:forbidden"));
    }
    return Promise.reject(error);
  }
);

// ─── Helper: extract readable error message from backend envelope ─────────────
export function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return error?.message || "An unexpected error occurred.";
  if (typeof data === "string") return data;
  return data.message || data.error || error?.message || "An unexpected error occurred.";
}

// ─── API Host & Public Auth Endpoints ─────────────────────────────────────────
// Note: In Spring Boot SecurityConfig, public endpoints are at root /login and /register
const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";

export const authApi = {
  login: (credentials) =>
    axios.post(`${API_HOST}/login`, {
      username: credentials.username?.trim(),
      password: credentials.password,
    }),
  register: (payload) =>
    axios.post(`${API_HOST}/register`, {
      username: payload.username?.trim(),
      password: payload.password,
      ...(payload.email ? { email: payload.email?.trim() } : {}),
    }),
};

// ─── Products Endpoints ───────────────────────────────────────────────────────
export const productsApi = {
  list: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get("/categories"),
};

// ─── Cart Endpoints ───────────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get("/cart?expand=product"),
  add: (productId, quantity = 1, deliveryOptionId = "1") =>
    api.post("/cart/items", {
      productId,
      quantity: Number(quantity) || 1,
      deliveryOptionId: String(deliveryOptionId || "1"),
    }),
  updateItem: (itemId, quantity, deliveryOptionId) =>
    api.put(`/cart/items/${itemId}`, {
      ...(quantity !== undefined ? { quantity: Number(quantity) } : {}),
      ...(deliveryOptionId ? { deliveryOptionId: String(deliveryOptionId) } : {}),
    }),
  deleteItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  updateDelivery: (itemId, deliveryOptionId) =>
    api.put(`/cart/items/${itemId}`, { deliveryOptionId: String(deliveryOptionId) }),
  clear: () => api.delete("/cart"),
};

// ─── Delivery Options ─────────────────────────────────────────────────────────
export const deliveryApi = {
  list: () => api.get("/delivery-options"),
};

// ─── Orders Endpoints ─────────────────────────────────────────────────────────
export const ordersApi = {
  getOrders: () => api.get("/orders?expand=products"),
  list: (expand = "products") => api.get(`/orders?expand=${expand}`),
  getOrderById: (orderId) => api.get(`/orders/${orderId}?expand=products`),
  getById: (orderId, expand = "products") => api.get(`/orders/${orderId}?expand=${expand}`),
  checkout: (payload) => api.post("/orders/checkout", payload),
  cancel: (orderId) => api.put(`/orders/${orderId}/cancel`),
};

// ─── Payments Endpoints ───────────────────────────────────────────────────────
export const paymentsApi = {
  verify: (payload) => api.post("/payments/verify", payload),
};

// ─── User Profile Endpoints ───────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (payload) => api.put("/users/profile", payload),
  getAddresses: () => api.get("/users/addresses"),
  createAddress: (payload) => api.post("/users/addresses", payload),
  updateAddress: (id, payload) => api.put(`/users/addresses/${id}`, payload),
  setDefaultAddress: (id) => api.patch(`/users/addresses/${id}/default`),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};

export { getProductImageUrl } from "../util/imageUrl";

export default api;
