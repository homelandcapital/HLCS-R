
'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';

const Logo = () => {
  // IMPORTANT: Replace 'your_logo_public_id' with the actual Public ID of your logo
  // from your Cloudinary account.
  // Also, ensure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set in your .env.local file.
  const logoPublicId = 'https://res.cloudinary.com/douzsh9ui/image/upload/v1749088331/main-inverted-logo-no-bg_o987qt.png'; // <<< REPLACE THIS

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.warn("Cloudinary cloud name not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local");
    // Fallback or simple text logo if Cloudinary isn't configured
    return (
      <Link href="/" className="text-2xl font-bold text-primary group" aria-label="Homeland Capital Home">
        Homeland Capital
      </Link>
    );
  }
  
  if (logoPublicId === 'YOUR_LOGO_PUBLIC_ID_HERE') {
     console.warn("Cloudinary logo public ID not set in src/components/common/logo.tsx. Please replace 'YOUR_LOGO_PUBLIC_ID_HERE'.");
  }


  return (
    <Link href="/" className="flex items-center group" aria-label="Homeland Capital Home">
      <CldImage
        src={logoPublicId} // This should be the public ID of your image in Cloudinary
        alt="Homeland Capital Logo"
        width="180" // Adjust width as needed
        height="45"  // Adjust height as needed for your logo's aspect ratio
        // You can add more Cloudinary transformations here if needed, e.g.,
        // crop="scale"
        // quality="auto"
        // fetchFormat="auto"
        priority // If it's above the fold
        className="h-9 w-auto" // Maintain similar sizing as before, width adjusts
      />
    </Link>
  );
};

export default Logo;
