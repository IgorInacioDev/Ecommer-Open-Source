export type BlackCatOrderDataType = {
  id: number;
  tenantId: string;
  companyId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  installments: number;
  paidAt: string | null;
  paidAmount: number;
  refundedAt: string | null;
  refundedAmount: number;
  redirectUrl: string | null;
  returnUrl: string | null;
  postbackUrl: string | null;
  metadata: Record<string, unknown>;
  ip: string;
  externalRef: string;
  secureId: string;
  secureUrl: string;
  createdAt: string;
  updatedAt: string;
  payer: null;
  traceable: boolean;
  authorizationCode: string | null;
  basePrice: number | null;
  interestRate: number | null;
  items: {
    title: string;
    quantity: number;
    tangible: boolean;
    unitPrice: number;
    externalRef: string;
  }[];
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    birthdate: string | null;
    createdAt: string;
    externalRef: string | null;
    document: {
      type: string;
      number: string;
    };
    address: {
      street: string;
      streetNumber: string;
      complement: string;
      zipCode: string;
      neighborhood: string;
      city: string;
      state: string;
      country: string | null;
    };
  };
  fee: {
    netAmount: number;
    estimatedFee: number;
    fixedAmount: number;
    spreadPercent: number;
    currency: string;
  };
  splits: {
    amount: number;
    netAmount: number;
    recipientId: number;
    chargeProcessingFee: boolean;
  }[];
  refunds: Array<Record<string, unknown>>;
  pix: {
    qrcode: string;
    end2EndId: string | null;
    receiptUrl: string | null;
    expirationDate: string;
  };
  boleto: null;
  card: null;
  refusedReason: null;
  shipping: {
    fee: number;
    address: {
      street: string;
      streetNumber: string;
      complement: string;
      neighborhood: string;
      zipCode: string;
      city: string;
      state: string;
      country: string | null;
    };
  };
  delivery: {
    status: string;
    trackingCode: string | null;
    createdAt: string;
    updatedAt: string;
  };
  threeDS: null;
}