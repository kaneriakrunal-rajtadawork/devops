import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
    try {
        // Check MongoDB connection
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        
        if (dbStatus !== 'connected') {
            return NextResponse.json(
                { 
                    status: 'unhealthy',
                    database: dbStatus,
                    timestamp: new Date().toISOString()
                },
                { status: 503 }
            );
        }

        return NextResponse.json({
            status: 'healthy',
            database: dbStatus,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { 
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}