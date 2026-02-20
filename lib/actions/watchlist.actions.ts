'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { Alert } from '@/database/models/alert.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

export const addToWatchlist = async (symbol: string, company: string) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    const existing = await Watchlist.findOne({ 
      userId: session.user.id, 
      symbol: symbol.toUpperCase() 
    });

    if (existing) {
      return { success: false, error: 'Stock already in watchlist' };
    }

    await Watchlist.create({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
      company: company.trim(),
    });

    revalidatePath('/watchlist');
    return { success: true };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return { success: false, error: 'Failed to add to watchlist' };
  }
};

export const removeFromWatchlist = async (symbol: string) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    const upperSymbol = symbol.toUpperCase();

    // Delete the watchlist item
    await Watchlist.deleteOne({ 
      userId: session.user.id, 
      symbol: upperSymbol 
    });

    // Delete all associated alerts for this stock
    await Alert.deleteMany({
      userId: session.user.id,
      symbol: upperSymbol
    });

    revalidatePath('/watchlist');
    return { success: true };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return { success: false, error: 'Failed to remove from watchlist' };
  }
};

export const getUserWatchlist = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    const watchlist = await Watchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(watchlist));
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    throw new Error('Failed to fetch watchlist');
  }
};

export const getWatchlistWithData = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    const watchlist = await Watchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();

    const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
    const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    const watchlistWithData = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const [quote, profile, financials] = await Promise.all([
            fetch(`${FINNHUB_BASE_URL}/quote?symbol=${item.symbol}&token=${FINNHUB_API_KEY}`).then(r => r.json()),
            fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${item.symbol}&token=${FINNHUB_API_KEY}`).then(r => r.json()),
            fetch(`${FINNHUB_BASE_URL}/stock/metric?symbol=${item.symbol}&metric=all&token=${FINNHUB_API_KEY}`).then(r => r.json()),
          ]);

          return {
            ...item,
            currentPrice: quote.c,
            changePercent: quote.dp,
            priceFormatted: quote.c ? `$${quote.c.toFixed(2)}` : 'N/A',
            changeFormatted: quote.dp ? `${quote.dp > 0 ? '+' : ''}${quote.dp.toFixed(2)}%` : 'N/A',
            marketCap: profile.marketCapitalization ? `$${(profile.marketCapitalization / 1000).toFixed(2)}B` : 'N/A',
            peRatio: financials.metric?.peBasicExclExtraTTM?.toFixed(2) || 'N/A',
          };
        } catch (error) {
          return {
            ...item,
            currentPrice: 0,
            changePercent: 0,
            priceFormatted: 'N/A',
            changeFormatted: 'N/A',
            marketCap: 'N/A',
            peRatio: 'N/A',
          };
        }
      })
    );

    return JSON.parse(JSON.stringify(watchlistWithData));
  } catch (error) {
    console.error('Error fetching watchlist with data:', error);
    throw new Error('Failed to fetch watchlist data');
  }
};
