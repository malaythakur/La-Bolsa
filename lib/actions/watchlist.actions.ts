'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return [];

    const user = await db.collection('user').findOne({ email });
    if (!user) return [];

    const userId = user.id || user._id?.toString();
    if (!userId) return [];

    const watchlistItems = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return watchlistItems.map((item) => item.symbol);
  } catch (error) {
    console.error('Error fetching watchlist symbols:', error);
    return [];
  }
};
