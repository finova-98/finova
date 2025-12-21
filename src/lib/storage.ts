import { supabase } from './supabase';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  path: string;
  fullPath: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (default: 'invoices')
 * @param folder - Optional folder path within the bucket
 * @param onProgress - Optional callback for upload progress
 * @returns Upload result with public URL and path
 */
export async function uploadFile(
  file: File,
  bucket: string = 'invoices',
  folder?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to upload files');
  }

  // Create a unique file name with timestamp
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  // Construct the full path
  const folderPath = folder || user.id;
  const filePath = `${folderPath}/${fileName}`;

  // Upload the file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
    fullPath: `${bucket}/${data.path}`,
  };
}

/**
 * Delete a file from Supabase Storage
 * @param path - The file path to delete
 * @param bucket - The storage bucket name (default: 'invoices')
 */
export async function deleteFile(
  path: string,
  bucket: string = 'invoices'
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get a public URL for a file
 * @param path - The file path
 * @param bucket - The storage bucket name (default: 'invoices')
 */
export function getPublicUrl(path: string, bucket: string = 'invoices'): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

/**
 * List files in a folder
 * @param folder - The folder path
 * @param bucket - The storage bucket name (default: 'invoices')
 */
export async function listFiles(folder: string, bucket: string = 'invoices') {
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return data;
}

/**
 * Download a file from storage
 * @param path - The file path
 * @param bucket - The storage bucket name (default: 'invoices')
 */
export async function downloadFile(path: string, bucket: string = 'invoices') {
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  return data;
}
