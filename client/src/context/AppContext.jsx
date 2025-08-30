import { createContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const logoutInProgress = useRef(false);
    
    // Configure axios defaults
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = backendUrl;
    
    const getAuthState = async () => {
        // Don't check auth if we're in the process of logging out
        if (logoutInProgress.current) return;
        
        try {
            setIsLoading(true);
            const { data } = await axios.get("/api/auth/is-auth");
            if (data.success) {
                setIsLoggedIn(true);
                await getUserData();
            } else {
                setIsLoggedIn(false);
                setUserData(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // If it's a 401 error, clear state but don't redirect
            if (error.response?.status === 401) {
                setIsLoggedIn(false);
                setUserData(null);
                // Clear any stored tokens
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            } else {
                setIsLoggedIn(false);
                setUserData(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getUserData = async () => {
        try {
            const { data } = await axios.get('/api/auth/data');
            if (data.success) {
                setUserData(data.userData);
            } else {
                console.error('Failed to get user data:', data.message);
                setIsLoggedIn(false);
                setUserData(null);
            }
        } catch (error) {
            console.error('Get user data error:', error);
            setIsLoggedIn(false);
            setUserData(null);
        }
    };

    const logout = async () => {
        if (logoutInProgress.current) {
            console.log('Logout already in progress, ignoring call');
            return; // Prevent multiple logout calls
        }
        
        try {
            console.log('Starting logout process...');
            logoutInProgress.current = true;
            setIsLoading(true);
            
            // Call backend logout endpoint
            console.log('Calling backend logout endpoint...');
            const response = await axios.post("/api/auth/logout");
            console.log('Backend logout response:', response.data);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            console.log('Clearing frontend state...');
            // Clear frontend state
            setIsLoggedIn(false);
            setUserData(null);
            // Clear any stored tokens/cookies
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            // Reset logout flag after a short delay to allow redirect
            setTimeout(() => {
                console.log('Redirecting to login page...');
                logoutInProgress.current = false;
                // Redirect to login page
                window.location.href = '/login';
            }, 100);
        }
    };

    const refreshAuth = async () => {
        await getAuthState();
    };

    useEffect(() => {
        getAuthState();
    }, []);

    const value = {
        backendUrl,
        isLoggedIn, 
        setIsLoggedIn,
        userData, 
        setUserData,
        isLoading,
        logout,
        refreshAuth
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
