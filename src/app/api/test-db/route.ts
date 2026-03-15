import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    const connectionState = mongoose.connection.readyState;
    
    return NextResponse.json(
      { 
        status: 'success', 
        message: 'Successfully connected to MongoDB', 
        readyState: connectionState 
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to connect to MongoDB', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
