import { Schema, model, models, Document } from 'mongoose';

export interface AlertItem extends Document {
  userId: string;
  symbol: string;
  company: string;
  alertName: string;
  alertType: 'upper' | 'lower';
  threshold: number;
  triggered: boolean;
  triggeredAt?: Date;
  lastNotified?: Date;
  createdAt: Date;
}

const AlertSchema = new Schema<AlertItem>({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, required: true, uppercase: true, trim: true },
  company: { type: String, required: true, trim: true },
  alertName: { type: String, required: true, trim: true },
  alertType: { type: String, required: true, enum: ['upper', 'lower'] },
  threshold: { type: Number, required: true },
  triggered: { type: Boolean, default: false },
  triggeredAt: { type: Date },
  lastNotified: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

AlertSchema.index({ userId: 1, symbol: 1 });

export const Alert = models?.Alert || model<AlertItem>('Alert', AlertSchema);
