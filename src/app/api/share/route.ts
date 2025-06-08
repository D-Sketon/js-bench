import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { redis, ShareData, getShareKey, EXPIRY_OPTIONS, ExpiryOption } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, dependencies, setupCode, testCases, results, asyncMode, expiryOption = '30d' } = body;

    if (!Object.keys(EXPIRY_OPTIONS).includes(expiryOption)) {
      return NextResponse.json(
        { success: false, error: 'Invalid expiry option' },
        { status: 400 }
      );
    }

    const id = nanoid(10);
    
    const shareData: ShareData = {
      id,
      title,
      dependencies,
      setupCode,
      testCases,
      results,
      asyncMode,
      expiryOption: expiryOption as ExpiryOption,
      createdAt: new Date().toISOString()
    };

    const key = getShareKey(id);
    const expirySeconds = EXPIRY_OPTIONS[expiryOption as ExpiryOption];
    await redis.setex(key, expirySeconds, JSON.stringify(shareData));

    return NextResponse.json({ 
      success: true, 
      id,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${id}`,
      expiryOption
    });
  } catch (error) {
    console.error('Error creating share:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create share' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const key = getShareKey(id);
    const data = await redis.get(key);

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Share not found' },
        { status: 404 }
      );
    }

    const shareData: ShareData = typeof data === 'string' ? JSON.parse(data) : data;

    return NextResponse.json({
      success: true,
      data: shareData
    });
  } catch (error) {
    console.error('Error fetching share:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch share' },
      { status: 500 }
    );
  }
} 