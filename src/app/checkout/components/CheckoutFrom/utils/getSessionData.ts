  // Função para capturar dados de sessão
export default function getSessionData () {
    try {
      return {
        sessionId: sessionStorage.getItem('sessionId') || `session_${Date.now()}`,
        visitCount: parseInt(localStorage.getItem('visitCount') || '1'),
        firstVisit: localStorage.getItem('firstVisit') || new Date().toISOString(),
        lastVisit: localStorage.getItem('lastVisit') || new Date().toISOString(),
        pageViews: parseInt(sessionStorage.getItem('pageViews') || '1')
      };
    } catch (error) {
      console.warn('Session data access failed:', error);
      return {
        sessionId: `session_${Date.now()}`,
        visitCount: 1,
        firstVisit: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        pageViews: 1
      };
    }
  };