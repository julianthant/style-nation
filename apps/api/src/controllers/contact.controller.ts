import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { CreateContactDto } from '../dto/contact/create-contact.dto';
import { ContactEntity } from '../entities/contact.entity';
import { InquiriesService } from '../services/inquiries.service';

// Contact Controller - for general contact form submissions
@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  // Public endpoint - Submit general contact form
  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit a general contact form message' })
  @ApiResponse({
    status: 201,
    description: 'Contact message submitted successfully',
    type: ContactEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createContactDto: CreateContactDto) {
    return this.inquiriesService.createContact(createContactDto);
  }

  // Admin endpoints for contact management

  @Get()
  @ApiOperation({ summary: 'Get all contact messages with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Contacts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        contacts: { type: 'array', items: { $ref: '#/components/schemas/ContactEntity' } },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 3 },
      },
    },
  })
  async findAll(@Query() searchParams: { status?: string; page?: string; limit?: string }) {
    const { status, page, limit } = searchParams;
    return this.inquiriesService.findAllContacts({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get contact statistics for admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalContacts: { type: 'number', example: 100 },
        newContacts: { type: 'number', example: 25 },
        contactedContacts: { type: 'number', example: 60 },
        closedContacts: { type: 'number', example: 15 },
      },
    },
  })
  async getStatistics() {
    return this.inquiriesService.getContactStatistics();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent contacts for dashboard' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Recent contacts retrieved successfully',
    type: [ContactEntity],
  })
  async getRecentContacts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.inquiriesService.getRecentContacts(limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiParam({
    name: 'id',
    description: 'Contact ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Contact retrieved successfully', type: ContactEntity })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inquiriesService.findOneContact(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contact status' })
  @ApiParam({
    name: 'id',
    description: 'Contact ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Contact updated successfully', type: ContactEntity })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateData: { status?: 'NEW' | 'CONTACTED' | 'CLOSED' }) {
    return this.inquiriesService.updateContact(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete contact' })
  @ApiParam({
    name: 'id',
    description: 'Contact ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 204, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.inquiriesService.removeContact(id);
  }
}