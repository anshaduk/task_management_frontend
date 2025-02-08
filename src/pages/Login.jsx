import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
    const [credentials,setCredentials] = useState({username:"",password:""})
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/token/", credentials);
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("username", credentials.username);
            navigate("/dashboard");
        } catch (error) {
            setError("Invalid username or password");
        }
    };
  return (
    <div>
       <h2>User Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}

export default Login
