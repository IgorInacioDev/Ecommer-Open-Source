// utils/fastsoft.ts
interface CardData {
  number: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

declare global {
  interface Window {
    FastSoft: {
      setPublicKey: (publicKey: string) => Promise<void>;
      encrypt: (cardData: CardData) => Promise<string>;
    };
  }
}

let isSDKLoaded = false;
let loadingPromise: Promise<void> | null = null;

const loadFastSoftSDK = (): Promise<void> => {
  console.log('[FastSoft] Starting SDK load');
  
  if (isSDKLoaded && window.FastSoft) {
    console.log('[FastSoft] SDK already loaded');
    return Promise.resolve();
  }

  if (loadingPromise) {
    console.log('[FastSoft] SDK loading in progress');
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="fastsoftbrasil.com"]');
    
    if (existingScript) {
      console.log('[FastSoft] Found existing script tag');
      if (window.FastSoft) {
        console.log('[FastSoft] SDK already initialized');
        isSDKLoaded = true;
        resolve();
        return;
      }
      existingScript.addEventListener('load', () => {
        console.log('[FastSoft] Existing script loaded successfully');
        isSDKLoaded = true;
        resolve();
      });
      existingScript.addEventListener('error', () => {
        console.error('[FastSoft] Failed to load existing script');
        reject(new Error('Falha ao carregar SDK'));
      });
      return;
    }

    console.log('[FastSoft] Creating new script tag');
    const script = document.createElement('script');
    script.src = 'https://js.fastsoftbrasil.com/security.js';
    script.async = true;

    script.onload = () => {
      console.log('[FastSoft] New script loaded successfully');
      isSDKLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      console.error('[FastSoft] Failed to load new script');
      reject(new Error('Falha ao carregar SDK'));
    }
    
    document.head.appendChild(script);
  });

  return loadingPromise;
};

export const tokenizeCard = async (cardData: CardData): Promise<string> => {
  try {
    console.log('[FastSoft] Starting card tokenization');
    await loadFastSoftSDK();
    
    if (!window.FastSoft) {
      console.error('[FastSoft] SDK not available after loading');
      throw new Error('SDK não disponível');
    }

    console.log('[FastSoft] Setting public key');
    await window.FastSoft.setPublicKey(
      process.env.FASTSOFT_PUBLIC_KEY || ''
    );

    console.log('[FastSoft] Encrypting card data');
    const token = await window.FastSoft.encrypt(cardData);
    console.log('[FastSoft] Card tokenization successful');
    return token;
    
  } catch (error) {
    console.error('[FastSoft] Tokenization error:', error);
    throw new Error(`Erro na tokenização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};