import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000) // 3s timeout

    let response: Response
    try {
      response = await fetch('https://worldtimeapi.org/api/timezone/Africa/Lagos', {
        signal: controller.signal
      })
      clearTimeout(timeout)
    } catch (err) {
      clearTimeout(timeout)
      const fetchError = err as Error // Type assertion
      
      // Handle fetch-specific errors (network issues, timeouts)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 3 seconds')
      }
      throw new Error(`Network error: ${fetchError.message}`)
    }

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json() as { datetime: string }

    const nigeriaTime = new Date(data.datetime).toLocaleTimeString('en-US', {
      timeZone: 'Africa/Lagos',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const nigeriaDate = new Date(data.datetime).toLocaleDateString('en-US', {
      timeZone: 'Africa/Lagos',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return NextResponse.json({ 
      time: nigeriaTime,
      date: nigeriaDate,
      timezone: 'Africa/Lagos',
      source: 'worldtimeapi.org'
    })

  } catch (error) {
    // Generate fallback time regardless of error
    const fallbackTime = new Date()
    
    const serverTime = fallbackTime.toLocaleTimeString('en-US', {
      timeZone: 'Africa/Lagos',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const serverDate = fallbackTime.toLocaleDateString('en-US', {
      timeZone: 'Africa/Lagos',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Log the error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to fetch Nigeria time:', errorMessage)

    return NextResponse.json({ 
      time: serverTime,
      date: serverDate,
      timezone: 'Africa/Lagos',
      source: 'server-fallback',
      warning: errorMessage,
      note: 'Displaying server time as fallback'
    }, { 
      status: 200 // Return 200 since we have a fallback
    })
  }
}

export const dynamic = 'force-dynamic'