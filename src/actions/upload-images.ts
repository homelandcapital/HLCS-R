
'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// This is done once, typically when the server starts or when the module is loaded.
// Ensure your environment variables are set in .env.local:
// CLOUDINARY_CLOUD_NAME=your_cloud_name
// CLOUDINARY_API_KEY=your_api_key
// CLOUDINARY_API_SECRET=your_api_secret

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn("Cloudinary environment variables are not fully set. Uploads will likely fail if not mocked for local dev without env vars.");
}

interface UploadResult {
  urls?: string[];
  error?: string;
}

export async function uploadPropertyImages(formData: FormData): Promise<UploadResult> {
  const files = formData.getAll('files') as File[];

  if (!files || files.length === 0) {
    return { error: 'No files selected for upload.' };
  }

  // Check if Cloudinary is configured
  if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
    console.error('Cloudinary is not configured. Please check your environment variables.');
    // For production, you might want to throw an error or return a more specific error message.
    // For development, if you want to allow testing without Cloudinary, you could return mock URLs here.
    // However, since the user has confirmed setting up env vars, we expect it to be configured.
    return { error: 'Cloudinary service is not configured on the server.' };
  }

  const uploadedUrls: string[] = [];
  try {
    for (const file of files) {
      // Convert file to base64 data URI
      const fileBuffer = await file.arrayBuffer();
      const mimeType = file.type;
      const encoding = 'base64';
      const base64Data = Buffer.from(fileBuffer).toString('base64');
      const fileUri = `data:${mimeType};${encoding},${base64Data}`;

      const result = await cloudinary.uploader.upload(fileUri, {
        folder: 'homeland_capital_properties', // Organize uploads in a specific folder
        // You can add other upload options here, e.g., transformations, public_id, etc.
        // resource_type: 'image' is default, can be 'video', 'raw', etc.
      });
      uploadedUrls.push(result.secure_url);
    }
    console.log('Images uploaded successfully to Cloudinary:', uploadedUrls);
    return { urls: uploadedUrls };
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    return { error: `Cloudinary upload failed: ${error.message || 'Unknown error'}` };
  }
}
