import { z } from 'zod'

export const tripSchema = z.object({
  destination: z.string().min(1, 'Destination is required').max(100),
  sourceLocation: z.string().min(1, 'Source location is required').max(100),
  groupSize: z.string().min(1, 'Group size is required'),
  budget: z.string().min(1, 'Budget is required'),
  duration: z.number().min(1, 'Duration must be at least 1 day').max(365, 'Duration cannot exceed 365 days'),
  interests: z.array(z.string()).min(1, 'At least one interest is required'),
})

export const paymentSchema = z.object({
  planId: z.enum(['pro', 'premium', 'enterprise']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  paymentMethod: z.enum(['momo', 'card']),
  phoneNumber: z.string().optional(),
})

export const trackingSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  timestamp: z.number(),
  source: z.enum(['gps', 'wifi', 'sim', 'ip', 'bluetooth']),
})

export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data)
}