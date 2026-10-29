import { HttpStatus } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

export interface MappedError {
  status: number;
  message: string;
}

// Returns an HTTP status and message for known Prisma errors, or null if it isn't one
export function mapPrismaError(e: unknown): MappedError | null {
  // database unreachable
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return { status: HttpStatus.SERVICE_UNAVAILABLE, message: 'Database is not available' };
  }

  if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  const model = typeof e.meta?.modelName === 'string' ? e.meta.modelName : 'Record';

  switch (e.code) {
    case 'P2002': {
      // unique constraint, e.g. a duplicate email
      const target = e.meta?.target;
      const fields = Array.isArray(target) ? target.join(', ') : null;
      return {
        status: HttpStatus.CONFLICT,
        message: fields
          ? `${model} with this ${fields} already exists`
          : `${model} already exists`,
      };
    }
    case 'P2025': // record to update or delete was not found
      return { status: HttpStatus.NOT_FOUND, message: `${model} not found` };

    case 'P2003': // foreign key: still referenced, or points to something that doesn't exist
    case 'P2014':
      return {
        status: HttpStatus.CONFLICT,
        message: 'This record is linked to other records, or refers to one that does not exist',
      };

    case 'P2000': // value too long for the column
      return { status: HttpStatus.BAD_REQUEST, message: 'A value is too long' };

    case 'P2034': // transaction conflict, safe to retry
      return { status: HttpStatus.CONFLICT, message: 'Conflict, please try again' };

    case 'P1001': // can't reach the database server
      return { status: HttpStatus.SERVICE_UNAVAILABLE, message: 'Database is not available' };

    default:
      return null; // unknown code: let it become a 500 and get logged
  }
}