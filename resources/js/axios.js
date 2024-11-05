import Axios from "axios";

const axios = Axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  withCredentials: true
});

export default axios;