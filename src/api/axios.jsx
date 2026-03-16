import axios from "axios";

const api = axios.create({
  baseURL: "http://35.247.173.19:8080/api/v1",
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;