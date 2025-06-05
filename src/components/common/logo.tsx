'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';

const Logo = () => {
  // IMPORTANT: Replace 'your_logo_public_id' with the actual Public ID of your logo
  // from your Cloudinary account.
  // Also, ensure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set in your .env.local file.
  const logoPublicId = 'https://res.cloudinary.com/douzsh9ui/image/upload/v1749088331/main-inverted-logo-no-bg_o987qt.png'; 

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.warn("Cloudinary cloud name (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) is not configured in .env.local. Logo will fall back to text.");
    return (
      <Link href="/" className="text-2xl font-bold text-primary group" aria-label="Homeland Capital Home">
        Homeland Capital
      </Link>
    );
  }
  
  // Check if the logoPublicId is still the placeholder or an invalid example
  if (logoPublicId === 'YOUR_LOGO_PUBLIC_ID_HERE' || !logoPublicId || logoPublicId.startsWith('https://res.cloudinary.com/YOUR_CLOUD_NAME')) {
     console.warn(`Cloudinary logo public ID ('${logoPublicId}') appears to be a placeholder or invalid in src/components/common/logo.tsx. Please set it to your actual Cloudinary public ID. Logo will fall back to text.`);
     return (
      <Link href="/" className="text-2xl font-bold text-primary group" aria-label="Homeland Capital Home">
        Homeland Capital
      </Link>
    );
  }


  return (
    <Link href="/" className="flex items-center group" aria-label="Homeland Capital Home">
      <CldImage
        src={logoPublicId} 
        alt="Homeland Capital Logo"
        width="180" 
        height="45"  
        priority 
        className="h-9 w-auto" 
      />
    </Link>
  );
};

export default Logo;