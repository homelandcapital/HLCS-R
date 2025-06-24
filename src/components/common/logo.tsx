
'use client';

import Link from 'next/link';
import Image from 'next/image';

const Logo = () => {
  // Hardcoded full URL to the logo on Cloudinary for reliability.
  // This avoids dependency on environment variables for this critical UI element.
  const logoUrl = "https://res.cloudinary.com/douzsh9ui/image/upload/v1749088331/main-inverted-logo-no-bg_o987qt.png";

  return (
    <Link href="/" className="flex items-center group" aria-label="Homeland Capital Home">
      <Image
        src={logoUrl}
        alt="Homeland Capital Logo"
        width={180}
        height={45}
        priority
        className="h-9 w-auto"
      />
    </Link>
  );
};

export default Logo;
