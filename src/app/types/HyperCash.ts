export type AddressType = {
  street: string;
  streetNumber?: string;
  number?: string;
  complement?: string;
  zipCode: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

export type DocumentType = {
  number: string;
  type: 'CPF' | 'CNPJ';
}

export type CustomerType = {
  name: string;
  email: string;
  document: DocumentType;
  phone: string;
}

export type ShippingType = {
  fee: number;
  address: AddressType;
}

export type ItemType = {
  title: string;
  unitPrice: number;
  quantity: number;
  tangible: boolean;
  externalRef: string;
}

export type BoletoType = {
  expiresInDays: number;
}

export type PixType = {
  expiresInDays: number;
}

export type SubMerchantType = {
  id: string;
  mcc: number;
  identificationNumber: string;
  legalName: string;
  fancyName: string;
  invoiceName: string;
  address: AddressType;
  phone: string;
  url: string;
}

export type HyperCashOrderDataType = {
  amount: number;
  currency: string;
  paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  customer: CustomerType;
  shipping: ShippingType;
  items: ItemType[];
  boleto?: BoletoType;
  pix?: PixType;
  postbackUrl?: string;
  metadata?: Record<string, unknown>;
  traceable?: boolean;
  ip: string;
}

export type HyperCashOrderResponseDataType = {
    id: string;
    amount: number;
    paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
    refundedAmount: number;
    installments: number | null;
    status: string;
    postbackUrl: string | null;
    metadata?: Record<string, unknown>;
    traceable: boolean;
    secureId: string | null;
    secureUrl: string | null;
    ip: string;
    externalRef: number;
    endToEndId: string | null;
    externalNsu: string | null;
    releaseDate: string | null;
    refusedReason: string | null;
    gatewayId: string;
    companyId: string;
    customerId: string;
    providerId: string;
    cardId: string | null;
    currency: string;
    antifraudSessions: Record<string, unknown> | null;
    boleto: Record<string, never>;
    card: Record<string, never>;
    pix: {
      qrcode: string;
      expirationDate: string;
    };
    customer: {
      id: string;
      externalRef: string | null;
      name: string;
      email: string;
      phone: string;
      birthdate: string | null;
      document: DocumentType;
    };
    shipping: {
      fee: number;
      address: AddressType;
    };
    items: ItemType[];
    delivery: Record<string, never>;
    fee: {
      netAmount: number;
      fixedAmount: number;
      estimatedFee: number;
      spreadPercentage: number;
    };
    refunds: Array<Record<string, unknown>>;
    company: {
      sellerName: string;
      sellerDocument: string;
    };
    createdAt: string;
    updatedAt: string;
    paidAt: string;
};

export type HyperCashOrderResponseType = {
    status: number,
    message: string,
    data: HyperCashOrderResponseDataType
    error: null | string
};

