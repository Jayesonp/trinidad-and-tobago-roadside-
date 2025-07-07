import { supabase } from './supabase';
import mime from 'mime';

export interface UploadResult {
  fileName: string;
  filePath: string;
  publicUrl: string;
  error?: string;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  bucket: 'files',
  folder: 'uploads',
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
};

export async function uploadFile(
  fileUri: string,
  mimeType: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Validate file type
    if (!opts.allowedTypes.includes(mimeType)) {
      return {
        fileName: '',
        filePath: '',
        publicUrl: '',
        error: `File type ${mimeType} is not allowed`
      };
    }

    // Generate file name and path
    const fileExt = mime.getExtension(mimeType) || 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${opts.folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(opts.bucket)
      .upload(filePath, {
        uri: fileUri,
        type: mimeType,
        name: fileName
      } as any);

    if (error) {
      return {
        fileName,
        filePath,
        publicUrl: '',
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(opts.bucket)
      .getPublicUrl(filePath);

    return {
      fileName,
      filePath,
      publicUrl,
    };

  } catch (error) {
    return {
      fileName: '',
      filePath: '',
      publicUrl: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

export async function uploadServicePhoto(
  fileUri: string,
  mimeType: string,
  serviceRequestId?: string
): Promise<UploadResult> {
  const folder = serviceRequestId 
    ? `service-photos/${serviceRequestId}`
    : 'service-photos';

  return uploadFile(fileUri, mimeType, {
    bucket: 'files',
    folder,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * 1024 * 1024 // 5MB for photos
  });
}

export async function uploadDocument(
  fileUri: string,
  mimeType: string,
  documentType: 'license' | 'insurance' | 'registration' | 'other' = 'other'
): Promise<UploadResult> {
  return uploadFile(fileUri, mimeType, {
    bucket: 'files',
    folder: `documents/${documentType}`,
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024 // 10MB for documents
  });
}

export async function deleteFile(filePath: string, bucket: string = 'files'): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    return !error;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
}

export function getFileUrl(filePath: string, bucket: string = 'files'): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

export function validateFileSize(fileSize: number, maxSizeBytes: number = 10 * 1024 * 1024): boolean {
  return fileSize <= maxSizeBytes;
}

export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Roadside assistance specific upload functions
export async function uploadVehiclePhoto(
  fileUri: string,
  mimeType: string,
  photoType: 'damage' | 'location' | 'license_plate' | 'general'
): Promise<UploadResult> {
  return uploadFile(fileUri, mimeType, {
    bucket: 'files',
    folder: `vehicle-photos/${photoType}`,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * 1024 * 1024
  });
}

export async function uploadTechnicianPhoto(
  fileUri: string,
  mimeType: string,
  technicianId: string,
  photoType: 'before' | 'after' | 'work_in_progress'
): Promise<UploadResult> {
  return uploadFile(fileUri, mimeType, {
    bucket: 'files',
    folder: `technician-photos/${technicianId}/${photoType}`,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * 1024 * 1024
  });
}

// Batch upload function
export async function uploadMultipleFiles(
  files: Array<{ uri: string; mimeType: string }>,
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (const file of files) {
    const result = await uploadFile(file.uri, file.mimeType, options);
    results.push(result);
  }
  
  return results;
}
