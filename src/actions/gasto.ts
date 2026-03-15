'use server';

import dbConnect from '@/lib/mongoose';
import Gasto from '@/models/Gasto';
import { revalidatePath } from 'next/cache';

export async function createGasto(prevState: any, formData: FormData) {
  try {
    await dbConnect();

    const name = formData.get('name') as string;
    const valueStr = formData.get('value') as string;
    const value = parseFloat(valueStr);
    const dateStr = formData.get('date') as string;
    const date = dateStr ? new Date(dateStr) : new Date();
    const payment_method = formData.get('payment_method') as string;
    const installmentsStr = formData.get('installments') as string;
    const installments = installmentsStr ? parseInt(installmentsStr, 10) : 1;
    const description = formData.get('description') as string;

    const newGasto = new Gasto({
      name,
      value,
      date,
      payment_method,
      installments,
      description,
    });

    await newGasto.save();
    
    // Invalidate the cache for the home page so new data appears (if we list it later)
    revalidatePath('/');
    
    return { success: true, message: 'Expense added successfully!' };
  } catch (error: any) {
    console.error('Error creating Gasto:', error);
    return { success: false, message: error.message || 'Failed to create expense.' };
  }
}
