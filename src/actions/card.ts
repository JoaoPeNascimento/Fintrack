'use server';

import dbConnect from '@/lib/mongoose';
import Card from '@/models/Card';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function createCard(formData: {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      throw new Error("Você precisa estar logado para criar um cartão.");
    }
    
    const userId = (session.user as any).id;

    if (!userId) {
       throw new Error("ID de usuário não encontrado!");
    }

    await dbConnect();

    const newCard = new Card({
      name: formData.name,
      limit: formData.limit,
      closingDay: formData.closingDay,
      dueDay: formData.dueDay,
      color: formData.color,
      userId,
    });

    await newCard.save();
    
    revalidatePath('/profile');
    
    // Retornamos os dados em formato raw/plain (serializáveis)
    const cardData = {
       _id: newCard._id?.toString(),
       name: newCard.name,
       limit: newCard.limit,
       closingDay: newCard.closingDay,
       dueDay: newCard.dueDay,
       color: newCard.color,
    };
    
    return { success: true, message: 'Cartão registrado com sucesso!', card: cardData };
  } catch (error: any) {
    console.error('Error creating Card:', error);
    return { success: false, message: error.message || 'Falha ao salvar o cartão no banco de dados.' };
  }
}

export async function getUserCards() {
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

    const allCards = await Card.find({ userId }).sort({ createdAt: -1 }).lean();

    const plainCards = allCards.map((c: any) => ({
      id: c._id?.toString(),
      name: c.name,
      limit: c.limit,
      closingDay: c.closingDay,
      dueDay: c.dueDay,
      color: c.color,
    }));

    return { success: true, data: plainCards };
  } catch (error: any) {
    console.error('Error fetching cards:', error);
    return { success: false, data: [] };
  }
}
