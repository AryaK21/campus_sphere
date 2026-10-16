import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  errors?: any;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  pagination?: ApiResponseData['pagination'],
  errors?: any
): Response => {
  const payload: ApiResponseData<T> = {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
    ...(errors && { errors })
  };

  return res.status(statusCode).json(payload);
};
