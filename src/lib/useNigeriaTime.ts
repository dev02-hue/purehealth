// hooks/useNigeriaTime.ts
import { useState, useEffect } from 'react'

export function useNigeriaTime() {
  const [nigeriaTime, setNigeriaTime] = useState<string>('')
  const [nigeriaDate, setNigeriaDate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNigeriaTime = async () => {
      try {
        const response = await fetch('/api/nigeria-time')
        const data = await response.json()
        
        if (data.time && data.date) {
          setNigeriaTime(data.time)
          setNigeriaDate(data.date)
        } else {
          setError('Invalid time data received')
        }
      } catch (err) {
        console.error('Failed to fetch Nigeria time:', err)
        setError('Failed to fetch time data')
        // Fallback to client-side Nigeria time
        const now = new Date()
        const options = {
          timeZone: 'Africa/Lagos',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        } as const
        setNigeriaTime(now.toLocaleTimeString('en-US', options))
        setNigeriaDate(now.toLocaleDateString('en-US', {
          timeZone: 'Africa/Lagos',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchNigeriaTime()
    const interval = setInterval(fetchNigeriaTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return { nigeriaTime, nigeriaDate, loading, error }
}


export function getNigeriaTime() {
  const now = new Date();
  // Format as Nigeria time (Africa/Lagos)
  return new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
}

export function getNextNigeriaMidnight() {
  const nigeriaNow = getNigeriaTime();
  const nextMidnight = new Date(nigeriaNow);
  nextMidnight.setDate(nextMidnight.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);
  return nextMidnight;
}