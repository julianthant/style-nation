import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Prisma Client Exception Filter
 * 
 * Handles Prisma database errors and converts them to appropriate HTTP responses.
 * Based on NestJS best practices for exception handling.
 * 
 * Common Prisma Error Codes:
 * - P2002: Unique constraint violation
 * - P2025: Record not found
 * - P2014: Relation violation
 * - P2003: Foreign key constraint violation
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        const status = HttpStatus.CONFLICT;
        const target = exception.meta?.target as string[];
        const field = target ? target[0] : 'field';
        
        response.status(status).json({
          statusCode: status,
          message: `A record with this ${field} already exists`,
          error: 'Conflict',
        });
        break;
      }
      
      case 'P2025': {
        // Record not found
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: 'Record not found',
          error: 'Not Found',
        });
        break;
      }
      
      case 'P2014': {
        // Relation violation
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          message: 'Invalid relation - the related record does not exist',
          error: 'Bad Request',
        });
        break;
      }
      
      case 'P2003': {
        // Foreign key constraint violation
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          message: 'Foreign key constraint violation - related record not found',
          error: 'Bad Request',
        });
        break;
      }
      
      default:
        // Default to internal server error for unknown Prisma errors
        super.catch(exception, host);
        break;
    }
  }
}