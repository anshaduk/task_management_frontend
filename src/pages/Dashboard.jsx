import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isUpdating, setIsUpdating] = useState(false); // Track updating state
    const navigate = useNavigate();

    
    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                handleLogout();
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:8000/tasks/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch tasks");
                }

                const data = await response.json();
                setTasks(data);
            } catch (error) {
                setError("Error fetching tasks.");
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    
    const handleStatusUpdate = async (taskId, newStatus, workedHours = null, completionReport = null) => {
        if (isUpdating) return; 
        setIsUpdating(true);

        const token = localStorage.getItem("access_token");
        try {
            const body = { status: newStatus };
            if (newStatus === "completed") {
                if (!workedHours || !completionReport) {
                    alert("Worked hours and completion report are required for completed tasks.");
                    setIsUpdating(false);
                    return;
                }
                body.worked_hours = parseFloat(workedHours);
                body.completion_report = completionReport;
            }

            const response = await fetch(`http://127.0.0.1:8000/tasks/${taskId}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            const updatedTask = await response.json();
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, ...updatedTask } : task
                )
            );
        } catch (error) {
            console.error("Error updating task status:", error);
            setError("Failed to update task status.");
        } finally {
            setIsUpdating(false);
        }
    };

    
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "in progress":
                return "bg-blue-100 text-blue-800";
            case "completed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    
    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome, {localStorage.getItem("username")}
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No tasks assigned.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {task.title}
                                            </h3>
                                            <p className="text-gray-600 mt-1">
                                                {task.description}
                                            </p>
                                            <span
                                                className={`inline-block px-2 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(
                                                    task.status
                                                )}`}
                                            >
                                                {task.status}
                                            </span>
                                        </div>

                                        {task.status !== "completed" && (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        if (newStatus === "completed") {
                                                            const workedHours = prompt("Enter Worked Hours (e.g., 2.5):");
                                                            const report = prompt("Enter Completion Report:");
                                                            if (!workedHours || !report) {
                                                                alert("Worked hours and completion report are required.");
                                                                return;
                                                            }
                                                            handleStatusUpdate(task.id, newStatus, workedHours, report);
                                                        } else {
                                                            handleStatusUpdate(task.id, newStatus);
                                                        }
                                                    }}
                                                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in Progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {task.status === "completed" && task.completion_report && (
                                        <div className="mt-4 bg-gray-50 rounded p-4">
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">
                                                    Worked Hours: {task.worked_hours}
                                                </p>
                                                <p className="mt-1 text-gray-600">
                                                    Report: {task.completion_report}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;