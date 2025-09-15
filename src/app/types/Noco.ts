export type NocoOrderMetadataCustomerFormData = {
  email: string;
  name: string;
  phone: string;
  saveInfo: boolean;
}

export type NocoOrderMetadataCustomer = {
  formData: NocoOrderMetadataCustomerFormData;
}

export type NocoOrderMetadataOrder = {
  timestamp: string;
  source: string;
  version: string;
}

export type NocoOrderMetadata = {
  order: NocoOrderMetadataOrder;
  customer: NocoOrderMetadataCustomer;
}

export type NocoOrderDataType = {
  tenant_id: string;
  company_id: number;
  amount: number;
  currency: string;
  authorization_code: string | null;
  base_price: number | null;
  external_ref: string;
  installments?: number;
  interest_rate: number | null;
  ip: string;
  paid_amount: number;
  paid_at: string | null;
  payment_method: string;
  postback_url: string | null;
  redirect_url: string | null;
  refunded_amount: number;
  refunded_at: string | null;
  refused_reason: string | null;
  return_url: string | null;
  secure_id?: string;
  secure_url?: string;
  status: string;
  traceable: boolean;
  metadata: string | NocoOrderMetadata;
  customer_id: number;
  billing_address_id: number;
  shipping_address_id: number;
}

export type Noco_OrderResponseType = {
  id: string
}