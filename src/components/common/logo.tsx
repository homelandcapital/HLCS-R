
'use client';

import Link from 'next/link';
// import { CldImage } from 'next-cloudinary'; // Temporarily comment out CldImage
import Image from 'next/image'; // Use next/image for diagnostics

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

  if (logoPublicId === 'YOUR_LOGO_PUBLIC_ID_HERE' || !logoPublicId || logoPublicId.startsWith('https://')) {
    console.warn(`Cloudinary logo public ID ('${logoPublicId}') appears to be a placeholder or an invalid format (e.g., a full URL) in src/components/common/logo.tsx. Please set it to your actual Cloudinary public ID. Logo will fall back to text.`);
    return (
      <Link href="/" className="text-2xl font-bold text-primary group" aria-label="Homeland Capital Home">
        Homeland Capital
      </Link>
    );
  }

  // Manually construct the full URL for next/image
  const fullImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${logoPublicId}.png`;
  // Assuming the original image is PNG. If it could be other types, fetching format from Cloudinary or using CldImage is better.
  // For diagnostics, we'll assume PNG. Note: CldImage handles format optimization automatically.

  return (
    <Link href="/" className="flex items-center group" aria-label="Homeland Capital Home">
      {/* Diagnostic using next/image */}
      <Image
        src={fullImageUrl}
        alt="Homeland Capital Logo"
        width={180} // Original width from CldImage
        height={45}  // Original height from CldImage
        priority
        className="h-9 w-auto" // Original className
        unoptimized={true} // Add unoptimized for Cloudinary URLs to prevent double optimization or path issues with Next.js loader
      />
      {/*
      <CldImage
        src={logoPublicId}
        alt="Homeland Capital Logo"
        width="180"
        height="45"
        priority
        className="h-9 w-auto"
      />
      */}
    </Link>
  );
};

export default Logo;
