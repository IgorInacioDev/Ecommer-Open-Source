'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getDataSessionAsync } from '../utils/getDataSession'

// Wrappers client-side para usar rotas API (evita expor token no browser)
const checkExistingSessionByIP = async (ip: string): Promise<{ count: number }> => {
  const res = await fetch(`/api/session/check?ip=${encodeURIComponent(ip)}`)
  if (!res.ok) throw new Error('Erro ao verificar sessão')
  return res.json()
}

const createNocoSession = async (data: any) => {
  const res = await fetch('/api/session/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Erro ao criar sessão')
  return res.json()
}

const updateNocoSession = async (data: any) => {
  const res = await fetch('/api/session/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Erro ao atualizar sessão')
  return res.json()
}

export default function GlobalAPITracker() {
  const pathname = usePathname()
  const [clientIP, setClientIP] = useState<string>('127.0.0.1')

  // Function to get client IP using external API
  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error('Error getting IP:', error)
      return '127.0.0.1'
    }
  }

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Get client IP first
        const ip = await getClientIP()
        setClientIP(ip)
        
        // Check existing session
        const result = await checkExistingSessionByIP(ip)
        
        if (result.count === 0) {
          const dataNocoSession = await getDataSessionAsync()
          await createNocoSession(dataNocoSession)
        } else {
          const {
            deviceType, 
            fingerPrint, 
            metadata, 
            ip, 
            lastPage, 
            utm_campaign, 
            utm_content, 
            utm_medium, 
            utm_source, 
            utm_term, } = await getDataSessionAsync()
            
            await updateNocoSession({
                deviceType, 
                fingerPrint, 
                metadata, 
                ip, 
                lastPage, 
                utm_campaign, 
                utm_content, 
                utm_medium, 
                utm_source, 
                utm_term, 
            })
        }
      } catch (error) {
        console.error('Error in session tracking:', error)
      }
    }

    initializeSession()
  }, [pathname])

  return null // Invisible component
}