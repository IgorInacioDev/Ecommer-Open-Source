'use client'

import { useEffect } from 'react'

// Wrapper client-side para atualização de sessão via rota API
const updateNocoSession = async (data: any) => {
  try {
    const res = await fetch('/api/session/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Falha ao atualizar sessão: ${res.status} ${text}`)
    }
    return res.json().catch(() => ({}))
  } catch (e) {
    console.error(e)
    throw e
  }
}

export default function SessionStatusTracker() {
  useEffect(() => {
    let isPageVisible = true
    
    // Função para obter IP do cliente usando API externa
    const getClientIP = async () => {
      try {
        // Verificar se já temos o IP no localStorage
        const cachedIP = localStorage.getItem('userIP')
        if (cachedIP) {
          return cachedIP
        }
        
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        
        // Armazenar o IP no localStorage para uso síncrono
        localStorage.setItem('userIP', data.ip)
        
        return data.ip
      } catch (error) {
        console.error('Error getting IP:', error)
        const fallbackIP = '127.0.0.1'
        localStorage.setItem('userIP', fallbackIP)
        return fallbackIP
      }
    }

    // Função para atualizar o status da sessão
    const updateSessionStatus = async (isActive: boolean) => {
      try {
        const ip = await getClientIP();
        
        await updateNocoSession({
          status: isActive,
          lastActivity: new Date().toISOString(),
          ip: ip
        });
        
        console.log(`✅ Status da sessão atualizado para: ${isActive ? 'ativo' : 'inativo'}`);
      } catch (error) {
        console.error('❌ Erro ao atualizar status da sessão:', error);
      }
    };

    // Função para atualizar apenas a última atividade (heartbeat)
    const updateLastActivity = async () => {
      try {
        const ip = await getClientIP();
        
        await updateNocoSession({
          lastActivity: new Date().toISOString(),
          ip: ip
        });
        
        console.log('💓 Heartbeat: última atividade atualizada');
      } catch (error) {
        console.error('❌ Erro ao atualizar última atividade:', error);
      }
    };

    // Detectar quando o usuário sai da página (beforeunload)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Usar navigator.sendBeacon para garantir que a requisição seja enviada
      // mesmo quando a página está sendo fechada
      try {
        // Obter IP de forma síncrona usando localStorage se disponível
        const ip = localStorage.getItem('userIP') || '127.0.0.1'
        
        const data = JSON.stringify({
          ip,
          status: false
        })
        
        // Tentar usar sendBeacon primeiro (mais confiável)
        if (navigator.sendBeacon) {
          const blob = new Blob([data], { type: 'application/json' })
          const sent = navigator.sendBeacon('/api/session/update-status', blob)
          console.log('📤 Status de desconexão enviado via sendBeacon:', sent)
        } else {
          // Fallback para fetch síncrono com keepalive
          fetch('/api/session/update-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: data,
            keepalive: true
          }).catch(error => {
            console.error('Erro ao enviar status de desconexão:', error)
          })
        }
      } catch (error) {
        console.error('Erro ao processar beforeunload:', error)
      }
    }

    // Detectar quando a página fica visível/invisível
    const handleVisibilityChange = () => {
      if (document.hidden && isPageVisible) {
        // Página ficou invisível - apenas atualizar flag, não marcar como inativo
        isPageVisible = false
        console.log('📱 Página ficou invisível - mantendo sessão ativa')
      } else if (!document.hidden && !isPageVisible) {
        // Página ficou visível novamente - garantir que está ativa
        isPageVisible = true
        updateSessionStatus(true)
        console.log('📱 Página ficou visível - garantindo sessão ativa')
      }
    }

    // Detectar quando a janela perde/ganha foco
    const handleFocus = () => {
      if (!isPageVisible) {
        isPageVisible = true
        updateSessionStatus(true)
        console.log('🔍 Janela ganhou foco - garantindo sessão ativa')
      }
    }

    const handleBlur = () => {
      // Não marcar como inativo no blur - apenas atualizar flag
      // O status só deve mudar para false quando realmente desconectado
      console.log('🔍 Janela perdeu foco - mantendo sessão ativa')
    }

    // Definir status inicial como true quando o componente monta
    updateSessionStatus(true)

    // Configurar heartbeat para manter a sessão ativa
    const heartbeatInterval = setInterval(() => {
      if (!document.hidden) {
        updateLastActivity();
      }
    }, 60000); // Atualizar a cada 1 minuto

    // Detectar atividade do usuário (movimento do mouse, cliques, teclas)
    const handleUserActivity = () => {
      updateLastActivity();
    };

    // Throttle para evitar muitas chamadas
    let activityTimeout: NodeJS.Timeout;
    const throttledActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(handleUserActivity, 30000); // Máximo a cada 30 segundos
    };

    // Adicionar event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('mousemove', throttledActivity);
    document.addEventListener('click', throttledActivity);
    document.addEventListener('keypress', throttledActivity);
    document.addEventListener('scroll', throttledActivity);

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      clearTimeout(activityTimeout);
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('mousemove', throttledActivity);
      document.removeEventListener('click', throttledActivity);
      document.removeEventListener('keypress', throttledActivity);
      document.removeEventListener('scroll', throttledActivity);
      
      // Atualizar status para false quando o componente desmonta
      updateSessionStatus(false)
    }
  }, [])

  return null // Componente invisível
}