// app/api/processEarnings/route.ts
import { processEarnings } from '@/lib/investment-plan';
import { NextResponse } from 'next/server';
 
export async function GET() {
  const result = await processEarnings();
  return NextResponse.json(result);
}
