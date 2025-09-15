  // Função para gerar fingerprint do navegador
export default async function generateFingerprint () {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let canvasFingerprint = 'unavailable';
      
      if (ctx) {
        try {
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('Browser fingerprint', 2, 2);
          canvasFingerprint = canvas.toDataURL();
        } catch (e) {
          console.warn('Canvas fingerprinting failed:', e);
        }
      }
      
      const fingerprint = {
        userAgent: navigator.userAgent || 'unknown',
        language: navigator.language || 'unknown',
        platform: navigator.platform || 'unknown',
        cookieEnabled: navigator.cookieEnabled || false,
        screenResolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'unknown',
        colorDepth: typeof screen !== 'undefined' ? screen.colorDepth : 0,
        timezone: (() => {
          try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
          } catch (e) {
            return 'unknown';
          }
        })(),
        canvasFingerprint,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: (() => {
          try {
            return (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0;
          } catch (e) {
            return 0;
          }
        })(),
        connection: (() => {
          try {
            return (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown';
          } catch (e) {
            return 'unknown';
          }
        })()
      };
      
      // Clean up canvas element to prevent memory leaks
      if (canvas && canvas.remove) {
        canvas.remove();
      }
      
      return fingerprint;
    } catch (error) {
      console.warn('Fingerprint generation failed:', error);
      return {
        userAgent: 'unknown',
        language: 'unknown',
        platform: 'unknown',
        cookieEnabled: false,
        screenResolution: 'unknown',
        colorDepth: 0,
        timezone: 'unknown',
        canvasFingerprint: 'unavailable',
        hardwareConcurrency: 0,
        deviceMemory: 0,
        connection: 'unknown'
      };
    }
  };