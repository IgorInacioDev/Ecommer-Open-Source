import { NextRequest, NextResponse } from 'next/server';
import { nocoClient } from '../../db/nocoClient'

// Função para buscar todas as sessões ativas
async function getAllActiveSessions() {
  try {
    const data = await nocoClient.listRecords<any>('mnsb472ewctetv1', {
      where: `(status,eq,true)`,
      limit: 1000,
      shuffle: 0,
      offset: 0,
    });

    return data.list || [];
  } catch (error) {
    console.error('Erro ao buscar sessões ativas:', error);
    return [];
  }
}

// Função para marcar uma sessão como inativa
async function markSessionInactive(sessionId: string, ip: string) {
  try {
    const updateData = {
      Id: sessionId,
      status: false,
      lastActivity: new Date().toISOString()
    };

    const response = await nocoClient.patchJson<any>(
      `/api/v2/tables/mnsb472ewctetv1/records`,
      updateData
    );

    console.log(`✅ Sessão ${sessionId} (IP: ${ip}) marcada como inativa`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao marcar sessão ${sessionId} como inativa:`, error);
    return false;
  }
}

// Função principal de monitoramento
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando monitoramento de sessões...');
    const activeSessions = await getAllActiveSessions();
    console.log(`📊 Encontradas ${activeSessions.length} sessões ativas`);

    if (activeSessions.length === 0) {
      console.log('ℹ️ Nenhuma sessão ativa encontrada');
      return NextResponse.json({
        success: true,
        message: 'Nenhuma sessão ativa encontrada',
        processed: 0,
        markedInactive: 0,
        totalActive: 0
      });
    }

    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos
    const now = Date.now();
    let processedSessions = 0;
    let markedInactive = 0;

    // Verificar cada sessão ativa
    for (const session of activeSessions) {
      try {
        
        
        // Verificar se a sessão tem timestamp de última atividade
        const lastActivity = session.lastActivity || session.UpdatedAt || session.CreatedAt;
        
        if (!lastActivity) {
          console.log(`⚠️ Sessão ${session.Id} (IP: ${session.ip}) - Sem timestamp de atividade, marcando como inativa`);
          const success = await markSessionInactive(session.Id, session.ip);
          if (success) {
            markedInactive++;
          }
          processedSessions++;
          continue;
        }
        
        const lastActivityTime = new Date(lastActivity).getTime();
        
        if (isNaN(lastActivityTime)) {
          console.log(`⚠️ Sessão ${session.Id} (IP: ${session.ip}) - Timestamp inválido: ${lastActivity}, marcando como inativa`);
          const success = await markSessionInactive(session.Id, session.ip);
          if (success) {
            markedInactive++;
          }
          processedSessions++;
          continue;
        }
        
        const timeSinceLastActivity = now - lastActivityTime;
        const minutesAgo = Math.round(timeSinceLastActivity / (1000 * 60));

        console.log(`🔍 Sessão ${session.Id} (IP: ${session.ip}) - Última atividade: ${minutesAgo} minutos atrás`);

        // Se passou do tempo limite, marcar como inativa
        if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
          console.log(`⏰ Sessão ${session.Id} ultrapassou o limite de ${INACTIVITY_TIMEOUT / (1000 * 60)} minutos`);
          const success = await markSessionInactive(session.Id, session.ip);
          if (success) {
            markedInactive++;
          }
        } else {
          console.log(`✅ Sessão ${session.Id} ainda ativa (${minutesAgo} min < ${INACTIVITY_TIMEOUT / (1000 * 60)} min)`);
        }

        processedSessions++;
      } catch (error) {
        console.error(`❌ Erro ao processar sessão ${session.Id}:`, error);
      }
    }

    console.log(`✅ Monitoramento concluído: ${processedSessions} sessões processadas, ${markedInactive} marcadas como inativas`);

    return NextResponse.json({
      success: true,
      message: 'Monitoramento de sessões concluído',
      processed: processedSessions,
      markedInactive,
      totalActive: activeSessions.length
    });
  } catch (error) {
    console.error('❌ Erro no monitoramento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint GET para status do monitoramento
export async function GET() {
  try {
    const activeSessions = await getAllActiveSessions();
    
    return NextResponse.json({
      success: true,
      activeSessionsCount: activeSessions.length,
      monitoringActive: true,
      inactivityTimeout: '5 minutos',
      lastCheck: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao verificar status do monitoramento' 
      },
      { status: 500 }
    );
  }
}