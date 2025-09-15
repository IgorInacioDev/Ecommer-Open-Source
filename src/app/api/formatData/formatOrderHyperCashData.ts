import { OrderDataType } from "@/app/types/Datas"
import { HyperCashOrderDataType } from "@/app/types/HyperCash"

export default function formatOrderHyperCashData (orderData: OrderDataType) {
  const dataformat: HyperCashOrderDataType = { 
    amount: orderData.amount,
    currency: 'BRL',
    paymentMethod: 'PIX',
    pix: {
      expiresInDays: 1,
    },
    customer: {
      name: orderData.customer.name,
      email: orderData.customer.email,
      phone: orderData.customer.phone,
      document: {
        number: orderData.customer.document.number,
        type: 'CPF',
      }
    },
    shipping: orderData.shipping,
    items: orderData.items,
    metadata: typeof orderData.metadata === 'string' ? JSON.parse(orderData.metadata) : orderData.metadata,
    ip: orderData.ip,
  }

  return dataformat
}