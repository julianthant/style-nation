import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateInquiryDto } from '../dto/inquiry/create-inquiry.dto';
import { CreateContactDto } from '../dto/contact/create-contact.dto';
import { SearchInquiriesDto } from '../dto/inquiry/search-inquiries.dto';
import { UpdateInquiryDto } from '../dto/inquiry/update-inquiry.dto';
import { InquiryEntity } from '../entities/inquiry.entity';
import { ContactEntity } from '../entities/contact.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  // Create a new inquiry (public endpoint)
  async create(createInquiryDto: CreateInquiryDto): Promise<InquiryEntity> {
    // Verify the car exists
    const car = await this.prisma.car.findUnique({
      where: { id: createInquiryDto.carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${createInquiryDto.carId} not found`);
    }

    const inquiry = await this.prisma.inquiry.create({
      data: createInquiryDto,
      include: {
        car: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1, // Only include first image for summary
            },
          },
        },
      },
    });

    return new InquiryEntity(inquiry);
  }

  // Get all inquiries with filtering and pagination (admin endpoint)
  async findAll(searchDto: SearchInquiriesDto): Promise<{
    inquiries: InquiryEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { carId, status, page = 1, limit = 20 } = searchDto;

    // Build where clause
    const where: Prisma.InquiryWhereInput = {
      ...(carId && { carId }),
      ...(status && { status }),
    };

    // Execute queries in parallel
    const [inquiries, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        include: {
          car: {
            include: {
              images: {
                orderBy: { order: 'asc' },
                take: 1, // Only include first image
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return {
      inquiries: inquiries.map(inquiry => new InquiryEntity(inquiry)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get inquiry by ID (admin endpoint)
  async findOne(id: string): Promise<InquiryEntity> {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        car: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry with ID ${id} not found`);
    }

    return new InquiryEntity(inquiry);
  }

  // Update inquiry status (admin endpoint)
  async update(id: string, updateInquiryDto: UpdateInquiryDto): Promise<InquiryEntity> {
    // Check if inquiry exists
    const existingInquiry = await this.prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existingInquiry) {
      throw new NotFoundException(`Inquiry with ID ${id} not found`);
    }

    const inquiry = await this.prisma.inquiry.update({
      where: { id },
      data: updateInquiryDto,
      include: {
        car: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    return new InquiryEntity(inquiry);
  }

  // Delete inquiry (admin endpoint)
  async remove(id: string): Promise<void> {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry with ID ${id} not found`);
    }

    await this.prisma.inquiry.delete({
      where: { id },
    });
  }

  // Get inquiry statistics (admin endpoint)
  async getStatistics() {
    const [totalInquiries, newInquiries, contactedInquiries, closedInquiries] = await Promise.all([
      this.prisma.inquiry.count(),
      this.prisma.inquiry.count({ where: { status: 'NEW' } }),
      this.prisma.inquiry.count({ where: { status: 'CONTACTED' } }),
      this.prisma.inquiry.count({ where: { status: 'CLOSED' } }),
    ]);

    return {
      totalInquiries,
      newInquiries,
      contactedInquiries,
      closedInquiries,
    };
  }

  // Get recent inquiries for dashboard (admin endpoint)
  async getRecentInquiries(limit: number = 10): Promise<InquiryEntity[]> {
    const inquiries = await this.prisma.inquiry.findMany({
      include: {
        car: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return inquiries.map(inquiry => new InquiryEntity(inquiry));
  }

  // =================== CONTACT METHODS ===================

  // Create a new contact message (public endpoint)
  async createContact(createContactDto: CreateContactDto): Promise<ContactEntity> {
    const contact = await this.prisma.contact.create({
      data: createContactDto,
    });

    return new ContactEntity(contact);
  }

  // Get all contacts with filtering and pagination (admin endpoint)
  async findAllContacts(searchDto: { 
    status?: string; 
    page?: number; 
    limit?: number; 
  } = {}): Promise<{
    contacts: ContactEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { status, page = 1, limit = 20 } = searchDto;

    // Build where clause
    const where: Prisma.ContactWhereInput = {
      ...(status && { status: status as any }),
    };

    // Execute queries in parallel
    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      contacts: contacts.map(contact => new ContactEntity(contact)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get contact by ID (admin endpoint)
  async findOneContact(id: string): Promise<ContactEntity> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return new ContactEntity(contact);
  }

  // Update contact status (admin endpoint)
  async updateContact(id: string, updateData: { status?: 'NEW' | 'CONTACTED' | 'CLOSED' }): Promise<ContactEntity> {
    // Check if contact exists
    const existingContact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    const contact = await this.prisma.contact.update({
      where: { id },
      data: updateData,
    });

    return new ContactEntity(contact);
  }

  // Delete contact (admin endpoint)
  async removeContact(id: string): Promise<void> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    await this.prisma.contact.delete({
      where: { id },
    });
  }

  // Get contact statistics (admin endpoint)
  async getContactStatistics() {
    const [totalContacts, newContacts, contactedContacts, closedContacts] = await Promise.all([
      this.prisma.contact.count(),
      this.prisma.contact.count({ where: { status: 'NEW' } }),
      this.prisma.contact.count({ where: { status: 'CONTACTED' } }),
      this.prisma.contact.count({ where: { status: 'CLOSED' } }),
    ]);

    return {
      totalContacts,
      newContacts,
      contactedContacts,
      closedContacts,
    };
  }

  // Get recent contacts for dashboard (admin endpoint)
  async getRecentContacts(limit: number = 10): Promise<ContactEntity[]> {
    const contacts = await this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return contacts.map(contact => new ContactEntity(contact));
  }
}
