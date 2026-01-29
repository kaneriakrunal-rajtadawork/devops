import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project.model';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const iterations = [
      `${project.title}\\iteration 1`,
      `${project.title}\\iteration 2`,
      `${project.title}\\iteration 3`,
    ];
    return NextResponse.json(iterations);
  } catch (error) {
    console.error('Error fetching iterations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 