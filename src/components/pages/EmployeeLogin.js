import React, { useState } from 'react';
import { useEmployeeAuth } from './EmployeeAuthContext';
import { useNavigate } from 'react-router-dom';
import '../../Stylesheets/EmployeeLogin.css';

const EmployeeLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useEmployeeAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate('/employee/dashboard');
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    return (
        <div className="employee-login-container">
            <div className="employee-login-card">
                <h2>Employee Portal Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="login-footer">
                    <p>Contact HR if you need help with your credentials.</p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;
