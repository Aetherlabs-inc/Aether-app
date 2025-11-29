import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Convert base64 string to Uint8Array (React Native compatible)
 * Uses a more efficient approach with proper error handling
 */
function base64ToUint8Array(base64: string): Uint8Array {
  if (!base64 || typeof base64 !== 'string') {
    throw new Error('Invalid base64 string provided');
  }
  
  // Remove any data URL prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  
  // Clean the base64 string (remove whitespace)
  const cleanBase64 = base64Data.replace(/\s/g, '');
  
  if (cleanBase64.length === 0) {
    throw new Error('Empty base64 string after cleaning');
  }
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  
  let bufferLength = cleanBase64.length * 0.75;
  if (cleanBase64[cleanBase64.length - 1] === '=') {
    bufferLength--;
    if (cleanBase64[cleanBase64.length - 2] === '=') {
      bufferLength--;
    }
  }
  
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  
  for (let i = 0; i < cleanBase64.length; i += 4) {
    const encoded1 = lookup[cleanBase64.charCodeAt(i)];
    const encoded2 = lookup[cleanBase64.charCodeAt(i + 1)];
    const encoded3 = lookup[cleanBase64.charCodeAt(i + 2)];
    const encoded4 = lookup[cleanBase64.charCodeAt(i + 3)];
    
    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }
  
  return bytes;
}

/**
 * Upload an image file to Supabase Storage
 * @param fileUri - Local file URI (from expo-image-picker)
 * @param bucketName - Name of the storage bucket (default: 'artwork_images')
 * @param folder - Optional folder path within the bucket
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
  fileUri: string,
  bucketName: string = 'artwork_images',
  folder?: string
): Promise<string> {
  try {
    // Validate file URI
    if (!fileUri) {
      throw new Error('File URI is required');
    }

    console.log('Uploading image from URI:', fileUri);

    // Get the file extension
    const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Map file extensions to proper MIME types
    const mimeTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = mimeTypeMap[fileExtension] || 'image/jpeg';
    
    // Generate a unique filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Check if file exists using legacy API
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error(`File does not exist at URI: ${fileUri}`);
    }

    console.log('File exists, reading as base64...');

    // Read the file using legacy API
    let base64: string;
    try {
      base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (readError: any) {
      console.error('Error reading file:', readError);
      throw new Error(`Failed to read file: ${readError?.message || 'Unknown error'}`);
    }
    
    // Validate base64 was read successfully
    if (!base64 || typeof base64 !== 'string' || base64.length === 0) {
      throw new Error('Failed to read file as base64. File may be empty or corrupted.');
    }

    console.log('Base64 read successfully, length:', base64.length);
    
    // Convert base64 to Uint8Array
    let bytes: Uint8Array;
    try {
      bytes = base64ToUint8Array(base64);
    } catch (convertError: any) {
      console.error('Error converting base64:', convertError);
      throw new Error(`Failed to convert base64 to bytes: ${convertError?.message || 'Unknown error'}`);
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, bytes, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw new Error(error.message || 'Failed to upload image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error('Error in uploadImage:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
}

/**
 * Delete an image from Supabase Storage
 * @param filePath - Path to the file in storage
 * @param bucketName - Name of the storage bucket (default: 'artwork_images')
 */
export async function deleteImage(
  filePath: string,
  bucketName: string = 'artwork_images'
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
}

