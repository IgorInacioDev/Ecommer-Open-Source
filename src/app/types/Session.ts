export type SessionCreateDataType = {
  ip: string,
  utm_source: string,
  utm_campaign: string,
  utm_medium: string,
  utm_content: string,
  utm_term: string,
  lastPage: string,
  createHyperCashOrder: boolean,
  deviceType: 'Desktop' | 'Iphone' | 'Android',
  fingerPrint: string,
  metadata: string,
  lastActivity?: string,
  CreatedAt?: Date,
  UpdatedAt?: Date
}

export type SessionResponseDataType = {
  Id?: number,
  ip: string,
  status?: boolean,
  utm_source: string,
  utm_campaign: string,
  utm_medium: string,
  utm_content: string,
  utm_term: string,
  lastPage: string,
  createOrder?: boolean,
  deviceType: 'Desktop' | 'Iphone' | 'Android',
  fingerPrint: string,
  metadata: string,
  lastActivity?: string,
  CreatedAt?: Date,
  UpdatedAt?: Date
}

// Tipo para o retorno da API de todas as ordens
export type SessionResponseType = {
  list: SessionResponseDataType[];
  pageInfo: {
    totalRows: number,
    page: number,
    pageSize: number,
    isFirstPage: boolean,
    isLastPage: boolean
  }
}

export type UpdateSessionDataType = {
  Id?: number,
  ip?: string,
  status?: boolean,
  utm_source?: string,
  utm_campaign?: string,
  utm_medium?: string,
  utm_content?: string,
  utm_term?: string,
  lastPage?: string,
  createOrder?: boolean,
  deviceType?: 'Desktop' | 'Iphone' | 'Android',
  fingerPrint?: string,
  metadata?: string,
  lastActivity?: string,
  CreatedAt?: Date,
  UpdatedAt?: Date
}

export type UpdateSessionResponseType = {
  Id: number
}