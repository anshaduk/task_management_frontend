import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faClock,
  faCheckCircle,
  faSpinner,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";


const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;


const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Poppins', sans-serif;
  padding: 2rem;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  animation: ${fadeIn} 0.3s ease-out;
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const TaskCard = styled.article`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  animation: ${fadeIn} 0.3s ease-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.1);
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: 1.5rem;
  gap: 0.6rem;
  background: ${({ status }) =>
    status === 'pending' ? '#fef3c7' :
    status === 'in progress' ? '#dbeafe' : '#dcfce7'};
  color: ${({ status }) =>
    status === 'pending' ? '#92400e' :
    status === 'in progress' ? '#1e40af' : '#166534'};
`;

const Button = styled.button`
  padding: 0.8rem 1.8rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const LogoutButton = styled(Button)`
  background: #ef4444;
  color: white;
  font-size: 0.95rem;
`;

const Select = styled.select`
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  width: 100%;
  margin-top: 1.5rem;
  background: white;
  transition: border-color 0.2s;
  appearance: none;

  &:focus {
    outline: none;
    border-color: #94a3b8;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 1.5rem;
  color: #64748b;

  svg {
    font-size: 2.5rem;
    animation: ${spin} 1s linear infinite;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 1.5rem;
  color: #64748b;

  svg {
    font-size: 3rem;
    opacity: 0.8;
  }
`;

const ErrorMessage = styled.div`
  padding: 1.5rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
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

        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setError("Error fetching tasks. Please try again later.");
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
          alert("Both worked hours and completion report are required.");
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

      if (!response.ok) throw new Error("Failed to update status");
      const updatedTask = await response.json();

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );
    } catch (error) {
      console.error("Update error:", error);
      setError("Failed to update task. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <DashboardContainer>
      <MainContent>
        <Header>
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
              Welcome, {localStorage.getItem("username")}
            </h1>
            <p style={{ color: "#64748b" }}>{tasks.length} active tasks</p>
          </div>
          <LogoutButton onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </LogoutButton>
        </Header>

        {error && (
          <ErrorMessage>
            <FontAwesomeIcon icon={faExclamationCircle} />
            {error}
          </ErrorMessage>
        )}

        {loading ? (
          <LoadingState>
            <FontAwesomeIcon icon={faSpinner} />
            <p>Loading your tasks...</p>
          </LoadingState>
        ) : tasks.length === 0 ? (
          <EmptyState>
            <FontAwesomeIcon icon={faClock} />
            <p>No tasks assigned yet</p>
          </EmptyState>
        ) : (
          <TaskGrid>
            {tasks.map(task => (
              <TaskCard key={task.id}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "0.8rem" }}>
                  {task.title}
                </h3>
                <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                  {task.description}
                </p>

                <StatusBadge status={task.status.toLowerCase()}>
                  <FontAwesomeIcon
                    icon={
                      task.status === "completed"
                        ? faCheckCircle
                        : task.status === "in progress"
                        ? faSpinner
                        : faClock
                    }
                  />
                  {task.status}
                </StatusBadge>

                {task.status !== "completed" && (
                  <Select
                    value={task.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      if (newStatus === "completed") {
                        const workedHours = prompt(
                          "Enter total worked hours (e.g., 3.5):"
                        );
                        const report = prompt("Enter completion report:");
                        if (workedHours && report) {
                          handleStatusUpdate(
                            task.id,
                            newStatus,
                            workedHours,
                            report
                          );
                        }
                      } else {
                        handleStatusUpdate(task.id, newStatus);
                      }
                    }}
                    disabled={isUpdating}
                  >
                    <option value="pending">Pending</option>
                    <option value="in Progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Select>
                )}

                {task.status === "completed" && (
                  <div style={{ marginTop: "1.5rem" }}>
                    <p style={{ marginBottom: "0.5rem" }}>
                      <strong>Hours Worked:</strong> {task.worked_hours}
                    </p>
                    <p>
                      <strong>Report:</strong> {task.completion_report}
                    </p>
                  </div>
                )}
              </TaskCard>
            ))}
          </TaskGrid>
        )}
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;