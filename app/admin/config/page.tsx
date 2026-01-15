"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AppConfig {
    title: string;
    description: string;
    requireEmail: boolean;
    emailLabel: string;
    successTitle: string;
    successMessage: string;
    recipientEmail: string;
}

export default function AdminConfig() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [config, setConfig] = useState<AppConfig>({
        title: "",
        description: "",
        requireEmail: false,
        emailLabel: "Your email address",
        successTitle: "",
        successMessage: "",
        recipientEmail: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        const auth = sessionStorage.getItem("admin_auth");
        if (auth === "true") {
            setIsAuthenticated(true);
            fetchConfig();
        } else {
            router.push("/admin");
        }
    }, [router]);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/config");
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
            }
        } catch (err) {
            console.error("Failed to fetch config:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                setMessage("Configuration saved successfully!");
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage("Failed to save configuration");
            }
        } catch (err) {
            setMessage("Error saving configuration");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return <div>Loading...</div>;
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>App Configuration</h1>
                <button onClick={() => router.push("/admin")} className="logout-btn">
                    Back to Dashboard
                </button>
            </header>

            <div className="dashboard-content">
                <div className="config-form-container">
                    <form onSubmit={handleSave} className="config-form">
                        <div className="form-section">
                            <h2>Main Content</h2>

                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={config.title}
                                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={config.description}
                                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                    rows={6}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h2>Email Settings</h2>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={config.requireEmail}
                                        onChange={(e) => setConfig({ ...config, requireEmail: e.target.checked })}
                                    />
                                    <span>Require user email address</span>
                                </label>
                            </div>

                            {config.requireEmail && (
                                <div className="form-group">
                                    <label htmlFor="emailLabel">Email Field Label</label>
                                    <input
                                        type="text"
                                        id="emailLabel"
                                        value={config.emailLabel}
                                        onChange={(e) => setConfig({ ...config, emailLabel: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="recipientEmail">Recipient Email (where notifications are sent)</label>
                                <input
                                    type="email"
                                    id="recipientEmail"
                                    value={config.recipientEmail}
                                    onChange={(e) => setConfig({ ...config, recipientEmail: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h2>Success Message</h2>

                            <div className="form-group">
                                <label htmlFor="successTitle">Success Title</label>
                                <input
                                    type="text"
                                    id="successTitle"
                                    value={config.successTitle}
                                    onChange={(e) => setConfig({ ...config, successTitle: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="successMessage">Success Message</label>
                                <input
                                    type="text"
                                    id="successMessage"
                                    value={config.successMessage}
                                    onChange={(e) => setConfig({ ...config, successMessage: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                                {message}
                            </div>
                        )}

                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? "Saving..." : "Save Configuration"}
                        </button>
                    </form>

                    <div className="preview-section">
                        <h3>Preview</h3>
                        <div className="preview-card">
                            <h4>{config.title || "Title will appear here"}</h4>
                            <p>{config.description || "Description will appear here"}</p>
                            {config.requireEmail && (
                                <div className="preview-email">
                                    <label>{config.emailLabel}</label>
                                    <input type="email" placeholder="user@example.com" disabled />
                                </div>
                            )}
                            <div className="preview-buttons">
                                <button className="preview-yes">Yes</button>
                                <button className="preview-no">No</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
