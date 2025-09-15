import { z } from 'zod'

const itemSchema = z.object({
  title: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  tangible: z.boolean(),
  externalRef: z.string().min(1)
})

const addressSchema = z.object({
  street: z.string().min(1),
  streetNumber: z.string().min(1),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(5),
  country: z.string().min(2),
  complement: z.string()
})

const shippingSchema = z.object({
  fee: z.number().min(0),
  address: addressSchema
})

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(8),
  document: z.object({
    number: z.string().min(1),
    type: z.string().min(2)
  })
})

export const orderDataSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().min(2),
  pix: z.object({ expiresInDays: z.number().int().positive() }).optional(),
  items: z.array(itemSchema).min(1),
  shipping: shippingSchema,
  customer: customerSchema,
  metadata: z
    .union([z.string(), z.record(z.string(), z.any())])
    .transform((v) => (typeof v === 'string' ? v : JSON.stringify(v))),
  externalRef: z.string().min(1),
  ip: z.string().min(1),
  postbackUrl: z.string().url().optional()
}).strict()

export const payloadSchema = z.object({
  orderData: orderDataSchema
}).strict()