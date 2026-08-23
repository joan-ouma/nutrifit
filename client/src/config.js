// client/src/config.js

const DEFAULT_LOCAL_URL = "http://localhost:5000/api";
const DEFAULT_PROD_URL = "https://nutrifit-backend-latest.onrender.com/api";

const getIsLocalHost = () => {
    if (typeof window === "undefined" || !window.location?.hostname) {
        return false;
    }
    const hostname = window.location.hostname.toLowerCase();
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
};

export const API_URL =
    process.env.REACT_APP_API_URL ||
    (getIsLocalHost() ? DEFAULT_LOCAL_URL : DEFAULT_PROD_URL);

export default API_URL;
