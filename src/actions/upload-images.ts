
'use server';

import { v2 as cloudinary } from 'cloudinary';

// Attempt initial configuration at module level
// This is good practice for server startup
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log("Cloudinary configured at module level.");
} else {
  console.warn("Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) not fully set at module load time. Will attempt to configure dynamically in action. Uploads might fail if not configured later or mocked.");
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

  // Check if Cloudinary is configured. If not, try to configure it now.
  // This provides a second chance if env vars were not available at module load or if running in certain environments.
  let isConfigured = !!(cloudinary.config().cloud_name && cloudinary.config().api_key && cloudinary.config().api_secret);

  if (!isConfigured) {
    console.log("Cloudinary not configured at function call, attempting to configure now...");
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      isConfigured = !!(cloudinary.config().cloud_name && cloudinary.config().api_key && cloudinary.config().api_secret);
      if (isConfigured) {
        console.log("Cloudinary configured dynamically within server action.");
      } else {
        console.error('Cloudinary dynamic configuration attempt failed. Values might be incorrect or missing from process.env.');
      }
    } else {
      console.error('Cloudinary environment variables still not set in process.env. Cannot configure.');
      console.log(`DEBUG: CLOUDINARY_CLOUD_NAME is ${process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'NOT SET'}`);
      console.log(`DEBUG: CLOUDINARY_API_KEY is ${process.env.CLOUDINARY_API_KEY ? 'set' : 'NOT SET'}`);
      console.log(`DEBUG: CLOUDINARY_API_SECRET is ${process.env.CLOUDINARY_API_SECRET ? 'set' : 'NOT SET'}`);
      return { error: 'Cloudinary service is not configured on the server. Environment variables missing.' };
    }
  }

  // Final check after attempting dynamic configuration
  if (!isConfigured) {
    console.error('Cloudinary configuration failed even after dynamic attempt. Check server logs and ensure environment variables are correctly set and accessible to the Next.js server process.');
    return { error: 'Cloudinary service configuration failed. Please check server logs and environment variables.' };
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
        folder: 'homeland_capital_properties', // Organize uploads in a specific folder
      });
      uploadedUrls.push(result.secure_url);
    }
    console.log('Images uploaded successfully to Cloudinary:', uploadedUrls);
    return { urls: uploadedUrls };
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    // Log more details about the error if available
    if (error.error && error.error.message) {
        console.error('Cloudinary API Error:', error.error.message);
    }
    return { error: `Cloudinary upload failed: ${error.message || 'Unknown error'}` };
  }
}
