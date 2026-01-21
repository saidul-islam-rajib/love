"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EmailLog {
    timestamp: string;
    to: string;
    subject: string;
    message: string;
    userAgent: string;
    ip: string;
    location: string;
    userName: string;
    userEmail: string;
    device: string;
    browser: string;
    os: string;
    status: string;
    configSnapshot?: {
        title: string;
        description: string;
        successTitle: string;
        successMessage: string;
        successSubtext: string;
        requireEmail: boolean;
    };
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [clearingLogs, setClearingLogs] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if already authenticated
        const auth = sessionStorage.getItem("admin_auth");
        if (auth === "true") {
            setIsAuthenticated(true);
            fetchLogs();
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (username === "rajib1983" && password === "AdminRajib@123#") {
            sessionStorage.setItem("admin_auth", "true");
            setIsAuthenticated(true);
            fetchLogs();
        } else {
            setError("Invalid username or password");
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/logs");
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
            }
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("admin_auth");
        setIsAuthenticated(false);
        setUsername("");
        setPassword("");
    };

    const handleClearAllLogs = async () => {
        setClearingLogs(true);
        try {
            const res = await fetch("/api/admin/clear-logs", {
                method: "DELETE"
            });

            if (res.ok) {
                setLogs([]);
                setShowClearConfirm(false);
                // Show success message briefly
                const successMsg = document.createElement('div');
                successMsg.className = 'clear-success-message';
                successMsg.textContent = 'All logs cleared successfully!';
                document.body.appendChild(successMsg);
                setTimeout(() => {
                    document.body.removeChild(successMsg);
                }, 3000);
            } else {
                alert('Failed to clear logs. Please try again.');
            }
        } catch (err) {
            alert('Error clearing logs. Please try again.');
        } finally {
            setClearingLogs(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login">
                <div className="login-card">
                    <h1>Admin Login</h1>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" className="login-btn">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="header-buttons">
                    <button onClick={() => router.push("/admin/config")} className="config-btn">
                        ⚙️ Configuration
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="stats-card">
                    <h2>Email Logs</h2>
                    <p className="total-count">Total Clicks: {logs.length}</p>
                    <div className="stats-actions">
                        <button onClick={fetchLogs} className="refresh-btn" disabled={loading}>
                            {loading ? "Loading..." : "Refresh"}
                        </button>
                        {logs.length > 0 && (
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="clear-btn"
                                disabled={clearingLogs}
                            >
                                🗑️ Clear All
                            </button>
                        )}
                    </div>
                </div>

                <div className="logs-table-container">
                    {logs.length === 0 ? (
                        <p className="no-logs">No logs found</p>
                    ) : (
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Timestamp</th>
                                    <th>User Info</th>
                                    <th>Location</th>
                                    <th>Device Info</th>
                                    <th>IP Address</th>
                                    <th>Status</th>
                                    <th>Config at Submission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, index) => (
                                    <tr key={index}>
                                        <td>{logs.length - index}</td>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="user-info-cell">
                                            <div className="user-name">{log.userName || 'Anonymous'}</div>
                                            <div className="user-email">{log.userEmail || 'Not provided'}</div>
                                        </td>
                                        <td className="location">{log.location || 'Unknown'}</td>
                                        <td className="device-info">
                                            <div>{log.device || 'Unknown'}</div>
                                            <div className="browser-os">{log.browser || 'Unknown'} / {log.os || 'Unknown'}</div>
                                        </td>
                                        <td>{log.ip || "N/A"}</td>
                                        <td className="status">{log.status || 'LOGGED'}</td>
                                        <td className="config-snapshot">
                                            {log.configSnapshot ? (
                                                <div className="config-details">
                                                    <div className="config-title" title={log.configSnapshot.title}>
                                                        <strong>Title:</strong> {log.configSnapshot.title.substring(0, 30)}...
                                                    </div>
                                                    <div className="config-desc" title={log.configSnapshot.description}>
                                                        <strong>Desc:</strong> {log.configSnapshot.description.substring(0, 40)}...
                                                    </div>
                                                    <div className="config-success">
                                                        <strong>Success:</strong> {log.configSnapshot.successTitle}
                                                    </div>
                                                    <div className="config-subtext">
                                                        <strong>Subtext:</strong> {log.configSnapshot.successSubtext}
                                                    </div>
                                                    <div className="config-email">
                                                        <strong>Required Email:</strong> {log.configSnapshot.requireEmail ? 'Yes' : 'No'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="no-config">No config data</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Clear Confirmation Modal */}
                {showClearConfirm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>⚠️ Clear All Logs</h3>
                            <p>Are you sure you want to delete all {logs.length} response logs?</p>
                            <p className="warning-text">This action cannot be undone and will permanently delete:</p>
                            <ul className="warning-list">
                                <li>All user responses and submissions</li>
                                <li>All configuration snapshots</li>
                                <li>All user information and device data</li>
                                <li>All cached data from Redis/memory</li>
                            </ul>
                            <div className="modal-actions">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="cancel-btn"
                                    disabled={clearingLogs}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAllLogs}
                                    className="confirm-clear-btn"
                                    disabled={clearingLogs}
                                >
                                    {clearingLogs ? "Clearing..." : "Yes, Clear All"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
