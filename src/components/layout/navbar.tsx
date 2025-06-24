
// src/components/layout/navbar.tsx
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Logo from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, LogOut, LayoutDashboard, UserCircle, Home, Briefcase, Zap, Building, Mail, Users2 as CommunityIcon, Wrench } from "lucide-react";
import { useState } from 'react';
import ThemeToggleButton from '@/components/common/theme-toggle-button';
import type { SectorKey } from '@/lib/types';


const baseNavLinks = [
  { href: '/', label: 'Home', alwaysVisible: true, icon: <Home className="h-5 w-5"/> },
  { href: '/about', label: 'About', alwaysVisible: true, icon: <UserCircle className="h-5 w-5"/> }, 
  { href: '/services', label: 'Services', alwaysVisible: true, icon: <Briefcase className="h-5 w-5"/> }, 
  { href: '/properties', label: 'Properties', sectorKey: 'realEstate' as SectorKey, icon: <Building className="h-5 w-5"/> },
  { href: '/machinery', label: 'Machinery', sectorKey: 'machinery' as SectorKey, icon: <Wrench className="h-5 w-5"/> }, 
  { href: '/development-projects', label: 'Development', sectorKey: 'development' as SectorKey, icon: <Zap className="h-5 w-5"/> },
  { href: '/community-projects', label: 'Community', sectorKey: 'community' as SectorKey, icon: <CommunityIcon className="h-5 w-5"/> },
  { href: '/contact', label: 'Contact', alwaysVisible: true, icon: <Mail className="h-5 w-5"/> }, 
];


const Navbar = () => {
  const { isAuthenticated, user, signOut, loading: authContextLoading, platformSettings } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleNavLinks = React.useMemo(() => {
    return baseNavLinks.filter(link => {
      if (link.alwaysVisible) return true;
      if (link.sectorKey) {
        const defaultVisibility = link.sectorKey === 'realEstate' ? true : (link.sectorKey === 'community' ? true : false); // Community visible by default
        return platformSettings?.sector_visibility?.[link.sectorKey] ?? defaultVisibility;
      }
      return false; // Should not happen if logic is correct
    });
  }, [platformSettings]);


  const closeMobileMenu = () => setMobileMenuOpen(false);

  const getDashboardPath = () => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'user':
          return '/users/dashboard';
        case 'agent':
          return '/agents/dashboard';
        case 'platform_admin':
          return '/admin/dashboard';
      }
    }
    return '/';
  };

  const AuthActions = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (authContextLoading) {
      return isMobile ? (
        <div className="space-y-2">
          <Button variant="ghost" disabled className="w-full justify-start">Loading...</Button>
        </div>
      ) : <Button variant="ghost" disabled>Loading...</Button>;
    }

    if (isAuthenticated && user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={isMobile ? "w-full justify-start px-2 py-2 text-lg" : "rounded-full p-0 h-9 w-9 sm:h-10 sm:w-10"}>
              <Avatar className={isMobile ? "h-7 w-7 mr-2" : "h-8 w-8 sm:h-9 sm:w-9"}>
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback>
                  {user.name ? user.name.substring(0, 2).toUpperCase() : <UserCircle className="h-5 w-5"/>}
                </AvatarFallback>
              </Avatar>
              {isMobile && <span className="ml-1">{user.name}</span>}
              <span className="sr-only">Open user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isMobile ? "start" : "end"} className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild onClick={closeMobileMenu} className="cursor-pointer">
              <Link href={getDashboardPath()}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { signOut(); closeMobileMenu(); }} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className={`flex gap-2 ${isMobile ? 'flex-col pt-4 border-t border-border' : 'items-center'}`}>
        <Button variant={isMobile ? "outline" : "ghost"} asChild onClick={closeMobileMenu} size={isMobile ? "lg" : "sm"} className={isMobile ? "w-full justify-start font-bold" : "font-bold"}>
          <Link href="/agents/login">Login</Link>
        </Button>
        <Button asChild onClick={closeMobileMenu} size={isMobile ? "lg" : "sm"} className={isMobile ? "w-full justify-start font-bold" : "font-bold"}>
          <Link href="/agents/register">Register</Link>
        </Button>
      </div>
    );
  };


  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-1">
          {visibleNavLinks.map(link => (
            <Button asChild variant="ghost" className="text-foreground hover:text-primary transition-colors font-bold group px-3" key={link.href}>
              <Link href={link.href}>
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-2">
          <ThemeToggleButton />
          <AuthActions />
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
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                <Logo />
              </SheetHeader>
              <nav className="flex flex-col space-y-1 mb-auto">
               {visibleNavLinks.map(link => (
                  <Button key={link.href} variant="ghost" asChild size="lg" className="justify-start" onClick={closeMobileMenu}>
                    <Link href={link.href}>
                      <span className="text-lg font-bold text-foreground hover:text-primary transition-colors py-2 flex items-center group">
                          {link.icon && React.cloneElement(link.icon, {className: "mr-2 h-5 w-5"})}
                          <span>{link.label}</span>
                      </span>
                    </Link>
                  </Button>
                ))}
              </nav>
              <div className="mt-auto">
                <AuthActions isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
