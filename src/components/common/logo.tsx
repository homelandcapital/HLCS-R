
'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';

const Logo = () => {
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

  // This check is for placeholder or missing public ID.
  if (logoPublicId === 'YOUR_LOGO_PUBLIC_ID_HERE' || !logoPublicId) {
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
        src={logoPublicId} // This is the public ID including version and folders
        alt="Homeland Capital Logo"
        width="180" // Desired display width for the rendered <img> tag
        height="45"  // Desired display height for the rendered <img> tag (maintaining aspect ratio)
        priority // If the logo is above the fold and critical for LCP
        className="h-9 w-auto" // Tailwind classes for responsive height and auto width based on intrinsic aspect ratio
        // `next-cloudinary` handles transformations like f_auto, q_auto automatically based on props and global config
      />
    </Link>
  );
};

export default Logo;
