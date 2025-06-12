
'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';

const Logo = () => {
  // Updated to include .png, aligning with the path used for favicons
  const logoPublicId = 'v1749088331/main-inverted-logo-no-bg_o987qt.png';
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.warn("Cloudinary cloud name (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) is not configured in .env.local. Logo will fall back to text.");
    return (
      <Link href="/" className="text-2xl font-bold text-primary group" aria-label="Homeland Capital Home">
        Homeland Capital
      </Link>
    );
  }

  if (logoPublicId === 'YOUR_LOGO_PUBLIC_ID_HERE.png' || !logoPublicId || logoPublicId.endsWith('_PLACEHOLDER.png')) {
    console.warn(`Cloudinary logo public ID ('${logoPublicId}') appears to be a placeholder or is missing. Please set it to your actual Cloudinary public ID. Logo will fall back to text.`);
    return (
      <Link href="/" className="text-2xl font-bold text-primary group" aria-label="Homeland Capital Home">
        Homeland Capital
      </Link>
    );
  }

  return (
    <Link href="/" className="flex items-center group" aria-label="Homeland Capital Home">
      <CldImage
        src={logoPublicId} // Now includes .png
        alt="Homeland Capital Logo"
        width="180" // Desired display width
        height="45"  // Desired display height
        priority 
        className="h-9 w-auto" // Tailwind classes for responsive height
      />
    </Link>
  );
};

export default Logo;
