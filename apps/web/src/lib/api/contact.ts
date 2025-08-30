import axios from '@/lib/axios';

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactResponse {
  id: string;
  message: string;
  success: boolean;
}

class ContactAPI {
  // Submit general contact form (public endpoint)
  async submitContact(contact: ContactRequest): Promise<ContactResponse> {
    const response = await axios.post('/contact', contact);
    return response.data;
  }
}

export const contactAPI = new ContactAPI();