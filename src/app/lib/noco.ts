// Configuração do NocoDB
const NOCO_BASE_URL = 'https://white-nocodb.5zd9ii.easypanel.host';
const NOCO_TOKEN = process.env.DB_TOKEN || '';

// Simulação da API do NocoDB para compatibilidade
export const noco = {
  dbViewRow: {
    // Listar registros de uma view
    async list(workspace: string, project: string, table: string, view: string, options: { where?: string } = {}) {
      try {
        let url = `${NOCO_BASE_URL}/api/v2/tables/mnsb472ewctetv1/records?limit=1000&shuffle=0&offset=0`;
        
        // Adicionar filtros se especificados
        if (options.where) {
          const whereClause = options.where.replace(/[()]/g, '').replace(/,/g, '%2C');
          url += `&where=${whereClause}%29`;
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': NOCO_TOKEN
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return { list: data.list || [] };
      } catch (error) {
        console.error('Erro ao listar registros:', error);
        return { list: [] };
      }
    },
    
    // Atualizar um registro
    async update(workspace: string, project: string, table: string, view: string, recordId: string, data: unknown) {
      try {
        const response = await fetch(`${NOCO_BASE_URL}/api/v2/tables/mnsb472ewctetv1/records/${recordId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': NOCO_TOKEN
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        throw error;
      }
    }
  }
};