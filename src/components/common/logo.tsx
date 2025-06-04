import Link from 'next/link';
import { Home } from 'lucide-react';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 text-primary hover:text-accent transition-colors">
      <Home className="h-8 w-8" />
      <span className="text-2xl font-headline font-bold">EstateList</span>
    </Link>
  );
};

export default Logo;
