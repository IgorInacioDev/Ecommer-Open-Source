import { HyperCashOrderResponseDataType } from "@/app/types/HyperCash"
import { NocoOrderDataType } from "@/app/types/Noco"
import { sanitizeForJSON } from "@/app/utils/sanitizeUtils"

export default function formatNocoOrderHyperCashData (orderData: HyperCashOrderResponseDataType) {
  const dataformat: NocoOrderDataType = { 
    tenant_id: orderData.id,
    company_id: 23,
    amount: orderData.amount,
    currency: orderData.currency,
    authorization_code: null,
    base_price: null,
    external_ref: orderData.id,
    interest_rate: null,
    ip: orderData.ip,
    paid_amount: 0,
    paid_at: null,
    payment_method: orderData.paymentMethod,
    postback_url: null,
    redirect_url: null,
    refunded_amount: orderData.refundedAmount,
    refunded_at: null,
    refused_reason: orderData.refusedReason || null,
    return_url: null,
    secure_id: orderData.secureId || '',
    secure_url: orderData.secureUrl || '',
    status: orderData.status.toLowerCase(),
    traceable: orderData.traceable,
    metadata: sanitizeForJSON(orderData.metadata),
    customer_id: Number(orderData.customer.document.number),
    billing_address_id: Number(orderData.shipping.address.zipCode),
    shipping_address_id: Number(orderData.shipping.address.zipCode),
  }
  return dataformat
}