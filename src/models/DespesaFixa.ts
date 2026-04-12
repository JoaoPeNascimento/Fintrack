import mongoose, { Schema, Document } from 'mongoose';

export interface IDespesaFixa extends Document {
  name: string;
  description?: string;
  value: number;
  userId: mongoose.Types.ObjectId | string;
}

const DespesaFixaSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the fixed expense.'],
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  value: {
    type: Number,
    required: [true, 'Please provide a value for the fixed expense.'],
    min: [0, 'Value cannot be negative.'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A DespesaFixa must belong to a user.'],
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt timestamps
});

export default mongoose.models.DespesaFixa || mongoose.model<IDespesaFixa>('DespesaFixa', DespesaFixaSchema);
