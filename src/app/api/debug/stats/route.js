import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectionStats } from '@/lib/mongodb';
import requestLogger from '@/lib/request-logger';

export async function GET() {
    const poolStats = mongoose.connection.db?.serverConfig?.s?.pool;
    const stats = mongoose.connection.db?.stats();
    
    
    return NextResponse.json({
        timestamp: new Date().toISOString(),
        mongodb: {
            readyState: mongoose.connection.readyState,
            readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
            pool: {
                available: poolStats?.availableConnections,
                total: poolStats?.totalConnectionCount,
                inUse: poolStats?.totalConnectionCount - poolStats?.availableConnections,
                waitQueue: poolStats?.waitQueueSize || 0
            },
            stats: connectionStats,
            otherStats:stats,
        },
        process: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        },
        activeRequests: requestLogger.getActiveRequests()
    });
}