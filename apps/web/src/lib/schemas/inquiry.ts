import * as z from 'zod'

export const inquirySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true // Optional field
        // Basic phone validation - accepts various formats
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        return phoneRegex.test(value.replace(/[\s\-\(\)\.]/g, ''))
      },
      {
        message: 'Please enter a valid phone number',
      }
    ),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  carId: z.string().uuid('Invalid car ID').optional(),
})

export type InquiryFormData = z.infer<typeof inquirySchema>

// API request type (matches backend CreateInquiryDto)
export interface CreateInquiryRequest {
  name: string
  email: string
  phone?: string
  message: string
  carId: string // Required for API - car ID must be provided
}

// API response type
export interface InquiryResponse {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  carId: string
  status: 'NEW' | 'CONTACTED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  car: {
    id: string
    make: string
    model: string
    year: number
    price: number
  }
}