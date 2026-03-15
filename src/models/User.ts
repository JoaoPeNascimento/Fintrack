import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  // Provider could be useful if we add more log in options later
  provider?: string; 
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required!'],
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  provider: {
    type: String,
    default: 'google',
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Use existing model if it exists (for Next.js HMR) or create a new one
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
