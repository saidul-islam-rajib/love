import { NextRequest } from 'next/server';
import { clearEmailLogs } from '../../../../lib/db';
import { isAuthorizedAdmin } from '../../../../lib/adminAuth';

export async function DELETE(req: NextRequest) {
    if (!isAuthorizedAdmin(req)) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

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