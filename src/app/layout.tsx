
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'Homeland Capital - Your Dream Property Awaits',
  description: 'Find and list properties with Homeland Capital. AI-powered descriptions, map integration, and more.',
  // Note: Explicit <link> tags for icons are added below in the <head>
  // to use Cloudinary URLs directly, as creating local favicon files is not possible here.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cloudinaryBaseUrl = "https://res.cloudinary.com/douzsh9ui/image/upload";
  // Ensure this path points to the "HC" logo with teal H and gold C
  const logoVersionAndPath = "v1749088331/main-inverted-logo-no-bg_o987qt.png";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />

        {/* Favicon Links using Cloudinary */}
        <link rel="icon" href={`${cloudinaryBaseUrl}/w_32,h_32,c_fit,f_png/${logoVersionAndPath}`} type="image/png" sizes="32x32" />
        <link rel="icon" href={`${cloudinaryBaseUrl}/w_16,h_16,c_fit,f_png/${logoVersionAndPath}`} type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href={`${cloudinaryBaseUrl}/w_180,h_180,c_fit,f_png/${logoVersionAndPath}`} sizes="180x180" />
        {/* For a more complete set, you might also consider a manifest.json and other icon sizes,
            but this covers the basics using your existing Cloudinary logo. */}
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
