'use server';

import { connectToDatabase } from '@/database/mongoose';
import { AlertNotification } from '@/database/models/alertNotification.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const getAlertNotifications = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    const notifications = await AlertNotification.find({ userId: session.user.id })
      .sort({ triggeredAt: -1 })
      .limit(50)
      .lean();

    return JSON.parse(JSON.stringify(notifications));
  } catch (error) {
    console.error('Error fetching alert notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    await AlertNotification.updateOne(
      { _id: notificationId, userId: session.user.id },
      { $set: { read: true } }
    );

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/watchlist');

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }
};
