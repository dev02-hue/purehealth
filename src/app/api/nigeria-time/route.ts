import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://worldtimeapi.org/api/timezone/Africa/Lagos')
    const data = await response.json()
    const nigeriaTime = new Date(data.datetime).toLocaleTimeString('en-US', {
      timeZone: 'Africa/Lagos',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    return NextResponse.json({ time: nigeriaTime })
  } catch (error) {
    console.error('Failed to fetch Nigeria time:', error)
    // Fallback to server time
    const serverTime = new Date().toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    return NextResponse.json({ time: `${serverTime} (server time)` })
  }
}

export const dynamic = 'force-dynamic'