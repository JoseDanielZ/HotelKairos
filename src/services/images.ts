import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type { ImageUploadResponseApiResponse } from '@/models';

const base = `${environment.apiUrl}/api/v1/internal/images`;

export async function imagesUpload(file: File): Promise<ImageUploadResponseApiResponse> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<ImageUploadResponseApiResponse>(`${base}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
