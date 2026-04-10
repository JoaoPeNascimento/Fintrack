import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  userId: string;
}

const CardSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'O nome do cartão é obrigatório'],
  },
  limit: {
    type: Number,
    required: [true, 'O limite do cartão é obrigatório'],
  },
  closingDay: {
    type: Number,
    required: [true, 'O dia de fechamento é obrigatório'],
  },
  dueDay: {
    type: Number,
    required: [true, 'O dia de vencimento é obrigatório'],
  },
  color: {
    type: String,
    required: [true, 'A cor do cartão é obrigatória'],
  },
  userId: {
    type: String,
    required: [true, 'Identificador de usuário é obrigatório'],
  }
}, { 
  timestamps: true
});

export default mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema);
