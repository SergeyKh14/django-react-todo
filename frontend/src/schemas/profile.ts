import { z } from 'zod'

export const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
})

export type ProfileInput = z.infer<typeof profileSchema>
