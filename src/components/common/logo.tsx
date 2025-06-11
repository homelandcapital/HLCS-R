
'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';

const Logo = () => {
  // IMPORTANT: This is the public ID of your logo in Cloudinary.
  // It includes the version folder and the asset name without the extension.
  const logoPublicId = 'v1749088331/main-inverted-logo-no-bg_o987qt'; 

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.warn("Cloudinary cloud name (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) is not configured in .env.local. Logo will fall back to text.");
    return (
      <Link href="/" className="text-2xl font-bold text-primary group" aria-label="Homeland Capital Home">
        Homeland Capital
      </Link>
    );
  }
  
  // Check if the logoPublicId is still a placeholder or an obviously invalid example.
  // This check is simplified as the main issue is providing a public ID, not a full URL.
  if (logoPublicId === 'YOUR_LOGO_PUBLIC_ID_HERE' || !logoPublicId || logoPublicId.startsWith('https://')) {
     console.warn(`Cloudinary logo public ID ('${logoPublicId}') appears to be a placeholder or an invalid format (e.g., a full URL) in src/components/common/logo.tsx. Please set it to your actual Cloudinary public ID. Logo will fall back to text.`);
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
