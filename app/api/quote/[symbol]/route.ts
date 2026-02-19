import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch quote' }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({
      price: data.c || 0,
      change: data.d || 0,
      changePercent: data.dp || 0,
      volume: data.v || 0,
      high: data.h || 0,
      low: data.l || 0,
      open: data.o || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
