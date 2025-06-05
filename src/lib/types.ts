
export type UserRole = 'agent' | 'user' | 'platform_admin';

export interface BaseUser {
  id: string; // Supabase user ID is UUID, comes as string
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
  savedPropertyIds?: string[]; // These would be property UUIDs from the DB
}

export interface PlatformAdmin extends BaseUser {
  role: 'platform_admin';
}

export type AuthenticatedUser = Agent | GeneralUser | PlatformAdmin;

// ENUM types matching the database
export type PropertyStatus = 'pending' | 'approved' | 'rejected';
export const propertyStatuses: PropertyStatus[] = ['pending', 'approved', 'rejected'];

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
] as const;
export type NigerianState = typeof nigerianStates[number];

export type ListingType = 'For Sale' | 'For Rent' | 'For Lease';
export const listingTypes: ListingType[] = ['For Sale', 'For Rent', 'For Lease'];

export type PropertyTypeEnum = 'House' | 'Apartment' | 'Condo' | 'Townhouse' | 'Land';
export const propertyTypes: PropertyTypeEnum[] = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land'];


export interface PromotionTierConfig {
  id: string;
  name: string;
  fee: number;
  duration: number;
  description: string;
}

// Updated Property interface to align with the new database schema
export interface Property {
  id: string; // UUID from DB
  title: string;
  description: string;
  price: number;
  listing_type: ListingType; // Column name: listing_type
  location_area_city: string; // Column name: location_area_city
  state: NigerianState;
  address: string;
  property_type: PropertyTypeEnum; // Column name: property_type
  bedrooms: number;
  bathrooms: number;
  area_sq_ft?: number | null; // Nullable in DB
  images?: string[] | null; // JSONB, maps to string[] or null
  amenities?: string[] | null; // JSONB, maps to string[] or null
  year_built?: number | null; // Nullable in DB
  coordinates_lat?: number | null; // Nullable in DB
  coordinates_lng?: number | null; // Nullable in DB
  
  agent_id: string; // UUID of the agent from users table
  agent?: Agent; // Optional: To be populated by client-side join/fetch if needed

  status: PropertyStatus;
  rejection_reason?: string | null; // Nullable in DB

  is_promoted?: boolean | null; // Nullable in DB
  promotion_tier_id?: string | null; // Nullable in DB
  promotion_tier_name?: string | null; // Nullable in DB
  promoted_at?: string | null; // TIMESTAMPTZ, maps to string or null

  created_at: string; // TIMESTAMPTZ from DB
  updated_at: string; // TIMESTAMPTZ from DB
}


export type InquiryStatus = 'new' | 'contacted' | 'resolved' | 'archived';
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
  property_id: string; // This should now be a UUID from the properties table
  property_name: string;
  inquirer_name: string;
  inquirer_email: string;
  inquirer_phone?: string | null;
  initial_message: string; 
  created_at: string; // Mapped from dateReceived
  updated_at?: string; 
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
  predefinedAmenities: string;
}
