
import Link from 'next/link';
import Logo from '@/components/common/logo'; // Assuming you might want to use your logo here too

const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground py-12 mt-16 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Logo />
            <p className="text-muted-foreground text-sm mt-2">
              Your partner in finding the perfect property.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-3">Company</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-3">Resources</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Guides</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Support Center</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Site Map</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-3">Legal</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Homeland Capital. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Built with Next.js, Tailwind CSS, and ShadCN UI.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
