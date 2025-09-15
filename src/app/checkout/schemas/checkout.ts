import { z } from 'zod';

export const formDataSchema = z.object({
  email: z.string().email(),
  country: z.string().min(2),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  zipCode: z.string().min(5),
  address: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional().default(''),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  phone: z.string().min(8),
  saveInfo: z.boolean().default(false),
  discountCode: z.string().optional().default(''),
  cpf: z.string().regex(/^\d{11}$/)
});

export type FormDataInput = z.infer<typeof formDataSchema>;