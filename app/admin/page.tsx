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
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [loading, setLoading] = useState(false);
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
                    <button onClick={fetchLogs} className="refresh-btn" disabled={loading}>
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>

                {logs.length === 0 && (
                    <div className="info-banner">
                        <h3>📝 Logs Not Showing in Production?</h3>
                        <p><strong>Why this happens:</strong> Vercel's serverless functions run in separate instances. The email submission and admin dashboard may use different instances, so in-memory logs don't sync.</p>
                        <p><strong>✅ Your submissions ARE being logged!</strong> All data is saved to Vercel function logs with clear markers.</p>
                        <p><strong>To view all submissions:</strong></p>
                        <ol>
                            <li>Go to Vercel Dashboard → Your Project → Logs tab</li>
                            <li>Look for entries with "📧 EMAIL SUBMISSION LOGGED" or "✅ EMAIL SENT"</li>
                            <li>All user data (name, email, location, device) is logged there</li>
                        </ol>
                        <p><strong>Quick test:</strong> <a href="/api/test-log" target="_blank">Add a test log</a> then refresh this page. If it appears, your instance is warm!</p>
                    </div>
                )}

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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
