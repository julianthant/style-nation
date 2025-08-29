import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private readonly bucket = 'car-images';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<{ url: string; path: string }> {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const filePath = `cars/${uniqueFileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  }

  async uploadMultipleFiles(
    files: Array<{ buffer: Buffer; filename: string; contentType: string }>,
  ): Promise<Array<{ url: string; path: string; originalName: string }>> {
    const uploadPromises = files.map(async (file) => {
      const result = await this.uploadFile(
        file.buffer,
        file.filename,
        file.contentType,
      );
      return {
        ...result,
        originalName: file.filename,
      };
    });

    return Promise.all(uploadPromises);
  }

  async deleteFile(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([filePath]);

    if (error) {
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }

  async deleteMultipleFiles(filePaths: string[]): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove(filePaths);

    if (error) {
      throw new BadRequestException(
        `Failed to delete images: ${error.message}`,
      );
    }
  }

  // Helper method to extract file path from URL
  extractPathFromUrl(url: string): string {
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex((part) => part === this.bucket);
    if (bucketIndex === -1) {
      throw new BadRequestException('Invalid image URL');
    }
    return urlParts.slice(bucketIndex + 1).join('/');
  }

  // Validate image file
  validateImageFile(file: any): void {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      );
    }
  }
}