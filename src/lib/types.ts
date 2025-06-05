
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
  savedPropertyIds?: string[];
}

export interface PlatformAdmin extends BaseUser {
  role: 'platform_admin';
}

export type AuthenticatedUser = Agent | GeneralUser | PlatformAdmin;

export type PropertyStatus = 'pending' | 'approved' | 'rejected';

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
] as const;

export type NigerianState = typeof nigerianStates[number];

export type ListingType = 'For Sale' | 'For Rent' | 'For Lease';

export interface PromotionTierConfig {
  id: string;
  name: string;
  fee: number;
  duration: number;
  description: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  listingType: ListingType;
  location: string;
  state: NigerianState;
  address: string;
  type: 'House' | 'Apartment' | 'Condo' | 'Townhouse' | 'Land';
  bedrooms: number;
  bathrooms: number;
  areaSqFt?: number;
  images: string[];
  agent: Agent; // In a DB, this would be agent_id and you'd join
  status: PropertyStatus;
  rejectionReason?: string;
  amenities?: string[];
  yearBuilt?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  isPromoted?: boolean;
  promotionDetails?: {
    tierId: string;
    tierName: string;
    promotedAt: string;
  };
}

export type InquiryStatus = 'new' | 'contacted' | 'resolved' | 'archived';

// Matches the inquiry_messages table
export interface InquiryMessage {
  id: string; // UUID from DB
  inquiry_id: string; // UUID from DB
  sender_id: string | null; // UUID from DB (user who sent)
  sender_role: UserRole;
  sender_name: string; // Denormalized
  content: string;
  timestamp: string; // ISO date string from DB
}

// Matches the inquiries table structure
export interface Inquiry {
  id: string; // UUID from DB
  property_id: string;
  property_name: string;
  inquirer_name: string;
  inquirer_email: string;
  inquirer_phone?: string | null;
  initial_message: string; // Renamed from 'message' to match DB
  dateReceived: string; // created_at from DB
  status: InquiryStatus;
  user_id?: string | null; // Link to auth.users if inquirer is registered
  updated_at?: string; // updated_at from DB
  conversation?: InquiryMessage[]; // This will be populated by fetching from inquiry_messages
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
