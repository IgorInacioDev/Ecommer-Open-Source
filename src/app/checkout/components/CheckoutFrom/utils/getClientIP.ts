  // Função para obter IP real do cliente
  export default async function getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip
    } catch (error) {
      console.error('Erro ao obter IP:', error);
      return '127.0.0.1';
    }
  };