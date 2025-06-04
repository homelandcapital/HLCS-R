
import Link from 'next/link';
import { Building } from 'lucide-react'; // Changed from Home to Building

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 text-primary hover:text-accent transition-colors">
      <Building className="h-8 w-8" /> {/* Changed icon */}
      <span className="text-2xl font-headline font-bold">Homeland Capital</span> {/* Changed text */}
    </Link>
  );
};

export default Logo;

