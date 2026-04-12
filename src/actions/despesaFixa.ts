'use server';

import dbConnect from '@/lib/mongoose';
import DespesaFixa from '@/models/DespesaFixa';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function createDespesaFixa(prevState: any, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      throw new Error("You must be logged in to create a fixed expense.");
    }
    
    const userId = (session.user as any).id;
    if (!userId) {
       throw new Error("User ID could not be found.");
    }

    await dbConnect();

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const valueStr = formData.get('value') as string;
    const value = parseFloat(valueStr);
    const description = formData.get('description') as string;
    
    if (id) {
      await DespesaFixa.updateOne({ _id: id, userId }, {
        name,
        value,
        description,
      });
      revalidatePath('/dashboard');
      revalidatePath('/profile');
      return { success: true, message: 'Despesa fixa atualizada com sucesso!' };
    } else {
      const newDespesaFixa = new DespesaFixa({
        name,
        value,
        description,
        userId,
      });

      await newDespesaFixa.save();
      
      revalidatePath('/dashboard');
      revalidatePath('/profile');
      
      return { success: true, message: 'Despesa fixa registrada com sucesso!' };
    }
  } catch (error: any) {
    console.error('Error creating DespesaFixa:', error);
    return { success: false, message: error.message || 'Falha ao criar despesa fixa.' };
  }
}

export async function getUserDespesasFixas() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return { success: false, data: [] };
    }
    
    const userId = (session.user as any).id;
    if (!userId) {
      return { success: false, data: [] };
    }

    await dbConnect();

    // Fetch all for user and sort by newest first
    const items = await DespesaFixa.find({ userId }).sort({ createdAt: -1 }).lean();

    const plainItems = items.map((g: any) => ({
      _id: g._id?.toString(),
      name: g.name,
      value: g.value,
      description: g.description,
    }));

    return { success: true, data: plainItems };
  } catch (error: any) {
    console.error('Error fetching Despesas Fixas:', error);
    return { success: false, data: [] };
  }
}

export async function deleteDespesaFixa(id: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return { success: false, message: 'Não autorizado.' };
    }
    
    const userId = (session.user as any).id;
    if (!userId) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    await dbConnect();

    const result = await DespesaFixa.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Despesa encontrada ou não autorizado.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/profile');

    return { success: true, message: 'Despesa excluída com sucesso!' };
  } catch (error: any) {
    console.error('Error deleting Despesa Fixa:', error);
    return { success: false, message: error.message || 'Erro ao excluir despesa.' };
  }
}
