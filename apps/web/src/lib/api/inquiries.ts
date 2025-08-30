import axios from '@/lib/axios'
import { CreateInquiryRequest, InquiryResponse } from '@/lib/schemas/inquiry'
import { CreateContactRequest, ContactResponse } from '@/lib/schemas/contact'

// Legacy interface for backward compatibility
export interface Inquiry {
  id: string;
  carId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  car?: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    images?: Array<{
      id: string;
      url: string;
      isPrimary: boolean;
      order: number;
    }>;
  };
}

export class InquiriesAPI {
  /**
   * Submit a car-specific inquiry
   * Uses public API endpoint - no authentication required
   */
  async submitInquiry(inquiry: CreateInquiryRequest): Promise<InquiryResponse> {
    try {
      const response = await axios.post('/inquiries', inquiry)
      return response.data
    } catch (error) {
      console.error('Failed to submit inquiry:', error)
      
      // Extract meaningful error message
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to submit inquiry'
        throw new Error(Array.isArray(message) ? message[0] : message)
      }
      
      throw new Error('Failed to submit inquiry. Please try again.')
    }
  }

  /**
   * Submit a general contact form message
   * Uses public API endpoint - no authentication required
   */
  async submitContact(contact: CreateContactRequest): Promise<ContactResponse> {
    try {
      const response = await axios.post('/contact', contact)
      return response.data
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      
      // Extract meaningful error message
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to submit contact form'
        throw new Error(Array.isArray(message) ? message[0] : message)
      }
      
      throw new Error('Failed to submit contact form. Please try again.')
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use submitContact instead
   */
  async submitContactLegacy(contact: Omit<CreateInquiryRequest, 'carId'>): Promise<any> {
    // Convert to new contact format
    const contactData: CreateContactRequest = {
      firstName: contact.name.split(' ')[0] || contact.name,
      lastName: contact.name.split(' ').slice(1).join(' ') || 'Customer',
      email: contact.email,
      phone: contact.phone,
      subject: 'General Inquiry',
      message: contact.message,
    }
    
    return this.submitContact(contactData)
  }

  /**
   * Get inquiry statistics (for potential future use)
   * This would require authentication if used
   */
  async getInquiryStatistics(): Promise<{
    totalInquiries: number
    newInquiries: number
    contactedInquiries: number
    closedInquiries: number
  }> {
    try {
      const response = await axios.get('/inquiries/statistics')
      return response.data
    } catch (error) {
      console.error('Failed to get inquiry statistics:', error)
      throw new Error('Failed to load inquiry statistics')
    }
  }
}

// Create and export a singleton instance
export const inquiriesAPI = new InquiriesAPI()

// Export convenience functions
export const submitInquiry = (inquiry: CreateInquiryRequest) => 
  inquiriesAPI.submitInquiry(inquiry)

export const submitContact = (contact: CreateContactRequest) => 
  inquiriesAPI.submitContact(contact)