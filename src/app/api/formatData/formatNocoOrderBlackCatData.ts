import { BlackCatOrderDataType } from "@/app/types/BlackCat"
import { NocoOrderDataType } from "@/app/types/Noco"
import { sanitizeForJSON } from "@/app/utils/sanitizeUtils"

export default function formatNocoOrderBlackCatData (orderData: BlackCatOrderDataType) {
  const dataformat: NocoOrderDataType = { 
    tenant_id: orderData.tenantId,
    company_id: orderData.companyId,
    amount: orderData.amount,
    currency: orderData.currency,
    authorization_code: orderData.authorizationCode || null,
    base_price: orderData.basePrice || null,
    external_ref: orderData.externalRef,
    installments: orderData.installments,
    interest_rate: orderData.interestRate || null,
    ip: orderData.ip,
    paid_amount: orderData.paidAmount,
    paid_at: orderData.paidAt || null,
    payment_method: orderData.paymentMethod,
    postback_url: orderData.postbackUrl || null,
    redirect_url: orderData.redirectUrl || null,
    refunded_amount: orderData.refundedAmount,
    refunded_at: orderData.refundedAt || null,
    refused_reason: orderData.refusedReason || null,
    return_url: orderData.returnUrl || null,
    secure_id: orderData.secureId,
    secure_url: orderData.secureUrl,
    status: orderData.status,
    traceable: orderData.traceable,
    metadata: sanitizeForJSON(orderData.metadata),
    customer_id: orderData.customer.id,
    billing_address_id: orderData.customer.address ? orderData.customer.id : 0,
    shipping_address_id: orderData.shipping.address ? orderData.customer.id : 0
  }

  return dataformat
}