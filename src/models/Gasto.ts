import mongoose, { Schema, Document } from 'mongoose';

export interface IGasto extends Document {
  name: string;
  description?: string;
  value: number;
  date: Date;
  payment_method: 'CARTAO' | 'PIX' | 'DINHEIRO';
  installments?: number;
}

const GastoSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the expense.'],
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  value: {
    type: Number,
    required: [true, 'Please provide a value for the expense.'],
    min: [0, 'Value cannot be negative.'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide the date of the expense.'],
    default: Date.now,
  },
  payment_method: {
    type: String,
    required: [true, 'Please specify a payment method.'],
    enum: ['CARTAO', 'PIX', 'DINHEIRO'],
  },
  installments: {
    type: Number,
    required: false,
    default: 1,
    min: [1, 'At least 1 installment is required.'],
  },
}, { 
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Use existing model if it exists (for Next.js HMR) or create a new one
export default mongoose.models.Gasto || mongoose.model<IGasto>('Gasto', GastoSchema);
