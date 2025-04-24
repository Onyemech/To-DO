export const getUserDetails = () => {
    try {
        const userData = localStorage.getItem('user');
        if (!userData) {
            console.warn('No user data found in localStorage');
            return null;
        }
        return JSON.parse(userData);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

