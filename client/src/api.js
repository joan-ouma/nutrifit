// client/src/api.js
import axios from "axios";

const DEFAULT_LOCAL_URL = "http://localhost:5000/api";
const DEFAULT_PROD_URL = "https://fitfork-api.onrender.com/api";

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

export const fetchTrendingRecipes = async () => {
    try {
        const res = await axios.get(`${API_URL}/recipes/trending`);
        return res.data;
    } catch (error) {
        console.error("Error fetching trending recipes:", error);
        throw error;
    }
};

export const updateUserProfile = async (updatedData) => {
    try {
        const res = await axios.post(`${API_URL}/user/profile`, updatedData);
        return res.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

export const getRecommendations = async (pantryInput, user) => {
    try {
        const res = await axios.post(`${API_URL}/recommend`, {
            pantry: pantryInput,
            userGoal: user.goals || "balanced",
            budget: user.budgetLevel || "medium",
        });
        return res.data;
    } catch (error) {
        console.error("Error getting recommendations:", error);
        throw error;
    }
};

// Meal Tracking API
export const logMeal = async (mealData) => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/meals`, mealData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error logging meal:", error);
        throw error;
    }
};

export const getMealsByDate = async (date) => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/meals/date/${date}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching meals:", error);
        throw error;
    }
};

export const getWeeklySummary = async (startDate) => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/meals/weekly${startDate ? `?startDate=${startDate}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching weekly summary:", error);
        throw error;
    }
};

export const getNutritionInsights = async (days = 7) => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/meals/insights?days=${days}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching insights:", error);
        throw error;
    }
};

export const deleteMeal = async (mealId) => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.delete(`${API_URL}/meals/${mealId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error deleting meal:", error);
        throw error;
    }
};

export const getPersonalizedRecommendations = async (mealType, date) => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/recommend/personalized`, {
            mealType,
            date
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error getting personalized recommendations:", error);
        throw error;
    }
};

export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

// Grocery List API
export const generateGroceryList = async (data) => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/grocery/generate`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error generating grocery list:", error);
        throw error;
    }
};

export const getGroceryLists = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/grocery`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching grocery lists:", error);
        throw error;
    }
};

// Achievements API
export const checkAchievements = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/achievements/check`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error checking achievements:", error);
        throw error;
    }
};

export const getAchievements = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/achievements`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching achievements:", error);
        throw error;
    }
};

// Export API
export const exportNutritionCSV = async (startDate, endDate) => {
    try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const res = await axios.get(`${API_URL}/export/nutrition/csv?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
        });
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `nutrition-export-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        return { success: true };
    } catch (error) {
        console.error("Error exporting CSV:", error);
        throw error;
    }
};

export const exportMealsCSV = async (startDate, endDate) => {
    try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const res = await axios.get(`${API_URL}/export/meals/csv?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `meals-export-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        return { success: true };
    } catch (error) {
        console.error("Error exporting meals CSV:", error);
        throw error;
    }
};

// Leaderboard API
export const getDailyLeaderboard = async (date) => {
    try {
        const params = date ? `?date=${date}` : '';
        const res = await axios.get(`${API_URL}/leaderboard/daily${params}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching daily leaderboard:", error);
        throw error;
    }
};

export const getWeeklyLeaderboard = async (startDate) => {
    try {
        const params = startDate ? `?startDate=${startDate}` : '';
        const res = await axios.get(`${API_URL}/leaderboard/weekly${params}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching weekly leaderboard:", error);
        throw error;
    }
};

export const getUserRank = async (date) => {
    try {
        const token = localStorage.getItem('token');
        const params = date ? `?date=${date}` : '';
        const res = await axios.get(`${API_URL}/leaderboard/my-rank${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching user rank:", error);
        throw error;
    }
};