
// src/components/layout/navbar.tsx
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Logo from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, Home as HomeIcon, Briefcase, Info, Mail as MailIcon, Building } from "lucide-react";
import { useState } from 'react';
import ThemeToggleButton from '@/components/common/theme-toggle-button';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: <HomeIcon className="mr-1.5 h-4 w-4" /> },
    { href: '/properties', label: 'Properties', icon: <Building className="mr-1.5 h-4 w-4" /> },
    { href: '/services', label: 'Services', icon: <Briefcase className="mr-1.5 h-4 w-4" /> },
    { href: '/about', label: 'About', icon: <Info className="mr-1.5 h-4 w-4" /> },
    { href: '/contact', label: 'Contact', icon: <MailIcon className="mr-1.5 h-4 w-4" /> },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const AuthButtons = () => {
    let dashboardPath = '/'; // Default, should not be used if authenticated
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'user':
          dashboardPath = '/users/dashboard';
          break;
        case 'agent':
          dashboardPath = '/agents/dashboard';
          break;
        case 'platform_admin':
          dashboardPath = '/admin/dashboard';
          break;
      }
    }

    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {isAuthenticated && user ? (
          <>
            <span className="text-sm text-foreground hidden sm:block py-2">Welcome, {user.name}!</span>
            <Button variant="outline" asChild onClick={closeMobileMenu} size="sm" className="w-full sm:w-auto justify-start sm:justify-center">
              <Link href={dashboardPath} className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => { logout(); closeMobileMenu(); }} size="sm" className="w-full sm:w-auto justify-start sm:justify-center">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" asChild onClick={closeMobileMenu} size="sm" className="w-full sm:w-auto justify-start sm:justify-center">
              <Link href="/agents/login">Login</Link>
            </Button>
            <Button asChild onClick={closeMobileMenu} size="sm" className="w-full sm:w-auto justify-start sm:justify-center">
              <Link href="/agents/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map(link => (
            <Button key={link.href} variant="ghost" asChild className="text-foreground hover:text-primary transition-colors font-medium group px-3">
              <Link href={link.href} className="flex items-center">
                {React.cloneElement(link.icon, { className: "mr-1.5 h-4 w-4 text-primary group-hover:text-accent transition-colors" })}
                {link.label}
              </Link>
            </Button>
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
            <SheetContent side="right" className="w-[280px] bg-background p-6 flex flex-col">
              <div className="mb-6">
                <Logo />
              </div>
              <nav className="flex flex-col space-y-1">
               {navLinks.map(link => (
                  <Button key={link.href} variant="ghost" asChild size="lg" className="justify-start" onClick={closeMobileMenu}>
                    <Link href={link.href} className="text-lg text-foreground hover:text-primary transition-colors py-2 flex items-center group">
                       {React.cloneElement(link.icon, { className: "mr-2 h-5 w-5 text-primary group-hover:text-accent transition-colors" })}
                        {link.label}
                    </Link>
                  </Button>
                ))}
              </nav>
              <div className="mt-auto pt-4 border-t border-border">
                {!loading && <AuthButtons />}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
