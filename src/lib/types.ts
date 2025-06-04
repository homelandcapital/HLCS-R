
export type UserRole = 'agent' | 'user' | 'platform_admin';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface Agent extends BaseUser {
  role: 'agent';
  phone: string;
  agency?: string;
}

export interface GeneralUser extends BaseUser {
  role: 'user';
  savedPropertyIds?: string[];
}

export interface PlatformAdmin extends BaseUser {
  role: 'platform_admin';
}

export type AuthenticatedUser = Agent | GeneralUser | PlatformAdmin;

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  type: 'House' | 'Apartment' | 'Condo' | 'Townhouse' | 'Land';
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  images: string[];
  agent: Agent;
  amenities?: string[];
  yearBuilt?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export type InquiryStatus = 'new' | 'contacted' | 'resolved' | 'archived';

export interface Message {
  id: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyName: string;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone?: string;
  message: string; // This is the initial message
  dateReceived: string;
  status: InquiryStatus;
  conversation?: Message[];
}

// CMS Content Types
export interface CmsLink {
  text: string;
  href: string;
}

export interface CmsFeatureItem {
  iconName?: string; // To be mapped to a Lucide icon component
  title: string;
  description: string;
  link?: string;
  ctaText?: string;
}

export interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    cta: CmsLink;
    imageUrl: string;
    imageAlt: string;
    imageAiHint: string;
  };
  servicesSection: {
    title: string;
    items: CmsFeatureItem[];
  };
  whyChooseUsSection: {
    title: string;
    items: CmsFeatureItem[];
  };
  ctaSection: {
    title: string;
    subtitle: string;
    cta: CmsLink;
  };
}

export interface ServicesPageContent {
  pageTitle: string;
  headerTitle: string;
  introParagraph: string;
  services: Array<{
    title: string;
    description: string;
  }>;
  conclusionParagraph: string;
}

export interface AboutPageContent {
  pageTitle: string;
  headerTitle: string;
  introParagraph: string;
  sections: Array<{
    title: string;
    description: string;
    iconName?: string; // e.g., 'Info', 'Users', 'Building'
  }>;
  conclusionParagraph: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string; // Can be multi-line, use \n for breaks
  officeHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}
export interface ContactPageContent {
  pageTitle: string;
  headerTitle: string;
  headerDescription: string;
  contactInfo: ContactInfo;
}

export interface FooterLinkColumn {
  title: string;
  links: CmsLink[];
}

export interface FooterContent {
  logoText?: string; // Optional, if we want to make logo text configurable
  tagline: string;
  columns: FooterLinkColumn[];
  copyrightText: string;
  builtWithText: string;
}
