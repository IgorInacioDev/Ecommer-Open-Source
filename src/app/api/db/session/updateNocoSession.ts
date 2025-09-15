import { UpdateSessionDataType, UpdateSessionResponseType } from "@/app/types/Session";
import { getSessionByIp } from "./getSessionByIp";
import { getFullSessionByIp } from "./getFullSessionByIp";
import getClientIP from "@/app/utils/getClientIP";
import { nocoClient } from '../nocoClient'

export async function updateNocoSession(updateSessionData: UpdateSessionDataType, request?: Request) {
  try {
    // Priorizar IP informado no payload; usar IP detectado no servidor apenas como fallback
    const ip = updateSessionData.ip || (request ? getClientIP(request) : '127.0.0.1');
    
    // Verificar se está tentando alterar createOrder
    if (updateSessionData.createOrder !== undefined) {
      const currentSession = await getFullSessionByIp(ip);
      
      // Se a sessão atual já tem createOrder como true, ignorar a tentativa de alteração
      if (currentSession && currentSession.createOrder === true) {
        console.warn('Tentativa de alterar createOrder que já está definido como true. Operação ignorada.');
        // Remove o campo createOrder dos dados de atualização para ignorar a alteração
        delete updateSessionData.createOrder;
      }
    }
    
    // Obter Id da sessão pelo IP; se não existir, fazer no-op para evitar 500
    let sessionId: number | undefined;
    try {
      ({ sessionId } = await getSessionByIp(ip));
    } catch (e) {
      console.warn(`No session found for IP ${ip}. Skipping update.`);
      return { Id: 0 } as UpdateSessionResponseType;
    }

    updateSessionData.Id = sessionId;
    
    // Atualizar lastActivity apenas quando o status for true ou undefined
    if (updateSessionData.status === undefined || updateSessionData.status === true) {
      updateSessionData.status = true;
      updateSessionData.lastActivity = new Date().toISOString();
      console.log(`✅ Sessão ${sessionId} (IP: ${ip}) - Status definido como ativo e lastActivity atualizado`);
    } else if (updateSessionData.status === false) {
      // Permitir definir status como false quando explicitamente solicitado
      updateSessionData.lastActivity = new Date().toISOString();
      console.log(`❌ Sessão ${sessionId} (IP: ${ip}) - Status definido como inativo`);
    }
    
    const { Id } = await nocoClient.patchJson<UpdateSessionResponseType>(
      `/api/v2/tables/mnsb472ewctetv1/records`,
      updateSessionData
    );
    console.log('Session updated response:', Id);
    
    return { 
      Id      
    };
    
  } catch (error) {
    console.error('Error updating noco session:', error);
    throw error;
  }
}