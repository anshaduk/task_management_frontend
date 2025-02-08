import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/token/', credentials);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('username', credentials.username);
            navigate('/dashboard');
        } catch (error) {
            setError('Invalid username or password');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <h2 style={styles.title}>User Login</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.button}>
                        Login
                    </button>
                </form>
                {error && <p style={styles.error}>{error}</p>}
            </div>
        </div>
    );
};

export default Login;

// Inline styles with full centering fix
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',  // Ensure full width
        backgroundColor: '#f0f2f5',
    },
    loginBox: {
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    title: {
        marginBottom: '1.5rem',
        color: '#333333',
        fontSize: '1.5rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    input: {
        padding: '0.75rem',
        borderRadius: '4px',
        border: '1px solid #cccccc',
        fontSize: '1rem',
        outline: 'none',
        width: '100%',
    },
    button: {
        padding: '0.75rem',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: '#ffffff',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        width:'100%',
    },
    error: {
        color: '#ff0000',
        marginTop: '1rem',
        fontSize: '0.875rem',
    },
};
