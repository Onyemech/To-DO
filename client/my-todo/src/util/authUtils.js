export const getAuthHeaders = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.token) {
            console.warn('No token found');
            return {};
        }
        return { headers: { Authorization: `Bearer ${user.token}` } };
    } catch (error) {
        console.error('Error loading token:', error);
        return {};
    }
};