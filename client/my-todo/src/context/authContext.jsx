import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify({
            ...userData,
            _lastUpdate: Date.now()
        }));
        setUser(userData);
        window.dispatchEvent()
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('authChange'));
    };

    useEffect(() => {
        const handleStorageChange = () => {
            const userData = localStorage.getItem('user');
            setUser(userData ? JSON.parse(userData) : null);
        };

        window.addEventListener('storage', handleStorageChange);
        handleStorageChange();

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);