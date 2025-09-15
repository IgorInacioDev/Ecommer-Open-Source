import { nocoClient } from '../../db/nocoClient'

// Função para buscar todas as sessões ativas
export async function getAllActiveSessions() {
  try {
    const data = await nocoClient.listRecords<any>('mnsb472ewctetv1', {
      limit: 100,
      shuffle: 0,
      offset: 0,
    });

    return data.list || [];
  } catch (error) {
    console.error('❌ Erro ao buscar sessões ativas:', error);
    return [];
  }
}

// Função para marcar uma sessão como inativa
export async function markSessionInactive(sessionId: string, ip: string) {
  try {
    console.log(`🔄 Marcando sessão ${sessionId} (IP: ${ip}) como inativa...`);
    
    const updateData = {
      Id: sessionId,
      status: false,
      lastActivity: new Date().toISOString()
    };

    const response = await nocoClient.patchJson<any>(
      `/api/v2/tables/mnsb472ewctetv1/records`,
      updateData
    );

    console.log(`✅ Sessão ${sessionId} marcada como inativa`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao marcar sessão ${sessionId} como inativa:`, error);
    return false;
  }
}

// Função para verificar se uma sessão está inativa
export function isSessionInactive(lastActivity: string, timeoutMinutes: number = 5): boolean {
  const lastActivityTime = new Date(lastActivity).getTime();
  const now = new Date().getTime();
  const timeSinceLastActivity = now - lastActivityTime;
  const timeoutMs = timeoutMinutes * 60 * 1000;
  
  return timeSinceLastActivity > timeoutMs;
}