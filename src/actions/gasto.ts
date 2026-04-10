'use server';

import dbConnect from '@/lib/mongoose';
import Gasto from '@/models/Gasto';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function createGasto(prevState: any, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      throw new Error("You must be logged in to create an expense.");
    }
    
    // We already retrieve User._id into session.user.id in the NextAuth configuration
    const userId = (session.user as any).id;

    if (!userId) {
       throw new Error("User ID could not be found.");
    }

    await dbConnect();

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const valueStr = formData.get('value') as string;
    const value = parseFloat(valueStr);
    const dateStr = formData.get('date') as string;
    const date = dateStr ? new Date(dateStr) : new Date();
    const installmentsStr = formData.get('installments') as string;
    const installments = installmentsStr ? parseInt(installmentsStr, 10) : 1;
    const description = formData.get('description') as string;
    
    let payment_method = formData.get('payment_method') as string;
    let cardId: string | undefined = undefined;

    if (payment_method && payment_method.startsWith('CARD_')) {
      cardId = payment_method.replace('CARD_', '');
      payment_method = 'CARTAO';
    }

    if (id) {
      await Gasto.updateOne({ _id: id, userId }, {
        name,
        value,
        date,
        payment_method,
        installments,
        description,
        cardId,
      });
      revalidatePath('/dashboard');
      revalidatePath('/profile');
      return { success: true, message: 'Gasto atualizado com sucesso!' };
    } else {
      const newGasto = new Gasto({
        name,
        value,
        date,
        payment_method,
        installments,
        description,
        cardId,
        userId,
      });

      await newGasto.save();
      
      // Invalidate the cache for the dashboard page so new data appears
      revalidatePath('/dashboard');
      revalidatePath('/profile');
      
      return { success: true, message: 'Gasto registrado com sucesso!' };
    }
  } catch (error: any) {
    console.error('Error creating Gasto:', error);
    return { success: false, message: error.message || 'Failed to create expense.' };
  }
}

export async function getUserGastos() {
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

    // Fetch all for user and sort by date descending
    const allGastos = await Gasto.find({ userId }).sort({ date: -1 }).lean();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const gastos = allGastos.filter((g: any) => {
      if (!g.date) return false;
      
      const gDate = new Date(g.date);
      const gYear = gDate.getFullYear();
      const gMonth = gDate.getMonth();

      // Gastos do mês atual (ou futuros)
      if (gYear > currentYear || (gYear === currentYear && gMonth >= currentMonth)) {
        return true;
      }

      // Gastos de meses anteriores com > 1 parcela
      if (g.installments && g.installments > 1) {
        const monthsPassed = (currentYear - gYear) * 12 + (currentMonth - gMonth);
        // Só continua aparecendo se o número de meses que se passaram 
        // for menor que o total de parcelas
        return monthsPassed < g.installments;
      }

      return false;
    });

    const plainGastos = gastos.map((g: any) => ({
      _id: g._id?.toString(),
      name: g.name,
      value: g.value,
      date: g.date ? new Date(g.date).toISOString() : null,
      payment_method: g.payment_method,
      installments: g.installments,
      description: g.description,
      cardId: g.cardId,
    }));

    return { success: true, data: plainGastos };
  } catch (error: any) {
    console.error('Error fetching Gastos:', error);
    return { success: false, data: [] };
  }
}

export async function getMonthlyExpenseSummary() {
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

    // Group expenses by month and year using MongoDB aggregation
    const pipeline = [
      { $match: { userId: userId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalAmount: { $sum: "$value" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": -1 as const,
          "_id.month": -1 as const
        }
      }
    ];

    const results = await Gasto.aggregate(pipeline);

    // Format the results for the frontend
    const formattedData = results.map((result: any) => {
      const monthStr = result._id.month.toString().padStart(2, '0');
      const yearStr = result._id.year.toString();
      
      const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      
      return {
        month: result._id.month,
        year: result._id.year,
        label: `${monthNames[result._id.month - 1]} ${yearStr}`,
        shortLabel: `${monthStr}/${yearStr}`,
        totalAmount: result.totalAmount,
        expenseCount: result.count
      };
    });

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error('Error fetching monthly summary:', error);
    return { success: false, data: [] };
  }
}

export async function getExpensesByMonthAndYear(month: number, year: number) {
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

    // Create date boundaries for the query
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const gastos = await Gasto.find({ 
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 }).lean();

    const plainGastos = gastos.map((g: any) => ({
      _id: g._id?.toString(),
      name: g.name,
      value: g.value,
      date: g.date ? g.date.toISOString() : null,
      payment_method: g.payment_method,
      installments: g.installments,
      description: g.description,
      cardId: g.cardId,
    }));

    return { success: true, data: plainGastos };
  } catch (error: any) {
    console.error('Error fetching expenses for month:', error);
    return { success: false, data: [] };
  }
}

export async function deleteGasto(id: string) {
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

    const result = await Gasto.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Gasto não encontrado ou não autorizado.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/profile');

    return { success: true, message: 'Gasto excluído com sucesso!' };
  } catch (error: any) {
    console.error('Error deleting Gasto:', error);
    return { success: false, message: error.message || 'Erro ao excluir gasto.' };
  }
}
