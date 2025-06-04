
import Link from 'next/link';
import Logo from '@/components/common/logo';
import { footerContentData as content } from '@/lib/cms-data';

const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground py-12 mt-16 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Logo />
            <p className="text-muted-foreground text-sm mt-2">
              {content.tagline}
            </p>
          </div>
          {content.columns.map((column, index) => (
            <div key={index}>
              <h5 className="font-semibold text-foreground mb-3">{column.title}</h5>
              <ul className="space-y-2 text-sm">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {content.copyrightText}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            {content.builtWithText}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
