import { nocoClient } from './nocoClient'

export async function updateNocoOrder(orderId: string, status: string) {
  try {
    // Primeiro, buscar a ordem pelo external_ref para obter o Id
    const listResp = await nocoClient.listRecords<any>('m6wrl3tzct02afe', {
      where: `(external_ref,eq,${orderId})`,
      limit: 1,
      shuffle: 0,
      offset: 0,
    });

    const list = listResp.list as any[];
    console.log('Get order response:', listResp);

    if (!list || list.length === 0) {
      throw new Error(`Order not found with external_ref: ${orderId}`);
    }

    const orderRecord = list[0];
    const orderDbId = orderRecord.Id;

    // Agora atualizar a ordem usando o Id
    const updateOrderResponse = await nocoClient.patchJson<any>(
      `/api/v2/tables/m6wrl3tzct02afe/records`,
      {
        Id: orderDbId,
        status: status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
      }
    );

    console.log('Order update response:', updateOrderResponse);

    return { success: true, response: updateOrderResponse };
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error);
    throw error;
  }
}