// Shared email logs storage
// In serverless, this will persist within the same function instance
let emailLogs: any[] = [];

export function addEmailLog(log: any) {
    emailLogs.unshift(log);
    // Keep only last 100 entries
    if (emailLogs.length > 100) {
        emailLogs = emailLogs.slice(0, 100);
    }
}

export function getEmailLogs() {
    return [...emailLogs]; // Return a copy
}

export function clearEmailLogs() {
    emailLogs = [];
}
