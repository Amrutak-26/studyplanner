import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [topic, setTopic] = useState("");
  const [hours, setHours] = useState(2);
  const [days, setDays] = useState(7);
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Unknown");

  useEffect(() => {
    const root = window.document.documentElement;
    darkMode ? root.classList.add("dark") : root.classList.remove("dark");
    
    // Test connection on component mount
    testConnection();
  }, [darkMode]);

  const testConnection = async () => {
    try {
      const API_BASE = "https://study-plannerback.onrender.com";
      
      // Try multiple endpoints to test connection
      const endpoints = ['/health', '/', '/test'];
      let connected = false;
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${API_BASE}${endpoint}`, { timeout: 15000 });
          console.log(`Connection test successful on ${endpoint}:`, response.data);
          connected = true;
          break;
        } catch (err) {
          console.log(`Failed to connect to ${endpoint}:`, err.message);
        }
      }
      
      if (connected) {
        setConnectionStatus("Connected ✅");
      } else {
        setConnectionStatus("Disconnected ❌");
      }
    } catch (error) {
      setConnectionStatus("Disconnected ❌");
      console.error("All connection tests failed:", error.message);
    }
  };

  const generatePlan = async () => {
    if (!topic.trim() || hours <= 0 || days <= 0) {
      alert("Please enter valid inputs!");
      return;
    }

    setLoading(true);

    try {
      const API_BASE = "https://study-plannerback.onrender.com";
      
      console.log("Making request to:", `${API_BASE}/generate_plan`);

      // First, test if the backend is reachable
      try {
        const healthCheck = await axios.get(`${API_BASE}/test`, { timeout: 10000 });
        console.log("Backend test successful:", healthCheck.data);
      } catch (healthErr) {
        console.warn("Backend test failed, proceeding anyway:", healthErr.message);
      }

      const res = await axios.post(`${API_BASE}/generate_plan`, {
        topic: topic.trim(),
        hours_per_day: Number(hours),
        days: Number(days),
        goal: goal.trim(),
      }, {
        timeout: 60000, // 60 second timeout for AI generation
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      console.log("Response received:", res.data);

      if (res.data.error) {
        alert(`Failed to generate plan: ${res.data.error}`);
        setPlan([]);
      } else if (Array.isArray(res.data) && res.data.length > 0) {
        const formatted = res.data.map((p) => ({
          ...p,
          TasksStatus: p.Tasks ? p.Tasks.map(() => false) : [],
        }));
        setPlan(formatted);
      } else {
        alert("Invalid response format from server");
        setPlan([]);
      }
    } catch (err) {
      console.error("Error details:", err);
      
      if (err.code === 'ECONNABORTED') {
        alert("Request timed out. The AI is taking too long to respond. Please try again.");
      } else if (err.response) {
        // Server responded with error status
        const errorMsg = err.response.data?.error || err.response.data?.message || "Server error";
        alert(`Server error (${err.response.status}): ${errorMsg}`);
      } else if (err.request) {
        // Request was made but no response received
        console.error("Network error details:", err.request);
        alert("Cannot connect to server. Please check:\n1. Your internet connection\n2. Backend server is running\n3. CORS is properly configured");
      } else {
        // Something else happened
        alert(`Error: ${err.message}`);
      }
      setPlan([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (dayIdx, taskIdx) => {
    const newPlan = [...plan];
    newPlan[dayIdx].TasksStatus[taskIdx] = !newPlan[dayIdx].TasksStatus[taskIdx];
    setPlan(newPlan);
  };

  const calculateProgress = (TasksStatus) => {
    const done = TasksStatus.filter(Boolean).length;
    return (done / TasksStatus.length) * 100;
  };

  return (
    <div className="min-h-screen p-6 font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="flex justify-between items-center max-w-4xl mx-auto mb-6">
        <div>
          <h1 className="text-3xl font-bold">📅 AI Study Planner</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Backend Status: <span className="font-semibold">{connectionStatus}</span>
            <button 
              onClick={testConnection}
              className="ml-2 text-blue-500 hover:text-blue-700 underline text-xs"
            >
              Test Connection
            </button>
          </p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-xl mx-auto mb-6 transition-colors duration-300">
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Topic</label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Enter the subject or topic you want to learn (e.g., Python programming).
          </p>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Hours per Day</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Number of Days</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Goal</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors"
            rows={3}
          />
        </div>

        <button
          onClick={generatePlan}
          disabled={loading}
          className="
            w-full py-2 rounded text-white font-bold
            bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500
            hover:from-blue-400 hover:via-purple-400 hover:to-indigo-400
            shadow-md shadow-black/30
            hover:shadow-[0_0_20px_rgba(128,0,255,0.9)] hover:scale-105
            transition duration-300 transform
          "
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid gap-4 md:grid-cols-2">
        {plan.map((day, dayIdx) => (
          <div
            key={dayIdx}
            className="p-4 rounded-lg shadow-md border-l-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          >
            <h2 className="text-xl font-bold mb-2">Day {day.Day}</h2>
            <p className="mb-2"><strong>Topics:</strong> {day.Topics.join(", ")}</p>
            <ul>
              {day.Tasks.map((task, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={day.TasksStatus[idx]}
                    onChange={() => toggleTask(dayIdx, idx)}
                  />
                  <span className={day.TasksStatus[idx] ? "line-through text-gray-400" : ""}>
                    {task}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2"><strong>Quiz:</strong> {day.Quiz}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${calculateProgress(day.TasksStatus)}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1 text-gray-600">
              Progress: {Math.round(calculateProgress(day.TasksStatus))}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
