
import Link from 'next/link';
import Image from 'next/image';

const Logo = () => {
  // Replace with your actual Cloudinary URL
  const cloudinaryLogoUrl = "https://res.cloudinary.com/your-cloud-name/image/upload/your-logo-path.png";

  return (
    <Link href="/" className="flex items-center group" aria-label="Homeland Capital Home">
      <Image
        src={cloudinaryLogoUrl}
        alt="Homeland Capital Logo"
        width={180} // Adjust as needed for your logo's aspect ratio
        height={45}  // Adjust as needed
        priority // If it's above the fold
        className="h-9 w-auto" // Maintain similar sizing as before, width adjusts
      />
    </Link>
  );
};

export default Logo;
