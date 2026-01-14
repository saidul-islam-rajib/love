import fs from 'fs/promises';
import path from 'path';

export async function GET(req: Request) {
    try {
        const logPath = process.env.EMAIL_DEV_LOG || path.join(process.cwd(), 'sent-emails.log');

        // Check if log file exists
        try {
            await fs.access(logPath);
        } catch {
            return new Response(JSON.stringify({ logs: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Read the log file
        const logContent = await fs.readFile(logPath, 'utf-8');

        // Parse the logs
        const logs = parseLogFile(logContent);

        return new Response(JSON.stringify({ logs }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Error reading logs:', err);
        return new Response(JSON.stringify({ error: 'Failed to read logs', logs: [] }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function parseLogFile(content: string) {
    const logs: any[] = [];
    const entries = content.split('\n\n').filter(entry => entry.trim());

    for (const entry of entries) {
        try {
            const lines = entry.split('\n');
            const firstLine = lines[0];

            // Parse timestamp and metadata from first line
            // Format: [2024-01-15T10:30:00.000Z] TO: email FROM: email SUBJECT: subject
            const timestampMatch = firstLine.match(/\[(.*?)\]/);
            const toMatch = firstLine.match(/TO:\s*([^\s]+)/);
            const fromMatch = firstLine.match(/FROM:\s*([^\s]+)/);
            const subjectMatch = firstLine.match(/SUBJECT:\s*(.+?)(?:\s+USER_AGENT:|$)/);
            const userAgentMatch = firstLine.match(/USER_AGENT:\s*(.+?)(?:\s+IP:|$)/);
            const ipMatch = firstLine.match(/IP:\s*(.+?)$/);

            // Message is everything after the first line
            const message = lines.slice(1).join('\n').trim();

            if (timestampMatch && toMatch) {
                logs.push({
                    timestamp: timestampMatch[1],
                    to: toMatch[1],
                    from: fromMatch ? fromMatch[1] : 'N/A',
                    subject: subjectMatch ? subjectMatch[1].trim() : 'No subject',
                    message: message || 'No message',
                    userAgent: userAgentMatch ? userAgentMatch[1].trim() : 'Unknown',
                    ip: ipMatch ? ipMatch[1].trim() : 'Unknown'
                });
            }
        } catch (err) {
            console.error('Error parsing log entry:', err);
        }
    }

    // Return logs in reverse order (newest first)
    return logs.reverse();
}
