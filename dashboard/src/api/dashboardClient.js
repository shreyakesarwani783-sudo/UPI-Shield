import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

export const getStats = () => API.get("/stats");
export const scanUrl = (url) => API.post("/scan", { url });
export const reportUrl = (url, reason) => API.post("/report", { url, reason });