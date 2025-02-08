import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await axios.get("http://127.0.0.1:8000/tasks/", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(response.data);
            } catch (error) {
                setError("Error fetching tasks.");
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [navigate]);

    const handleStatusUpdate = async (taskId, newStatus) => {
        const token = localStorage.getItem("access_token");
        try {
            const response = await axios.patch(
                `http://127.0.0.1:8000/tasks/${taskId}/`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId ? { ...task, status: newStatus } : task
                    )
                );
            }
        } catch (error) {
            console.error("Error updating task status:", error);
            setError("Failed to update task status.");
        }
    };

    const handleSubmitReport = async (taskId) => {
        const token = localStorage.getItem("access_token");

        const workedHours = prompt("Enter Worked Hours:");
        const report = prompt("Enter Completion Report:");

        if (!workedHours || isNaN(workedHours) || !report) {
            alert("Invalid input. Please enter valid worked hours and a report.");
            return;
        }

        try {
            const response = await axios.patch(
                `http://127.0.0.1:8000/tasks/${taskId}/`,
                {
                    worked_hours: parseFloat(workedHours),
                    completion_report: report,
                    status: "Completed"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId
                            ? { ...task, status: "Completed", worked_hours: workedHours, completion_report: report }
                            : task
                    )
                );
            }
        } catch (error) {
            console.error("Error submitting completion report:", error);
            setError("Failed to submit report.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div style={styles.container}>
            <div style={styles.dashboardBox}>
                <h2 style={styles.title}>Welcome, {localStorage.getItem("username")}</h2>
                <h3 style={styles.subtitle}>Assigned Tasks</h3>

                {loading ? (
                    <p>Loading tasks...</p>
                ) : error ? (
                    <p style={styles.error}>{error}</p>
                ) : tasks.length === 0 ? (
                    <p>No tasks assigned.</p>
                ) : (
                    <ul style={styles.taskList}>
                        {tasks.map(task => (
                            <li key={task.id} style={styles.taskItem}>
                                <div>
                                    <strong>{task.title}</strong> - {task.description} <br />
                                    <span>Status: <b>{task.status}</b></span>
                                </div>

                                <div style={styles.actions}>
                                    {task.status !== "Completed" && (
                                        <>
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                                                style={styles.select}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>

                                            {task.status === "In Progress" && (
                                                <button
                                                    onClick={() => handleSubmitReport(task.id)}
                                                    style={styles.completeButton}
                                                >
                                                    Submit Report
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {task.status === "Completed" && (
                                        <div style={styles.reportBox}>
                                            <p><b>Worked Hours:</b> {task.worked_hours}</p>
                                            <p><b>Report:</b> {task.completion_report}</p>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            </div>
        </div>
    );
};

export default Dashboard;

// Styles
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f0f2f5',
    },
    dashboardBox: {
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '600px',
        textAlign: 'center',
    },
    title: {
        color: '#333',
        fontSize: '1.8rem',
    },
    subtitle: {
        marginBottom: '1rem',
        color: '#555',
        fontSize: '1.3rem',
    },
    error: {
        color: 'red',
        fontSize: '1rem',
    },
    taskList: {
        listStyleType: 'none',
        padding: 0,
    },
    taskItem: {
        backgroundColor: '#f9f9f9',
        padding: '1rem',
        margin: '0.5rem 0',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        textAlign: 'left',
    },
    actions: {
        marginTop: '0.5rem',
    },
    select: {
        padding: '0.4rem',
        fontSize: '1rem',
        borderRadius: '4px',
        marginRight: '0.5rem',
    },
    completeButton: {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#28a745',
        color: 'white',
        cursor: 'pointer',
    },
    reportBox: {
        backgroundColor: '#e9f5e9',
        padding: '0.5rem',
        borderRadius: '5px',
        marginTop: '0.5rem',
        textAlign: 'left',
    },
    logoutButton: {
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#dc3545',
        color: 'white',
        fontSize: '1rem',
        cursor: 'pointer',
    },
};
