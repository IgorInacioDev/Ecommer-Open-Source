import { SessionCreateDataType } from '../types/Session';

/**
 * Função para coletar todos os dados de sessão do cliente
 * @returns {SessionCreateDataType} Objeto com todos os dados de sessão formatados
 */
export function getDataSession(): SessionCreateDataType {
  // Função para extrair parâmetros UTM da URL
  const getUTMParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_content: urlParams.get('utm_content') || '',
      utm_term: urlParams.get('utm_term') || ''
    };
  };

  // Função para detectar o tipo de dispositivo
  const getDeviceType = (): 'Desktop' | 'Iphone' | 'Android' => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'Iphone';
    } else if (userAgent.includes('android')) {
      return 'Android';
    } else {
      return 'Desktop';
    }
  };

  // Função para obter IP do cliente (simulada - em produção seria via API)
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '';
    } catch (error) {
      console.warn('Não foi possível obter o IP:', error);
      return '';
    }
  };

  // Função para gerar fingerprint do dispositivo
  const generateFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Fingerprint test', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Gera um hash simples do fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para 32bit integer
    }
    
    return Math.abs(hash).toString(16);
  };

  // Função para coletar metadados adicionais
  const getMetadata = (): string => {
    const metadata = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || '',
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(metadata);
  };

  // Coleta todos os dados de sessão
  const utmParams = getUTMParams();
  const deviceType = getDeviceType();
  const fingerprint = generateFingerprint();
  const metadata = getMetadata();
  
  // Construir lastPage com pathname e parâmetros não-UTM
  const url = new URL(window.location.href);
  const UTM_PARAMS_LIST = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  // Remover apenas parâmetros UTM, mantendo outros como category
  UTM_PARAMS_LIST.forEach(param => {
    url.searchParams.delete(param);
  });
  
  // Construir lastPage final - inclui pathname e parâmetros não-UTM
  const lastPage = url.search ? url.pathname + url.search : url.pathname;

  // Retorna o objeto formatado
  const sessionData: SessionCreateDataType = {
    ip: '', // Será preenchido de forma assíncrona
    ...utmParams,
    lastPage,
    createHyperCashOrder: false, // Valor padrão, pode ser alterado conforme necessário
    deviceType,
    fingerPrint: fingerprint,
    metadata,
  };

  // Preenche o IP de forma assíncrona
  getClientIP().then(ip => {
    sessionData.ip = ip;
  });

  return sessionData;
}

/**
 * Versão assíncrona da função que aguarda o IP ser coletado
 * @returns {Promise<SessionCreateDataType>} Promise com objeto de dados de sessão completo
 */
export async function getDataSessionAsync(): Promise<SessionCreateDataType> {
  const sessionData = getDataSession();
  
  // Aguarda a coleta do IP
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    sessionData.ip = data.ip || '';
  } catch (error) {
    console.warn('Não foi possível obter o IP:', error);
    sessionData.ip = '';
  }
  
  return sessionData;
}