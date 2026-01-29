import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WorkItem from '@/models/WorkItem.model.js';
import { verifyToken } from '@/utils/verifyToken';

const PERIODS = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
};

export const GET = verifyToken(async (req, { params }) => {
  try {
    await connectDB();
    const { id: projectId } = params;
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '7d';
    const days = PERIODS[period] || 7;
    const now = new Date();
    const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Work items created in period
    const created = await WorkItem.countDocuments({
      project: projectId,
      createdAt: { $gte: fromDate },
    });

    // Work items completed in period (status = 'completed')
    const completed = await WorkItem.countDocuments({
      project: projectId,
      status: 'completed',
      updatedAt: { $gte: fromDate },
    });

    return NextResponse.json({
      created,
      completed,
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}); 