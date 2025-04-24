import axios from 'axios';
import { getAuthHeaders } from '../util/authUtils';

const SERVER_URL = "http://localhost:5000/api";

export default {
    updatePlayerId: async (playerId) => {
        try {
            console.log('Sending playerId to backend:', playerId);
            const response = await axios.post(
                `${SERVER_URL}/update-player-id`,
                { playerId },
                getAuthHeaders()
            );
            console.log('Backend response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating playerId:', error.response?.data || error.message);
            throw error;
        }
    },
};