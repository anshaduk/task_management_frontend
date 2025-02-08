import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await axios.get("http://127.0.0.1:8000/api/tasks/", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(response.data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();
    }, [navigate]);

    return (
        <div>
            <h2>Welcome, {localStorage.getItem("username")}</h2>
            <h3>Assigned Tasks</h3>
            <ul>
                {tasks.length === 0 ? <p>No tasks assigned.</p> : tasks.map((task) => (
                    <li key={task.id}>{task.title} - {task.description}</li>
                ))}
            </ul>
            <button onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</button>
        </div>
    );
};

export default Dashboard;
