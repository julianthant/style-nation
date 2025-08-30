import * as z from 'zod'

export const contactSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
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
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  // Honeypot field for spam prevention
  website: z.string().optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>

// API request type (what we send to backend)
export interface CreateContactRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
}

// API response type
export interface ContactResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'NEW' | 'CONTACTED' | 'CLOSED'
  createdAt: string
  updatedAt: string
}