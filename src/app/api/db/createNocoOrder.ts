import { CustomerDataType } from "@/app/types/Datas";
import { NocoOrderDataType } from "@/app/types/Noco";
import { nocoClient } from './nocoClient'

export async function createNocoOrder(noco_orderData: NocoOrderDataType, customerData: CustomerDataType) {
  try {
    const createHyperCashOrderResponse = await nocoClient.postJson<any>(
      `/api/v2/tables/m6wrl3tzct02afe/records`,
      noco_orderData
    );

    const orderId = createHyperCashOrderResponse.id || createHyperCashOrderResponse.Id;
    if (!orderId) {
      throw new Error('Failed to get order ID from response')
    }

    const createCustomerResponse = await nocoClient.postJson<any>(
      `/api/v2/tables/m9nb5ra0vb7616y/records`,
      customerData
    );

    const customerId = createCustomerResponse.id || createCustomerResponse.Id;
    if (!customerId) {
      throw new Error('Failed to get customer ID from response')
    }

    return { success: true, orderId: orderId, customerId: customerId };
  } catch (error) {
    console.error('Error creating noco order/customer');
    throw error;
  }
}