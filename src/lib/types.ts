

export type UserRole = 'agent' | 'user' | 'platform_admin';

export interface BaseUser {
  id: string; 
  name: string;
  email: string;
  avatar_url?: string | null; // Changed from avatarUrl to match DB
  role: UserRole;
}

export interface Agent extends BaseUser {
  role: 'agent';
  phone: string;
  agency?: string | null;
}

export interface GeneralUser extends BaseUser {
  role: 'user';
  savedPropertyIds?: string[];
}

export interface PlatformAdmin extends BaseUser {
  role: 'platform_admin';
}

export type AuthenticatedUser = Agent | GeneralUser | PlatformAdmin;


export type PropertyStatus = Database['public']['Enums']['property_status_enum'];
export const propertyStatuses: PropertyStatus[] = ['pending', 'approved', 'rejected'];

export type NigerianState = Database['public']['Enums']['nigerian_state_enum'];
export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
] as const;

export type ListingType = Database['public']['Enums']['listing_type_enum'];
export const listingTypes: ListingType[] = ['For Sale', 'For Rent', 'For Lease'];

// This 'propertyTypes' const is used as a fallback if platform settings fail to load.
// And also by PropertySearchFilter. The canonical list is now in platform_settings.
export const propertyTypes: string[] = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Shortlet', 'Office Space', 'Warehouse'];


export interface PromotionTierConfig {
  id: string;
  name: string;
  fee: number;
  duration: number;
  description: string;
}

export interface PromotionDetails {
  tier_id: string;
  tier_name: string;
  promoted_at: string;
}

// Interface for Property aligning with Supabase 'properties' table
export interface Property {
  id: string; // UUID
  human_readable_id?: string | null; // New user-friendly ID
  title: string;
  description: string;
  price: number; // NUMERIC
  listing_type: ListingType;
  location_area_city: string;
  state: NigerianState;
  address: string;
  property_type: string; // Changed from PropertyTypeEnum to string
  bedrooms: number; // INT
  bathrooms: number; // INT
  area_sq_ft?: number | null; // NUMERIC
  images?: string[] | null; // JSONB (array of URLs)
  amenities?: string[] | null; // JSONB (array of strings)
  year_built?: number | null; // INT
  coordinates_lat?: number | null; // DOUBLE PRECISION
  coordinates_lng?: number | null; // DOUBLE PRECISION
  
  agent_id: string | null; // UUID, FK to users.id
  agent?: Agent | null; // For populated agent data

  status: PropertyStatus;
  rejection_reason?: string | null; // TEXT

  is_promoted?: boolean | null; // BOOLEAN
  promotion_tier_id?: string | null; // TEXT
  promotion_tier_name?: string | null; // TEXT
  promoted_at?: string | null; // TIMESTAMPTZ (ISO string)
  promotion_expires_at?: string | null; // TIMESTAMPTZ (ISO string)
  
  created_at: string; // TIMESTAMPTZ (ISO string)
  updated_at: string; // TIMESTAMPTZ (ISO string)

  promotionDetails?: PromotionDetails | null;
}


export type InquiryStatus = Database['public']['Enums']['inquiry_status'];
export const inquiryStatuses: InquiryStatus[] = ['new', 'contacted', 'resolved', 'archived'];

export interface InquiryMessage {
  id: string; 
  inquiry_id: string; 
  sender_id: string | null; 
  sender_role: UserRole;
  sender_name: string; 
  content: string;
  timestamp: string; 
}

export interface Inquiry {
  id: string; 
  property_id: string; 
  property_name: string;
  inquirer_name: string;
  inquirer_email: string;
  inquirer_phone?: string | null;
  initial_message: string; 
  created_at: string; 
  updated_at?: string | null; 
  status: InquiryStatus;
  user_id?: string | null; 
  conversation?: InquiryMessage[];
}


// CMS Content Types
export interface CmsLink {
  text: string;
  href: string;
}

export interface CmsFeatureItem {
  iconName?: string;
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
    iconName?: string;
  }>;
  conclusionParagraph: string;
}

// Old ContactPageContent, to be replaced or merged
export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
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


// New structure for Contact Page
export interface OfficeDetails {
  tabName: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  mapCoordinates: { lat: number; lng: number };
  mapTitle: string;
}

export interface ContactPageContentNew {
  pageTitle: string;
  headerTitle: string;
  headerSubtitle: string;
  formSection: {
    title: string;
    inquiryTypes: string[];
  };
  officesSection: {
    title: string;
    headquarters: OfficeDetails;
    regionalOffice?: OfficeDetails;
  };
  businessHoursSection: {
    title: string;
    hours: Array<{ day: string; time: string }>;
  };
  investorRelationsSection: {
    title: string;
    description: string;
    email: string;
    phone: string;
  };
}


export interface FooterLinkColumn {
  title: string;
  links: CmsLink[];
}

export interface FooterContent {
  logoText?: string;
  tagline: string;
  columns: FooterLinkColumn[];
  copyrightText: string;
  builtWithText: string;
}

export interface PlatformSettings {
  promotionsEnabled: boolean;
  promotionTiers: PromotionTierConfig[];
  siteName: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  notificationEmail: string;
  predefinedAmenities: string; // Stored as comma-separated string
  propertyTypes: string[]; // Stored as TEXT[] in DB
}

// Import Database type from supabase
import type { Database } from './database.types';

    