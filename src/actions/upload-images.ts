
'use server';

import { v2 as cloudinary } from 'cloudinary';

// Helper to check for undefined or placeholder values in environment variables
const isPlaceholder = (value: string | undefined) => !value || value.includes('YOUR_');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isConfigured = !isPlaceholder(CLOUD_NAME) && !isPlaceholder(API_KEY) && !isPlaceholder(API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
  console.log("Cloudinary configured successfully.");
} else {
  console.warn("Cloudinary environment variables are not fully configured or are set to placeholder values. Image uploads will not be available.");
}

interface UploadResult {
  urls?: string[];
  error?: string;
}

async function performUpload(files: File[], folder: string): Promise<UploadResult> {
  if (!isConfigured) {
    return { error: 'Cloudinary service is not configured on the server. Please set the environment variables in your .env.local file.' };
  }

  if (!files || files.length === 0) {
    return { error: 'No files selected for upload.' };
  }

  const uploadedUrls: string[] = [];
  try {
    for (const file of files) {
      const fileBuffer = await file.arrayBuffer();
      const mimeType = file.type;
      const encoding = 'base64';
      const base64Data = Buffer.from(fileBuffer).toString('base64');
      const fileUri = `data:${mimeType};${encoding},${base64Data}`;

      const result = await cloudinary.uploader.upload(fileUri, {
        folder: folder,
      });
      uploadedUrls.push(result.secure_url);
    }
    console.log(`Images uploaded successfully to Cloudinary folder '${folder}':`, uploadedUrls);
    return { urls: uploadedUrls };
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    const errorMessage = error.error?.message || error.message || 'Unknown error';
    return { error: `Cloudinary upload failed: ${errorMessage}` };
  }
}

export async function uploadPropertyImages(formData: FormData): Promise<UploadResult> {
  const files = formData.getAll('files') as File[];
  return performUpload(files, 'homeland_capital_properties');
}

export async function uploadMachineryImages(formData: FormData): Promise<UploadResult> {
  const files = formData.getAll('files') as File[];
  return performUpload(files, 'homeland_capital_machinery');
}

export async function uploadAgentIdImage(formData: FormData): Promise<UploadResult> {
  const files = formData.getAll('files') as File[];
  return performUpload(files, 'homeland_capital_agent_ids');
}

export async function uploadAvatarImage(formData: FormData): Promise<UploadResult> {
  const files = formData.getAll('files') as File[];
  return performUpload(files, 'homeland_capital_avatars');
}

export async function uploadCmsImages(formData: FormData): Promise<UploadResult> {
  const files = formData.getAll('files') as File[];
  return performUpload(files, 'homeland_capital_cms');
}
