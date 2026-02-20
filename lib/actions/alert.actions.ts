'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export const createAlert = async (data: AlertData) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    const threshold = parseFloat(data.threshold);
    const symbol = data.symbol.toUpperCase();
    
    const existingAlert = await Alert.findOne({
      userId: session.user.id,
      symbol: symbol,
      alertType: data.alertType,
      threshold: threshold,
      $or: [
        { triggered: false },
        { triggered: { $exists: false } }
      ]
    });

    if (existingAlert) {
      return { success: false, error: 'A similar alert already exists for this stock' };
    }

    const alert = await Alert.create({
      userId: session.user.id,
      symbol: symbol,
      company: data.company.trim(),
      alertName: data.alertName.trim(),
      alertType: data.alertType,
      threshold: threshold,
    });

    revalidatePath('/watchlist');
    return { success: true, alert: JSON.parse(JSON.stringify(alert)) };
  } catch (error) {
    console.error('Error creating alert:', error);
    return { success: false, error: 'Failed to create alert' };
  }
};

export const getUserAlerts = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return [];

    await connectToDatabase();

    const alerts = await Alert.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(alerts));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};

export const deleteAlert = async (alertId: string) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    await Alert.deleteOne({ _id: alertId, userId: session.user.id });

    revalidatePath('/watchlist');
    return { success: true };
  } catch (error) {
    console.error('Error deleting alert:', error);
    return { success: false, error: 'Failed to delete alert' };
  }
};

export const updateAlert = async (alertId: string, data: Partial<AlertData>) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    const updateData: Record<string, string | number> = {};
    if (data.alertName) updateData.alertName = data.alertName.trim();
    if (data.alertType) updateData.alertType = data.alertType;
    if (data.threshold) updateData.threshold = parseFloat(data.threshold);

    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId: session.user.id },
      { $set: updateData },
      { new: true }
    );

    revalidatePath('/watchlist');
    return { success: true, alert: JSON.parse(JSON.stringify(alert)) };
  } catch (error) {
    console.error('Error updating alert:', error);
    return { success: false, error: 'Failed to update alert' };
  }
};
