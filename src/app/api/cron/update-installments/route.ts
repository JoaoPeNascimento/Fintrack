import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Gasto from '@/models/Gasto';

export async function GET(request: Request) {
  try {
    // Basic protection to ensure only authorized services (like Vercel Cron) can run this
    // You should define CRON_SECRET in your .env / Vercel Environment Variables
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find all Gastos with more than 1 installment and decrement by 1
    const result = await Gasto.updateMany(
      { installments: { $gt: 1 } },
      { $inc: { installments: -1 } }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Quantidade de parcelas atualizada com sucesso!',
      modifiedCount: result.modifiedCount
    });
  } catch (error: any) {
    console.error('Error on update-installments cron:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
