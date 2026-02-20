import { Schema, model, models, Document } from 'mongoose';

export interface AlertNotification extends Document {
  userId: string;
  symbol: string;
  company: string;
  alertName: string;
  alertType: 'upper' | 'lower';
  threshold: number;
  triggeredPrice: number;
  triggeredAt: Date;
  read: boolean;
}

const AlertNotificationSchema = new Schema<AlertNotification>({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, required: true, uppercase: true },
  company: { type: String, required: true },
  alertName: { type: String, required: true },
  alertType: { type: String, required: true, enum: ['upper', 'lower'] },
  threshold: { type: Number, required: true },
  triggeredPrice: { type: Number, required: true },
  triggeredAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

AlertNotificationSchema.index({ userId: 1, triggeredAt: -1 });

export const AlertNotification = models?.AlertNotification || model<AlertNotification>('AlertNotification', AlertNotificationSchema);
