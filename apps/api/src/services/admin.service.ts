import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { AdminEntity } from '../entities/admin.entity';

@Injectable()
export class AdminService {
  private readonly SALT_ROUNDS = 10;

  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<AdminEntity> {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return new AdminEntity(admin);
  }

  async findByEmail(email: string): Promise<AdminEntity | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    return admin ? new AdminEntity(admin) : null;
  }

  async getProfile(id: string): Promise<AdminEntity> {
    return this.findOne(id);
  }


  async updateProfile(id: string, updateData: { name?: string; email?: string }): Promise<AdminEntity> {
    const { name, email } = updateData;

    // If updating email, check if it's already in use
    if (email) {
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { email },
      });

      if (existingAdmin && existingAdmin.id !== id) {
        throw new ConflictException('Email is already in use');
      }
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
      },
    });

    return new AdminEntity(updatedAdmin);
  }
}