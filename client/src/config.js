// client/src/config.js

// API_URL relies dynamically on REACT_APP_API_URL environment variable, defaulting to relative /api
export const API_URL = process.env.REACT_APP_API_URL || "/api";

export default API_URL;
