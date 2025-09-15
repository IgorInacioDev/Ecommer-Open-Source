export type OrderDataType = {
    amount: number,
    paymentMethod: string,
    pix?: {
      expiresInDays: number
    },
    items: {
        title: string,
        unitPrice: number,
        quantity: number,
        tangible: boolean,
        externalRef: string
      }[],
    shipping: {
      fee: number,
      address: {
        street: string,
        streetNumber: string,
        neighborhood: string,
        city: string,
        state: string,
        zipCode: string,
        country: string,
        complement: string
      }
    },
    customer: {
      name: string,
      email: string,
      phone: string,
      document: {
        number: string, 
        type: string}
    },
    metadata: string,
    externalRef: string,
    ip: string,
    postbackUrl?: string
}

export type CustomerDataType = {
  name: string;
  email: string;
  phone: string;
  document_number: string;
  document_type: string;
  external_ref: string;
}



export type FormData = {
  email: string,
  country: string,
  firstName: string,
  lastName: string,
  zipCode: string,
  address: string,
  number: string,
  complement: string,
  neighborhood: string,
  city: string,
  state: string,
  phone: string,
  saveInfo: boolean,
  discountCode: string,
  cpf: string
}