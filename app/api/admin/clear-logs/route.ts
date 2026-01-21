import { clearEmailLogs } from '../../../../lib/db';

export async function DELETE() {
    try {
        await clearEmailLogs();

        return new Response(JSON.stringify({
            success: true,
            message: "All logs cleared successfully"
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to clear logs',
            details: err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}