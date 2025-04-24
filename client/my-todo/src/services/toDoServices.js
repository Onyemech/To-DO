import axios from 'axios';
import { getUserDetails } from "../util/GetUser.js";

const SERVER_URL = "http://localhost:5000/api/toDo";

const getAuthHeaders = () => {
    const user = getUserDetails();
    if (!user?.token) {
        console.error("No token found in user details");
        throw new Error("Authentication token missing");
    }
    return {
        headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        }
    };
};

const handleRequest = async (method, url, data = null) => {
    try {
        const config = {
            method,
            url: `${SERVER_URL}${url}`,
            ...getAuthHeaders()
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);

        if (!response.data) {
            throw new Error("Invalid response from server");
        }

        return response.data;
    } catch (error) {
        const errorDetails = {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: `${SERVER_URL}${url}`,
            method
        };
        console.error("API Error:", errorDetails);

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        throw new Error(error.response?.data?.message ||
            error.message ||
            "An error occurred during the API request");
    }
};

export default {
    createToDo: async (data) => {
        if (!data || typeof data !== 'object') {
            throw new Error("Task data must be an object");
        }
        if (!data.title || typeof data.title !== 'string') {
            throw new Error("Title is required and must be a string");
        }
        return handleRequest('post', '/create-to-do', data);
    },

    updateToDo: async (taskId, data, updateType = 'status') => {
        if (!taskId) throw new Error("Task ID required");
        return handleRequest('patch', `/update-to-do/${taskId}`, {
            ...data,
            updateType
        });
    },

    deleteToDo: async (taskId) => {
        if (!taskId) {
            throw new Error("Task ID is required");
        }
        return handleRequest('delete', `/delete-to-do/${taskId}`);
    },

    getAllToDo: async (userId) => {
        if (!userId) {
            throw new Error("User ID is required");
        }
        return handleRequest('get', `/get-all-to-do/${userId}`);
    },

};