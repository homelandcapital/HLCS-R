
'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';

const Logo = () => {
  // IMPORTANT: The publicId should be the unique identifier of your image in Cloudinary,
  // NOT the full URL. For the URL provided previously, this is the correct public ID.
  const logoPublicId = 'main-inverted-logo-no-bg_o987qt'; 

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.warn("Cloudinary cloud name (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) is not configured in .env.local. Logo will fall back to text.");
    return (
      <Link href="/" className="text-2xl font-bold text-primary group" aria-label="Homeland Capital Home">
        Homeland Capital
      </Link>
    );
  }
  
  if (logoPublicId === 'YOUR_LOGO_PUBLIC_ID_HERE' || !logoPublicId) {
     console.warn(`Cloudinary logo public ID is not set in src/components/common/logo.tsx. Please set it to your actual Cloudinary public ID. Logo will fall back to text.`);
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
