import React, { createContext, useContext, useState, useEffect } from 'react';

const EmployeeAuthContext = createContext();

export const useEmployeeAuth = () => {
    const context = useContext(EmployeeAuthContext);
    if (!context) {
        throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
    }
    return context;
};

export const EmployeeAuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if employee is logged in (from localStorage)
        const storedEmployee = localStorage.getItem('employee');
        if (storedEmployee) {
            setEmployee(JSON.parse(storedEmployee));
        }
        setIsLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/users/employee-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setEmployee(data.user);
                localStorage.setItem('employee', JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        setEmployee(null);
        localStorage.removeItem('employee');
    };

    const value = {
        employee,
        login,
        logout,
        isLoading,
        isAuthenticated: !!employee,
    };

    return (
        <EmployeeAuthContext.Provider value={value}>
            {children}
        </EmployeeAuthContext.Provider>
    );
};
