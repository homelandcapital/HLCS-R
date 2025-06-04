
// src/components/layout/navbar.tsx
"use client";

import * as React from 'react'; // Added React import
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Logo from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, ShieldCheck, Bookmark, Home as HomeIcon, Briefcase, Info, Mail as MailIcon, Building } from "lucide-react";
import { useState } from 'react';
import ThemeToggleButton from '@/components/common/theme-toggle-button';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const staticNavLinks = [
    { href: '/', label: 'Home', icon: <HomeIcon className="mr-1.5 h-4 w-4 text-primary md:mr-0" /> },
    { href: '/properties', label: 'Properties', icon: <Building className="mr-1.5 h-4 w-4 text-primary md:mr-0" /> },
    { href: '/services', label: 'Services', icon: <Briefcase className="mr-1.5 h-4 w-4 text-primary md:mr-0" /> },
    { href: '/about', label: 'About', icon: <Info className="mr-1.5 h-4 w-4 text-primary md:mr-0" /> },
    { href: '/contact', label: 'Contact', icon: <MailIcon className="mr-1.5 h-4 w-4 text-primary md:mr-0" /> },
  ];

  const dynamicNavLinks = [
    ...(isAuthenticated && user?.role === 'user'
      ? [{ href: '/users/dashboard', label: 'My Dashboard', icon: <Bookmark className="mr-1.5 h-4 w-4 text-primary md:mr-0" /> }]
      : []),
    ...(isAuthenticated && user?.role === 'agent'
      ? [
          { href: '/agents/dashboard', label: 'Agent Dashboard', icon: <LayoutDashboard className="mr-1.5 h-4 w-4 text-primary md:mr-0" /> },
          // Removed "Add Property" from here as it's in the agent dashboard sidebar
        ]
      : []),
    ...(isAuthenticated && user?.role === 'platform_admin'
      ? [{ href: '/admin/dashboard', label: 'Admin Dashboard', icon: <ShieldCheck className="mr-1.5 h-4 w-4 text-primary md:mr-0" /> }] 
      : [])
  ];
  
  const navLinks = [...staticNavLinks, ...dynamicNavLinks];


  const closeMobileMenu = () => setMobileMenuOpen(false);

  const AuthButtons = () => (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      {isAuthenticated && user ? (
        <>
          <span className="text-sm text-foreground hidden sm:block">Welcome, {user.name}!</span>
          <Button variant="ghost" onClick={() => { logout(); closeMobileMenu(); }} size="sm">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" asChild onClick={closeMobileMenu} size="sm">
            <Link href="/agents/login">Login</Link>
          </Button>
          <Button asChild onClick={closeMobileMenu} size="sm">
            <Link href="/agents/register">Register</Link>
          </Button>
        </>
      )}
    </div>
  );


  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-4">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-foreground hover:text-primary transition-colors font-medium flex items-center group">
                {React.cloneElement(link.icon, { className: "mr-1.5 h-4 w-4 text-primary group-hover:text-accent transition-colors" })}
                {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-2">
          <ThemeToggleButton />
          {!loading && <AuthButtons />}
        </div>
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggleButton />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-6">
              <div className="flex flex-col space-y-6">
                <Logo />
                <nav className="flex flex-col space-y-3">
                 {navLinks.map(link => (
                    <Link key={link.href} href={link.href} onClick={closeMobileMenu} className="text-lg text-foreground hover:text-primary transition-colors py-2 flex items-center group">
                       {React.cloneElement(link.icon, { className: "mr-2 h-5 w-5 text-primary group-hover:text-accent transition-colors" })}
                        {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="pt-4 border-t border-border">
                  {!loading && <AuthButtons />}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
