import { NextRequest, NextResponse } from 'next/server';
import { getAllActiveSessions, markSessionInactive } from './monitoringUtils';

// Armazenar referência do intervalo globalmente
let monitoringInterval: NodeJS.Timeout | null = null;
let isMonitoringActive = false;

// Função para executar o monitoramento diretamente
async function executeMonitoringDirect() {
  try {
    console.log('🔄 Executando monitoramento automático de sessões...');
    
    
    // Buscar todas as sessões ativas
    const activeSessions = await getAllActiveSessions();
    console.log(`📊 Encontradas ${activeSessions.length} sessões ativas`);

    if (activeSessions.length === 0) {
      console.log('ℹ️ Nenhuma sessão ativa encontrada');
      return { success: true, processed: 0, markedInactive: 0 };
    }

    // Definir tempo limite de inatividade (5 minutos)
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos em millisegundos
    const now = new Date().getTime();
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
    return { success: true, processed: processedSessions, markedInactive };
    
  } catch (error) {
    console.error('❌ Erro ao executar monitoramento automático:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Iniciar monitoramento automático
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, interval = 300000 } = body; // Default: 5 minutos

    if (action === 'start') {
      if (isMonitoringActive) {
        return NextResponse.json({
          success: false,
          message: 'Monitoramento já está ativo'
        });
      }

      // Executar imediatamente
      await executeMonitoringDirect();

      // Configurar execução periódica
      monitoringInterval = setInterval(executeMonitoringDirect, interval);
      isMonitoringActive = true;

      console.log(`🚀 Monitoramento automático iniciado com intervalo de ${interval / 1000}s`);

      return NextResponse.json({
        success: true,
        message: 'Monitoramento automático iniciado',
        interval: interval,
        intervalInSeconds: interval / 1000
      });

    } else if (action === 'stop') {
      if (!isMonitoringActive) {
        return NextResponse.json({
          success: false,
          message: 'Monitoramento não está ativo'
        });
      }

      if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
      }
      isMonitoringActive = false;

      console.log('🛑 Monitoramento automático parado');

      return NextResponse.json({
        success: true,
        message: 'Monitoramento automático parado'
      });

    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ação inválida. Use "start" ou "stop"' 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Erro no scheduler de monitoramento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno no scheduler',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Verificar status do monitoramento
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      isActive: isMonitoringActive,
      hasInterval: monitoringInterval !== null,
      status: isMonitoringActive ? 'Ativo' : 'Inativo',
      message: isMonitoringActive 
        ? 'Monitoramento automático está executando' 
        : 'Monitoramento automático está parado'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao verificar status do scheduler' 
      },
      { status: 500 }
    );
  }
}

// Inicializar monitoramento automaticamente quando o servidor iniciar
if (typeof window === 'undefined') {
  // Apenas no servidor
  setTimeout(async () => {
    try {
      console.log('🔄 Iniciando monitoramento automático na inicialização do servidor...');
      await executeMonitoringDirect();
      
      // Configurar execução a cada 5 minutos
      monitoringInterval = setInterval(executeMonitoringDirect, 5 * 60 * 1000);
      isMonitoringActive = true;
      
      console.log('✅ Monitoramento automático iniciado na inicialização');
    } catch (error) {
      console.error('❌ Erro ao iniciar monitoramento automático:', error);
    }
  }, 10000); // Aguardar 10 segundos após inicialização
}