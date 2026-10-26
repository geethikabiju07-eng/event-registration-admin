import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});

export const getEvents = () => api.get("/events");
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (payload) => api.post("/events", payload);
export const updateEvent = (id, payload) => api.put(`/events/${id}`, payload);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export default api;
