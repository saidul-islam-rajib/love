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
    successSubtext: string;
    recipientEmail: string;
    footerName: string;
    footerFacebookUrl: string;
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
        successSubtext: "",
        recipientEmail: "",
        footerName: "",
        footerFacebookUrl: ""
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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(config),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Configuration saved successfully!");
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage(`Failed to save: ${data.error || 'Unknown error'}`);
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
                                <small>If enabled, users must sign in with Google to provide their email. If disabled, no authentication is required.</small>
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

                            <div className="form-group">
                                <label htmlFor="successSubtext">Success Subtext</label>
                                <input
                                    type="text"
                                    id="successSubtext"
                                    value={config.successSubtext}
                                    onChange={(e) => setConfig({ ...config, successSubtext: e.target.value })}
                                    required
                                />
                                <small>This text appears below the success title in the celebration screen</small>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2>Footer Settings</h2>

                            <div className="form-group">
                                <label htmlFor="footerName">Footer Name</label>
                                <input
                                    type="text"
                                    id="footerName"
                                    value={config.footerName}
                                    onChange={(e) => setConfig({ ...config, footerName: e.target.value })}
                                    required
                                />
                                <small>Your name that will appear in the footer</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="footerFacebookUrl">Facebook Profile URL</label>
                                <input
                                    type="url"
                                    id="footerFacebookUrl"
                                    value={config.footerFacebookUrl}
                                    onChange={(e) => setConfig({ ...config, footerFacebookUrl: e.target.value })}
                                    placeholder="https://facebook.com/your.profile"
                                    required
                                />
                                <small>Your Facebook profile link (must start with https://)</small>
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
                            {config.requireEmail ? (
                                <div className="preview-auth">
                                    <div className="google-signin-preview">
                                        <svg className="google-icon-small" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Sign in with Google
                                    </div>
                                    <small>Users will authenticate with Google first</small>
                                </div>
                            ) : (
                                <div className="preview-no-auth">
                                    <small>✅ No authentication required - users can proceed directly</small>
                                </div>
                            )}
                            <div className="preview-buttons">
                                <button className="preview-yes">Yes</button>
                                <button className="preview-no">No</button>
                            </div>
                            <div className="preview-success">
                                <h5>Success Screen Preview:</h5>
                                <div className="success-preview">
                                    <strong>{config.successTitle || "Success title will appear here"}</strong>
                                    <p>{config.successSubtext || "Success subtext will appear here"}</p>
                                    <small>{config.successMessage || "Success message will appear here"}</small>
                                </div>
                            </div>
                            <div className="preview-footer">
                                <p>Made with ❤️ by <a href={config.footerFacebookUrl || "#"} target="_blank" rel="noopener noreferrer">
                                    📘 {config.footerName || "Your Name"}
                                </a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
