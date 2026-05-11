import type { ApiResponse } from './api.types';

export interface ImageUploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export type ImageUploadResponseApiResponse = ApiResponse<ImageUploadResponse>;
